import type { CatalogFragrance } from "@/data/fragranceCatalog";
import { getWeightedAccordsForCatalog } from "@/data/fragranceCatalog";
import type { TaxonomyId, PerceptualTraitId } from "@/data/taxonomy/types";
import {
  ACCORDS,
  ACCORD_TO_FAMILIES,
  HYBRID_FAMILIES,
  PRIMARY_FAMILIES,
  getAccordSubtypeId,
} from "@/data/taxonomy";
import { accumulateNotesToAccordWeights } from "@/data/taxonomy/noteToAccordRules";
import { normalizeTaxonomyText } from "@/data/taxonomy/normalizeText";

export type AccordActivationSource = "catalog_accord" | "note_rule";

/** One merged activation from catalog strings and/or note→accord rules (Layer 3). */
export type EnrichedAccordActivation = {
  accordId: TaxonomyId;
  weight: number;
  subtypeId?: TaxonomyId;
  sources: AccordActivationSource[];
};

export type FragranceTaxonomyFeatures = {
  /** Distinct accord ids, highest-weight first (backward compatible consumers can still scan this). */
  matchedAccordIds: TaxonomyId[];
  /** Full activation list with Layer 3 subtype ids where defined. */
  accordActivations: EnrichedAccordActivation[];
  /** Unique subtype facet ids present (e.g. creamy woody vs dry woody). */
  subtypeIds: TaxonomyId[];
  primaryFamilyIds: TaxonomyId[];
  hybridFamilyIds: TaxonomyId[];
  /**
   * Trait scores for taxonomy traits (bounded 0..1).
   * Not all traits will be present.
   */
  traitScores: Partial<Record<PerceptualTraitId, number>>;
  /** 0..1 confidence based on activation mass and whether notes contributed. */
  confidence: number;
  /** True when at least one weight came from `notes` + note→accord rules. */
  hasNoteDerivedAccords: boolean;
};

type AccordActivation = { accordId: TaxonomyId; weight: number };

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function normalizeTextForMatch(s: string) {
  return normalizeTaxonomyText(s);
}

/**
 * Builds a synonym index so we can map free-text catalog accords to standardized taxonomy accord IDs.
 * This is intentionally approximate (v1), but deterministic and safe.
 */
function buildAccordSynonymIndex(): Map<string, TaxonomyId> {
  const index = new Map<string, TaxonomyId>();

  for (const accord of Object.values(ACCORDS)) {
    const keys: string[] = [];
    if (accord.label) keys.push(accord.label);
    if (accord.id) keys.push(accord.id);
    if (accord.synonyms?.length) keys.push(...accord.synonyms);

    for (const k of keys) {
      const nk = normalizeTextForMatch(k);
      if (!nk) continue;
      if (!index.has(nk)) index.set(nk, accord.id);
    }
  }

  return index;
}

const ACCORD_SYNONYM_INDEX = buildAccordSynonymIndex();

/**
 * Prefer the longest matching synonym key so "dry woody" beats a shorter "woody" hit when both match.
 */
export function matchCatalogStringToAccordId(normalizedLine: string): TaxonomyId | null {
  const n = normalizedLine;
  if (!n) return null;
  let bestId: TaxonomyId | null = null;
  let bestLen = -1;

  ACCORD_SYNONYM_INDEX.forEach((accordId, synKey) => {
    if (synKey.length < 4) return;
    if (n === synKey || n.includes(synKey) || synKey.includes(n)) {
      const len = synKey.length;
      if (len > bestLen) {
        bestLen = len;
        bestId = accordId;
      }
    }
  });

  return bestId;
}

/** Map a raw user or catalog accord line to a canonical taxonomy accord id (Layer 1–3 ontology). */
export function matchAccordTextToTaxonomyId(raw: string): TaxonomyId | null {
  return matchCatalogStringToAccordId(normalizeTextForMatch(raw));
}

/** Maps weighted catalog accord lines to taxonomy accord ids (uses `weightedAccords` or implicit 1s). */
function buildCatalogAccordActivations(f: CatalogFragrance): AccordActivation[] {
  const weighted = getWeightedAccordsForCatalog(f);
  if (weighted.length === 0) return [];

  const byAccord = new Map<TaxonomyId, number>();
  for (const { label, weight } of weighted) {
    const n = normalizeTextForMatch(label);
    const aid = matchCatalogStringToAccordId(n);
    if (!aid) continue;
    byAccord.set(aid, (byAccord.get(aid) ?? 0) + Math.max(0, weight));
  }

  return Array.from(byAccord.entries()).map(([accordId, w]) => ({ accordId, weight: w }));
}

