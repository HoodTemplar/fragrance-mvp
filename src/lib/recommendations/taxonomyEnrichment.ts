import type { CatalogFragrance } from "@/data/fragranceCatalog";
import type { TaxonomyId, PerceptualTraitId } from "@/data/taxonomy/types";
import { ACCORDS, ACCORD_TO_FAMILIES, HYBRID_FAMILIES, PRIMARY_FAMILIES } from "@/data/taxonomy";
import { normalizeTaxonomyText } from "@/data/taxonomy/normalizeText";

export type FragranceTaxonomyFeatures = {
  matchedAccordIds: TaxonomyId[];
  primaryFamilyIds: TaxonomyId[];
  hybridFamilyIds: TaxonomyId[];
  /**
   * Trait scores for taxonomy traits (bounded 0..1).
   * Not all traits will be present.
   */
  traitScores: Partial<Record<PerceptualTraitId, number>>;
  /** 0..1 confidence based on how many accord activations we inferred. */
  confidence: number;
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
      // Prefer first write; ties are rare and weights are used later.
      if (!index.has(nk)) index.set(nk, accord.id);
    }
  }

  return index;
}

const ACCORD_SYNONYM_INDEX = buildAccordSynonymIndex();

function matchCatalogAccordsToTaxonomy(f: CatalogFragrance): AccordActivation[] {
  const catalogAccords = (f.accords ?? []).map((a) => String(a));
  if (catalogAccords.length === 0) return [];

  const activations: AccordActivation[] = [];

  for (const raw of catalogAccords) {
    const n = normalizeTextForMatch(raw);
    if (!n) continue;

    // Exact or prefix/suffix containment matching over normalized strings.
    // This lets us map "citrus" -> "bright citrus" etc, while avoiding too much fuzziness.
    let matchedAccordId: TaxonomyId | null = null;

    ACCORD_SYNONYM_INDEX.forEach((accordId, synKey) => {
      if (matchedAccordId) return;
      if (synKey.length < 4) return;
      if (n === synKey || n.includes(synKey) || synKey.includes(n)) {
        matchedAccordId = accordId;
      }
    });

    if (!matchedAccordId) continue;

    const existing = activations.find((x) => x.accordId === matchedAccordId);
    if (!existing) activations.push({ accordId: matchedAccordId, weight: 1 });
    else existing.weight += 1;
  }

  return activations;
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
      // Trait deltas are already in bounded 0..1-ish range in v1; blend via weighted accumulation.
      traitScores[tId] = current + delta * w;
    }
  }

  // Clamp to 0..1.
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

/**
 * Taxonomy enrichment inferred from the current catalog fields.
 * - Phase 1: only maps catalog `accords` into standardized taxonomy accords.
 * - Families/hybrid families and trait scores come from accord taxonomy definitions.
 */
export function getFragranceTaxonomyFeatures(f: CatalogFragrance): FragranceTaxonomyFeatures | null {
  const activations = matchCatalogAccordsToTaxonomy(f);
  if (activations.length === 0) return null;

  const matchedAccordIds = activations.map((a) => a.accordId);
  const primaryFamilyWeights = new Map<TaxonomyId, number>();
  const hybridFamilyWeights = new Map<TaxonomyId, number>();

  const weightSum = activations.reduce((a, b) => a + b.weight, 0) || 1;

  for (const act of activations) {
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

  // Confidence: how many distinct accord activations we could infer.
  const confidence = clamp01(0.25 + matchedAccordIds.length * 0.18);

  const traitScores = accumTraitScores(activations);

  // Ensure IDs exist in taxonomy so downstream code is safe.
  const safePrimary = primaryFamilyIds.filter((id) => !!PRIMARY_FAMILIES[id]);
  const safeHybrid = hybridFamilyIds.filter((id) => !!HYBRID_FAMILIES[id]);

  return {
    matchedAccordIds,
    primaryFamilyIds: safePrimary,
    hybridFamilyIds: safeHybrid,
    traitScores,
    confidence,
  };
}

