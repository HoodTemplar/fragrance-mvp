/**
 * Rule-based recommendation engine.
 * Picks 5 fragrances, 2–3 layering ideas, and when-to-wear from catalog using gaps, strengths, and quiz.
 */

import {
  FRAGRANCE_CATALOG,
  categoryMatchesGap,
  type CatalogFragrance,
  type BudgetTier,
  type StyleCluster,
  type PriceTier,
} from "@/data/fragranceCatalog";
import type {
  RecommendationInput,
  RecommendationEngineOutput,
  PickedFragrance,
  LayeringSuggestionRaw,
  WhenToWearRaw,
} from "./types";

const BUDGET_MAP: Record<string, BudgetTier> = {
  budget: "budget",
  mid: "mid",
  luxe: "luxe",
  niche: "niche",
};

/** Points per match (user-requested scoring). */
const SCORE_GENDER = 20;
const SCORE_ACCORD = 10;
const SCORE_SEASON = 8;
const SCORE_OCCASION = 8;
const SCORE_VIBE = 6;
const SCORE_PROJECTION = 4;
const SCORE_LONGEVITY = 4;
const SCORE_STYLE_CLUSTER = 10;
const SCORE_PRICE_TIER = 8;

/** Quiz q1 (family) -> style clusters that match (e.g. fresh -> fresh-clean). */
const FAMILY_STYLE_CLUSTERS: Record<string, StyleCluster[]> = {
  fresh: ["fresh-clean"],
  sweet: ["sweet-gourmand"],
  woody: ["dark-woody"],
  spicy: ["spicy-oriental"],
};

/** Quiz q2 (occasion) -> style clusters that match. */
const OCCASION_STYLE_CLUSTERS: Record<string, StyleCluster[]> = {
  daily: ["daily-office"],
  nightlife: ["date-night"],
  date: ["date-night"],
  all: ["daily-office", "date-night"],
};

/** Quiz q4 (budget) -> preferred price tiers for scoring. */
const BUDGET_PRICE_TIERS: Record<string, PriceTier[]> = {
  budget: ["budget"],
  mid: ["designer"],
  luxe: ["luxury", "designer"],
  niche: ["niche", "ultra-niche"],
};

/** Quiz q1 (family) -> accords we consider a match for accord scoring. */
const FAMILY_ACCORDS: Record<string, string[]> = {
  fresh: ["citrus", "fresh", "aquatic", "green", "marine", "bergamot"],
  sweet: ["vanilla", "amber", "gourmand", "sweet", "tonka", "caramel"],
  woody: ["woody", "sandalwood", "cedar", "vetiver", "wood", "oud"],
  spicy: ["spicy", "oud", "incense", "oriental", "pepper", "leather"],
};

/** Quiz q2 (occasion) -> occasion tags we look for in catalog. */
const OCCASION_TAGS: Record<string, string[]> = {
  daily: ["office", "casual"],
  nightlife: ["evening"],
  date: ["date"],
  all: ["office", "casual", "date", "evening", "formal", "summer"],
};

/** Quiz q9 (longevity) -> catalog longevity values we consider a match. */
const LONGEVITY_MAP: Record<string, string[]> = {
  short: ["short"],
  day: ["moderate", "long"],
  trail: ["long"],
};