function mergeCatalogAndNoteActivations(
  catalog: AccordActivation[],
  notePairs: Array<{ accordId: TaxonomyId; weight: number }>
): EnrichedAccordActivation[] {
  const m = new Map<TaxonomyId, { weight: number; sources: Set<AccordActivationSource> }>();

  for (const a of catalog) {
    const e = m.get(a.accordId) ?? { weight: 0, sources: new Set<AccordActivationSource>() };
    e.weight += a.weight;
    e.sources.add("catalog_accord");
    m.set(a.accordId, e);
  }
  for (const a of notePairs) {
    const e = m.get(a.accordId) ?? { weight: 0, sources: new Set<AccordActivationSource>() };
    e.weight += a.weight;
    e.sources.add("note_rule");
    m.set(a.accordId, e);
  }

  return Array.from(m.entries())
    .map(([accordId, v]) => {
      const def = ACCORDS[accordId];
      const subtypeId = def ? getAccordSubtypeId(def) : undefined;
      return {
        accordId,
        weight: v.weight,
        subtypeId,
        sources: Array.from(v.sources) as AccordActivationSource[],
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

function toPlainActivations(enriched: EnrichedAccordActivation[]): AccordActivation[] {
  return enriched.map((e) => ({ accordId: e.accordId, weight: e.weight }));
}

function accumTraitScores(
  activations: AccordActivation[]
): Partial<Record<PerceptualTraitId, number>> {
  const traitScores: Partial<Record<PerceptualTraitId, number>> = {};
  const weightSum = activations.reduce((a, b) => a + b.weight, 0) || 1;

  for (const act of activations) {
    const accord = ACCORDS[act.accordId];
    if (!accord) continue;

    const w = act.weight / weightSum;
    for (const [traitId, delta] of Object.entries(accord.traitDeltas ?? {})) {
      if (!delta) continue;
      const tId = traitId as PerceptualTraitId;
      const current = traitScores[tId] ?? 0;
      traitScores[tId] = current + delta * w;
    }
  }

  for (const [k, v] of Object.entries(traitScores)) {
    traitScores[k as PerceptualTraitId] = clamp01(v as number);
  }

  return traitScores;
}

function topN(ids: TaxonomyId[], byWeight: Map<TaxonomyId, number>, n: number) {
  return ids
    .slice()
    .sort((a, b) => (byWeight.get(b) ?? 0) - (byWeight.get(a) ?? 0))
    .slice(0, n);
}

function computeConfidence(
  activations: EnrichedAccordActivation[],
  hasNoteDerived: boolean
): number {
  const nAcc = activations.length;
  const totalW = activations.reduce((s, a) => s + a.weight, 0);
  return clamp01(
    0.16 +
      0.055 * Math.min(10, nAcc) +
      0.05 * Math.log1p(totalW) +
      (hasNoteDerived ? 0.12 : 0)
  );
}

/**
 * Taxonomy enrichment from catalog accords (optionally weighted), plus raw `notes` via note→accord rules.
 * Backward compatible: fragrances with only `accords: string[]` behave as before (implicit weight 1 per line),
 * with improved synonym matching (longest key wins).
 */
export function getFragranceTaxonomyFeatures(f: CatalogFragrance): FragranceTaxonomyFeatures | null {
  const catalogActs = buildCatalogAccordActivations(f);
  const rawNotes = f.notes ?? [];
  const noteActs =
    rawNotes.length > 0 ? accumulateNotesToAccordWeights(rawNotes) : [];

  const merged = mergeCatalogAndNoteActivations(catalogActs, noteActs);
  if (merged.length === 0) return null;

  const hasNoteDerivedAccords = merged.some((a) => a.sources.includes("note_rule"));
  const plain = toPlainActivations(merged);
  const matchedAccordIds = merged.map((a) => a.accordId);

  const subtypeIds = Array.from(
    new Set(merged.map((a) => a.subtypeId).filter((x): x is TaxonomyId => !!x))
  );

  const weightSum = plain.reduce((a, b) => a + b.weight, 0) || 1;

  const primaryFamilyWeights = new Map<TaxonomyId, number>();
  const hybridFamilyWeights = new Map<TaxonomyId, number>();

  for (const act of plain) {
    const w = act.weight / weightSum;
    const fam = ACCORD_TO_FAMILIES[act.accordId];
    if (!fam) continue;

    for (const pf of fam.primaryFamilies) {
      const current = primaryFamilyWeights.get(pf.primaryFamilyId) ?? 0;
      primaryFamilyWeights.set(pf.primaryFamilyId, current + pf.weight * w);
    }
    for (const hf of fam.hybridFamilies) {
      const current = hybridFamilyWeights.get(hf.hybridFamilyId) ?? 0;
      hybridFamilyWeights.set(hf.hybridFamilyId, current + hf.weight * w);
    }
  }

  const primaryFamilyIds = topN(
    Array.from(primaryFamilyWeights.keys()),
    primaryFamilyWeights,
    3
  );
  const hybridFamilyIds = topN(
    Array.from(hybridFamilyWeights.keys()),
    hybridFamilyWeights,
    2
  );

  const confidence = computeConfidence(merged, hasNoteDerivedAccords);
  const traitScores = accumTraitScores(plain);

  const safePrimary = primaryFamilyIds.filter((id) => !!PRIMARY_FAMILIES[id]);
  const safeHybrid = hybridFamilyIds.filter((id) => !!HYBRID_FAMILIES[id]);

  return {
    matchedAccordIds,
    accordActivations: merged,
    subtypeIds,
    primaryFamilyIds: safePrimary,
    hybridFamilyIds: safeHybrid,
    traitScores,
    confidence,
    hasNoteDerivedAccords,
  };
}
