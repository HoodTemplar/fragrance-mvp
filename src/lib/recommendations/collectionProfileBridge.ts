/**
 * Maps AI collection scent profile (dominant / secondary / accent) into engine signals:
 * inferred quiz family, accord tokens for similarity, and match score vs a catalog row.
 */

import type { CatalogFragrance } from "@/data/fragranceCatalog";
import { ACCORDS } from "@/data/taxonomy";
import type { FragranceTaxonomyFeatures } from "./taxonomyEnrichment";

export interface CollectionScentProfileInput {
  dominant: string;
  secondary: string;
  accent: string;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Rich accord-ish tokens extracted only from AI profile lines (not full FAMILY_ACCORDS). */
const PROFILE_LEXICON: ReadonlyArray<{ re: RegExp; tokens: string[] }> = [
  { re: /\b(citrus|bergamot|lemon|lime|orange|neroli|zesty|grapefruit)\b/i, tokens: ["citrus", "bergamot", "fresh"] },
  { re: /\b(aquatic|marine|ocean|sea|ozonic|watery|briny)\b/i, tokens: ["aquatic", "marine", "fresh"] },
  { re: /\b(green|herbal|aromatic|vetiver|galbanum)\b/i, tokens: ["green", "fresh"] },
  { re: /\b(floral|rose|jasmine|iris|lily|violet|ylang)\b/i, tokens: ["floral", "rose"] },
  { re: /\b(woody|wood|cedar|sandalwood|sandal|pine|fir)\b/i, tokens: ["woody", "cedar", "sandalwood"] },
  { re: /\b(oud|agarwood)\b/i, tokens: ["oud", "woody"] },
  { re: /\b(patchouli|earthy|moss)\b/i, tokens: ["patchouli", "woody"] },
  { re: /\b(amber|balsamic|resinous)\b/i, tokens: ["amber", "warm"] },
  { re: /\b(vanilla|tonka|caramel|honey|gourmand|sweet)\b/i, tokens: ["vanilla", "gourmand", "sweet", "tonka"] },
  { re: /\b(spice|spicy|pepper|cardamom|cinnamon|clove)\b/i, tokens: ["spicy", "pepper"] },
  { re: /\b(incense|smoky|smoke)\b/i, tokens: ["incense", "smoky"] },
  { re: /\b(leather|suede)\b/i, tokens: ["leather"] },
  { re: /\b(musk|skin|powder|iris)\b/i, tokens: ["musk", "clean"] },
  { re: /\b(oriental|amber woody)\b/i, tokens: ["oriental", "amber"] },
  { re: /\b(fresh|bright|airy|crisp|clean)\b/i, tokens: ["fresh", "citrus"] },
  { re: /\b(warm|cozy|rich|deep)\b/i, tokens: ["amber", "warm"] },
];

/** Score free text against each quiz family for inference when q1 is missing. */
const FAMILY_SCORE_PATTERNS: Record<"fresh" | "sweet" | "woody" | "spicy", RegExp[]> = {
  fresh: [
    /\b(fresh|citrus|aquatic|marine|green|bright|airy|crisp|clean|zesty|bergamot)\b/i,
    /\b(summer|daytime|office)\b/i,
  ],
  sweet: [
    /\b(sweet|vanilla|gourmand|tonka|caramel|honey|fruity|dessert)\b/i,
    /\b(amber(?!\s*wood)|cozy|rich)\b/i,
  ],
  woody: [
    /\b(woody|wood|cedar|vetiver|sandal|oud|patchouli|earth|forest|moss)\b/i,
    /\b(leather)\b/i,
  ],
  spicy: [
    /\b(spicy|oriental|incense|pepper|oud|smok|amber\s*oriental)\b/i,
    /\b(bold|night|evening)\b/i,
  ],
};

export function extractProfileAccordTokens(profile: CollectionScentProfileInput): string[] {
  const blob = norm(`${profile.dominant} ${profile.secondary} ${profile.accent}`);
  if (!blob || blob === "mixed versatile balanced") return [];

  const out = new Set<string>();
  for (const { re, tokens } of PROFILE_LEXICON) {
    if (re.test(blob)) for (const t of tokens) out.add(t);
  }
  return Array.from(out);
}

/**
 * When quiz q1 is absent (typical upload flow), infer fresh/sweet/woody/spicy from AI profile.
 */
export function inferEngineFamilyFromCollectionProfile(
  profile: CollectionScentProfileInput | undefined,
  quizQ1: string | undefined
): string | undefined {
  const q = (quizQ1 ?? "").trim().toLowerCase();
  if (q === "fresh" || q === "sweet" || q === "woody" || q === "spicy") return q;
  if (!profile) return undefined;

  const blob = norm(`${profile.dominant} ${profile.secondary} ${profile.accent}`);
  if (!blob) return undefined;

  let best: "fresh" | "sweet" | "woody" | "spicy" = "fresh";
  let bestScore = 0;
  for (const fam of ["fresh", "sweet", "woody", "spicy"] as const) {
    let s = 0;
    for (const re of FAMILY_SCORE_PATTERNS[fam]) {
      if (re.test(blob)) s += 1;
    }
    if (s > bestScore) {
      bestScore = s;
      best = fam;
    }
  }
  return bestScore >= 1 ? best : undefined;
}

function dedupeTokens(tokens: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tokens) {
    const k = norm(t);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

/**
 * Base FAMILY_ACCORDS list + tokens from AI profile (deduped).
 */
export function mergeUserAccordsWithProfile(
  familyAccords: string[],
  profileTokens: string[]
): string[] {
  return dedupeTokens([...familyAccords, ...profileTokens]);
}

/**
 * 0..100: how well catalog row reflects the AI-described collection character.
 */
export function scoreFragranceAgainstCollectionProfile(
  f: CatalogFragrance,
  profileTokens: string[],
  taxonomy: FragranceTaxonomyFeatures | null | undefined
): number {
  if (profileTokens.length === 0) return 50;

  const noteLines = (f.notes ?? []).slice(0, 5).map((n) => norm(String(n)));
  const fragBlob = norm(
    [
      f.category,
      f.profileHint,
      f.vibe ?? "",
      ...(f.accords ?? []),
      ...noteLines,
      f.styleCluster ?? "",
    ].join(" ")
  );

  let hits = 0;
  for (const tok of profileTokens) {
    const t = norm(tok);
    if (!t) continue;
    if (fragBlob.includes(t)) hits += 1;
  }
  const recall = hits / profileTokens.length;

  let taxHits = 0;
  if (taxonomy?.accordActivations?.length) {
    const labelBlob = taxonomy.accordActivations
      .slice(0, 8)
      .map((a) => norm(ACCORDS[a.accordId]?.label ?? ""))
      .filter(Boolean)
      .join(" ");
    for (const tok of profileTokens) {
      const t = norm(tok);
      if (t.length >= 3 && labelBlob.includes(t)) taxHits += 1;
    }
  }
  const taxBoost = profileTokens.length > 0 ? (taxHits / profileTokens.length) * 0.35 : 0;

  const base = 12 + recall * 78 + taxBoost * 100;
  return Math.max(0, Math.min(100, Math.round(base)));
}

/** Normalize "Spring" / "spring" / "Fall/Winter" fragments to catalog season tags. */
export function normalizeSeasonHints(hints: string[] | undefined): string[] {
  if (!hints?.length) return [];
  const out = new Set<string>();
  for (const h of hints) {
    const n = norm(h);
    if (!n) continue;
    if (/\bspring\b/.test(n)) out.add("spring");
    if (/\bsummer\b/.test(n)) out.add("summer");
    if (/\bfall\b|\bautumn\b/.test(n)) out.add("fall");
    if (/\bwinter\b/.test(n)) out.add("winter");
    if (/\ball\s*season|year\s*round|four\s*season/.test(n)) {
      ["spring", "summer", "fall", "winter"].forEach((s) => out.add(s));
    }
  }
  return Array.from(out);
}

/** Map AI occasion phrases to catalog occasion tags. */
export function occasionTagsFromHints(hints: string[] | undefined): string[] {
  if (!hints?.length) return [];
  const out = new Set<string>();
  for (const h of hints) {
    const n = norm(h);
    if (!n) continue;
    if (/office|work|professional|9\s*-?\s*5/.test(n)) out.add("office");
    if (/casual|weekend|daytime|everyday|daily/.test(n)) out.add("casual");
    if (/date|romantic/.test(n)) {
      out.add("date");
      out.add("evening");
    }
    if (/evening|night|nightlife|club|party/.test(n)) out.add("evening");
    if (/formal|black\s*tie|event|gala/.test(n)) out.add("formal");
    if (/summer|beach|vacation|heat/.test(n)) out.add("summer");
  }
  return Array.from(out);
}