/** Quiz q8 (vibe) and catalog vibe: normalize so "seductive" matches "sensual", "timeless" matches "classic"/"refined", etc. */
function vibeMatches(userVibe: string, catalogVibe: string): boolean {
  if (!userVibe || !catalogVibe) return false;
  const u = normalize(userVibe);
  const c = normalize(catalogVibe);
  if (u === c) return true;
  const synonyms: Record<string, string[]> = {
    seductive: ["sensual", "daring", "bold"],
    adventurous: ["bold", "unusual", "edgy"],
    timeless: ["classic", "refined", "elegant"],
    clean: ["fresh", "minimal"],
  };
  for (const [quizVal, catalogVals] of Object.entries(synonyms)) {
    if (normalize(quizVal) === u && catalogVals.some((v) => c === v || c.includes(v))) return true;
  }
  return false;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Fisher–Yates shuffle (mutates array). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** True if this catalog fragrance is already in the user's detected collection (exclude from recommendations). */
function alreadyOwned(detected: { name: string; brand: string }[], f: CatalogFragrance): boolean {
  const catalogKey = `${normalize(f.brand)} ${normalize(f.name)}`;
  const catalogNameOnly = normalize(f.name);
  return detected.some((d) => {
    const detectedKey = `${normalize(d.brand)} ${normalize(d.name)}`;
    if (detectedKey === catalogKey) return true;
    if (normalize(d.name) === catalogNameOnly) return true;
    return false;
  });
}

/** Infer categories present in collection from detected names/brands (simple keywords) */
function inferredCategories(detected: { name: string; brand: string }[]): Set<string> {
  const set = new Set<string>();
  const t = detected.map((d) => `${d.name} ${d.brand}`).join(" ").toLowerCase();
  if (/\b(fresh|aquatic|acqua|citrus|bleu|light)\b/.test(t)) set.add("Fresh");
  if (/\b(wood|santal|cedar|vetiver|terre|oud)\b/.test(t)) set.add("Woody");
  if (/\b(flower|floral|rose)\b/.test(t)) set.add("Floral");
  if (/\b(amber|vanilla|gourmand)\b/.test(t)) set.add("Amber");
  if (/\b(leather|ombre)\b/.test(t)) set.add("Leather");
  if (/\b(oriental|spice|oud)\b/.test(t)) set.add("Oriental");
  if (/\b(green|herb)\b/.test(t)) set.add("Green");
  return set;
}

export function runRecommendationEngine(input: RecommendationInput): RecommendationEngineOutput {
  const {
    detectedFragrances,
    missingCategories,
    strengths,
    weaknesses,
    quizAnswers = {},
    genderPreference: inputGender,
    userPreferredSeasons,
    userProjection,
    userPreferredPriceTiers: inputPriceTiers,
  } = input;

  const hasCategory = inferredCategories(detectedFragrances);
  const family = (quizAnswers.q1 ?? "fresh") as string;
  const occasion = (quizAnswers.q2 ?? "daily") as string;
  const genderPreference = (inputGender ?? quizAnswers.q11 ?? "open") as "masculine" | "feminine" | "unisex" | "open";

  const userAccords = FAMILY_ACCORDS[family] ?? FAMILY_ACCORDS.fresh;
  const userOccasions = OCCASION_TAGS[occasion] ?? OCCASION_TAGS.daily;
  const userVibe = normalize(quizAnswers.q8 ?? "");
  const userLongevityPref = (quizAnswers.q9 ?? "day") as string;
  const userLongevityMatch = LONGEVITY_MAP[userLongevityPref] ?? LONGEVITY_MAP.day;

  const familyClusters = FAMILY_STYLE_CLUSTERS[family] ?? [];
  const occasionClusters = OCCASION_STYLE_CLUSTERS[occasion] ?? [];
  const nicheCluster = (quizAnswers.q5 === "niche" ? ["luxury-niche" as StyleCluster] : []);
  const userPreferredStyleClusters = Array.from(new Set<StyleCluster>([...familyClusters, ...occasionClusters, ...nicheCluster]));

  const budgetFromQuiz = (quizAnswers.q4 ?? "mid") as string;
  const userPreferredPriceTiers = inputPriceTiers?.length
    ? (inputPriceTiers as PriceTier[])
    : (BUDGET_PRICE_TIERS[budgetFromQuiz] ?? BUDGET_PRICE_TIERS.mid);

  const candidates = FRAGRANCE_CATALOG.filter((f) => !alreadyOwned(detectedFragrances, f));

  const score = (f: CatalogFragrance): number => {
    let s = 0;
    if (genderPreference !== "open" && f.gender === genderPreference) s += SCORE_GENDER;
    if (f.accords?.length && userAccords.some((a) => f.accords!.some((c) => normalize(c) === normalize(a)))) s += SCORE_ACCORD;
    if (userPreferredSeasons?.length && f.seasons?.length && f.seasons.some((se) => userPreferredSeasons.some((us) => normalize(us) === normalize(se)))) s += SCORE_SEASON;
    if (f.occasions.some((o) => userOccasions.includes(o))) s += SCORE_OCCASION;
    if (f.vibe && userVibe && vibeMatches(userVibe, f.vibe)) s += SCORE_VIBE;
    if (userProjection && f.projection && normalize(f.projection) === normalize(userProjection)) s += SCORE_PROJECTION;
    if (f.longevity && userLongevityMatch.some((l) => normalize(f.longevity!) === normalize(l))) s += SCORE_LONGEVITY;
    if (userPreferredStyleClusters.length > 0 && userPreferredStyleClusters.includes(f.styleCluster)) s += SCORE_STYLE_CLUSTER;
    if (userPreferredPriceTiers.length > 0 && userPreferredPriceTiers.includes(f.priceTier)) s += SCORE_PRICE_TIER;
    if (missingCategories.length > 0 && categoryMatchesGap(f.category, missingCategories)) s += 5;
    return s;
  };

  const withScores = candidates.map((f) => ({ f, s: score(f) }));
  withScores.sort((a, b) => b.s - a.s);
  const maxScore = withScores.length > 0 ? withScores[0].s : 0;
  const topTier = maxScore <= 0 ? withScores : withScores.filter(({ s }) => s >= maxScore - 10);
  const pool = topTier.length > 10 ? topTier.slice(0, 12) : topTier;
  const shuffled = shuffle([...pool]);
  const picked: PickedFragrance[] = [];
  const usedIds = new Set<string>();

  for (const { f } of shuffled) {
    if (picked.length >= 5) break;
    if (usedIds.has(f.id)) continue;
    usedIds.add(f.id);
    let reason = "Fits your profile.";
    if (missingCategories.length > 0 && categoryMatchesGap(f.category, missingCategories)) reason = `Fills a gap: ${f.category}.`;
    else if (family === "fresh" && (f.category.toLowerCase().includes("fresh") || f.category.toLowerCase().includes("aquatic"))) reason = "Matches your preference for fresh, clean scents.";
    else if (family === "woody") reason = "Deepens your woody range with a different take.";
    else if (occasion === "daily" && f.occasions.includes("office")) reason = "Ideal for daily and office wear.";
    else if (occasion === "date" && f.occasions.includes("date")) reason = "Strong option for date night.";
    picked.push({ id: f.id, name: f.name, brand: f.brand, category: f.category, reason });
  }

  while (picked.length < 5 && candidates.length > 0) {
    const next = candidates.find((f) => !usedIds.has(f.id));
    if (!next) break;
    usedIds.add(next.id);
    picked.push({ id: next.id, name: next.name, brand: next.brand, category: next.category, reason: "A versatile addition to consider." });
  }

  const layering: LayeringSuggestionRaw[] = [];
  const detectedNames = detectedFragrances.map((d) => `${d.brand} ${d.name}`);
  if (detectedNames.length >= 1 && picked.length >= 1) {
    layering.push({
      first: detectedNames[0],
      second: `${picked[0].brand} ${picked[0].name}`,
      reason: "Use your existing bottle as base and add the recommended one for a day-to-evening transition.",
    });
  }
  if (hasCategory.has("Woody") && picked.some((p) => p.category.toLowerCase().includes("fresh"))) {
    const freshPick = picked.find((p) => p.category.toLowerCase().includes("fresh") || p.category.toLowerCase().includes("citrus"));
    if (freshPick) layering.push({
      first: freshPick.name,
      second: "one of your woody bottles",
      reason: "Layer a fresh top with your woody base for a balanced, all-day scent.",
    });
  }
  if (detectedNames.length >= 2) {
    layering.push({
      first: detectedNames[0],
      second: detectedNames[1],
      reason: "Try layering two of your current favorites for a unique combination.",
    });
  }
  const layeringFinal = layering.slice(0, 3);

  const whenToWear: WhenToWearRaw[] = [];
  if (hasCategory.has("Fresh") || picked.some((p) => p.category.toLowerCase().includes("fresh"))) {
    whenToWear.push({ occasion: "Office", tip: "Reach for your fresh or citrus options for a professional, approachable scent." });
  }
  if (
    hasCategory.has("Woody") ||
    picked.some((p) => p.category.toLowerCase().includes("wood"))
  ) {
    whenToWear.push({
      occasion: "Date night",
      tip: "Your deeper woody or amber options work well for evening.",
    });
  }
  
  if (missingCategories.some((g) => /fresh|aquatic|summer/i.test(g))) {
    whenToWear.push({
      occasion: "Summer",
      tip: "Consider adding one of the recommended fresh or aquatic options for heat-friendly wear.",
    });
  }
  
  whenToWear.push({
    occasion: "Weekend",
    tip: "Your versatile, all-season picks are ideal for casual days.",
  });
  if (whenToWear.length < 3 && strengths.length > 0) {
    whenToWear.push({ occasion: "When it matters", tip: "Lean on your strengths—use the categories you already have variety in." });
  }
  const whenFinal = whenToWear.slice(0, 5);

  return { fragrances: picked, layering: layeringFinal, whenToWear: whenFinal };
}
