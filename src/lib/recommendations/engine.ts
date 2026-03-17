/**
 * Rule-based recommendation engine.
 * Picks 5 fragrances, 2–3 layering ideas, and when-to-wear from catalog using gaps, strengths, and quiz.
 * Uses structured fragrance and user preference profiles for trait alignment and human explanations.
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
import { getFragranceProfile } from "./fragranceProfile";
import { getUserPreferenceProfile } from "./userPreferenceProfile";
import { buildRecommendationExplanation } from "./explanationBuilder";

const BUDGET_MAP: Record<string, BudgetTier> = {
  budget: "budget",
  mid: "mid",
  luxe: "luxe",
  niche: "niche",
};

/** Points per match (stronger matches weighted higher). */
const SCORE_GENDER = 22;
const SCORE_ACCORD_PER_MATCH = 8;
const SCORE_ACCORD_MAX = 20;
const SCORE_SEASON = 10;
const SCORE_OCCASION_PER = 5;
const SCORE_OCCASION_MAX = 14;
const SCORE_VIBE_STRONG = 10;
const SCORE_VIBE_SYNONYM = 6;
const SCORE_PROJECTION = 6;
const SCORE_LONGEVITY = 6;
const SCORE_STYLE_CLUSTER = 12;
const SCORE_PRICE_TIER = 8;
const SCORE_GAP_CATEGORY = 8;
/** Max points from trait alignment (user vs fragrance profile). */
const SCORE_ALIGNMENT_MAX = 40;
/** Penalty when user avoids sweet and fragrance is sweet. */
const PENALTY_AVOID_SWEET = 50;
/** Penalties for mismatches. */
const PENALTY_GENDER_MISMATCH = 18;
const PENALTY_PROJECTION_OPPOSITE = 8;
const PENALTY_LONGEVITY_OPPOSITE = 4;

/** Size of scored candidate pool (top N by score) for role-based selection. */
const CANDIDATE_POOL_SIZE = 100;

/** Recommendation roles: one fragrance per role for a curated set of 5. */
type RecommendationRole = "SAFE" | "BOLD" | "NICHE" | "VERSATILE" | "WILDCARD";
const RECOMMENDATION_ROLES: RecommendationRole[] = ["SAFE", "BOLD", "NICHE", "VERSATILE", "WILDCARD"];

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

/** User vibe <-> catalog vibe: synonym mapping for scoring. */
const VIBE_SYNONYMS: Record<string, string[]> = {
  seductive: ["sensual", "daring", "bold", "dark", "mysterious"],
  adventurous: ["bold", "unusual", "edgy"],
  timeless: ["classic", "refined", "elegant"],
  clean: ["fresh", "minimal", "airy"],
  fresh: ["clean", "airy", "minimal"],
  mysterious: ["dark", "seductive", "bold", "intense"],
  warm: ["spicy", "amber", "cozy", "rich"],
};

/** Returns 2 = exact match, 1 = synonym match, 0 = no match. */
function vibeMatchStrength(userVibe: string, catalogVibe: string): 0 | 1 | 2 {
  if (!userVibe || !catalogVibe) return 0;
  const u = normalize(userVibe);
  const c = normalize(catalogVibe);
  if (u === c) return 2;
  const catalogWords = c.split(/\s+/).filter(Boolean);
  const userSynonyms = VIBE_SYNONYMS[u];
  if (userSynonyms?.some((v) => catalogWords.some((w) => w === v || w.includes(v)))) return 1;
  if (userSynonyms?.some((v) => c === v || c.includes(v))) return 1;
  for (const [quizVal, catalogVals] of Object.entries(VIBE_SYNONYMS)) {
    if (normalize(quizVal) === u && catalogVals.some((v) => c === v || c.includes(v))) return 1;
  }
  return 0;
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

  const catalog = input.catalog ?? FRAGRANCE_CATALOG;
  const avoidSweet = input.avoidSweet ?? false;

  const userPrefProfile = getUserPreferenceProfile({
    family,
    occasion,
    vibe: userVibe,
    avoidSweet,
    projection: userProjection,
  });

  const candidates = catalog.filter((f) => !alreadyOwned(detectedFragrances, f));

  const score = (f: CatalogFragrance): number => {
    let s = 0;

    if (genderPreference !== "open") {
      if (f.gender === genderPreference) s += SCORE_GENDER;
      else if (f.gender !== "unisex") s -= PENALTY_GENDER_MISMATCH;
    }

    if (f.accords?.length && userAccords.length > 0) {
      const matchCount = userAccords.filter((a) =>
        f.accords!.some((c) => normalize(c) === normalize(a) || normalize(c).includes(normalize(a)))
      ).length;
      if (matchCount > 0) s += Math.min(SCORE_ACCORD_MAX, matchCount * SCORE_ACCORD_PER_MATCH);
    }

    if (userPreferredSeasons?.length && f.seasons?.length) {
      const seasonMatch = f.seasons.some((se) =>
        userPreferredSeasons.some((us) => normalize(us) === normalize(se))
      );
      if (seasonMatch) s += SCORE_SEASON;
    }

    const occasionMatches = f.occasions.filter((o) => userOccasions.includes(o));
    if (occasionMatches.length > 0) s += Math.min(SCORE_OCCASION_MAX, occasionMatches.length * SCORE_OCCASION_PER);

    const vibeStrength = f.vibe && userVibe ? vibeMatchStrength(userVibe, f.vibe) : 0;
    if (vibeStrength === 2) s += SCORE_VIBE_STRONG;
    else if (vibeStrength === 1) s += SCORE_VIBE_SYNONYM;

    if (userProjection && f.projection) {
      const proj = normalize(f.projection);
      const userProj = normalize(userProjection);
      if (proj === userProj) s += SCORE_PROJECTION;
      else if (
        (userProj === "intimate" && (proj === "strong" || proj === "bold")) ||
        (userProj === "strong" && (proj === "intimate" || proj === "soft"))
      ) s -= PENALTY_PROJECTION_OPPOSITE;
    }

    if (f.longevity && userLongevityMatch.length > 0) {
      const fragLong = normalize(f.longevity);
      const match = userLongevityMatch.some((l) => normalize(l) === fragLong);
      if (match) s += SCORE_LONGEVITY;
      else if (userLongevityPref === "short" && fragLong === "long") s -= PENALTY_LONGEVITY_OPPOSITE;
    }

    if (userPreferredStyleClusters.length > 0 && userPreferredStyleClusters.includes(f.styleCluster)) s += SCORE_STYLE_CLUSTER;
    if (userPreferredPriceTiers.length > 0 && userPreferredPriceTiers.includes(f.priceTier)) s += SCORE_PRICE_TIER;
    if (missingCategories.length > 0 && categoryMatchesGap(f.category, missingCategories)) s += SCORE_GAP_CATEGORY;

    const fragProfile = getFragranceProfile(f);
    if (avoidSweet && fragProfile.sweetness > 50) s -= PENALTY_AVOID_SWEET;

    const alignment =
      (["freshness", "warmth", "sweetness", "woodiness", "spice", "cleanliness", "sensuality", "versatility"] as const).reduce(
        (sum, key) => sum + Math.max(0, 5 - Math.abs(userPrefProfile[key] - fragProfile[key]) / 20),
        0
      );
    s += Math.min(SCORE_ALIGNMENT_MAX, Math.round(alignment));
    return s;
  };

  const withScores = candidates.map((f) => ({ f, s: score(f) }));
  withScores.sort((a, b) => b.s - a.s);
  const poolSize = Math.min(CANDIDATE_POOL_SIZE, withScores.length);
  const pool = withScores.slice(0, poolSize);

  type Scored = (typeof pool)[number];
  const userContext = {
    family,
    occasion,
    vibe: userVibe ?? "",
    userProjection: userProjection ?? undefined,
    missingCategories,
  };

  const fragProfileCache = new Map<string, ReturnType<typeof getFragranceProfile>>();
  function getCachedProfile(f: CatalogFragrance) {
    if (!fragProfileCache.has(f.id)) fragProfileCache.set(f.id, getFragranceProfile(f));
    return fragProfileCache.get(f.id)!;
  }

  /**
   * Role-based selection: one fragrance per role (SAFE, BOLD, NICHE, VERSATILE, WILDCARD).
   * Roles are assigned by scoring each fragrance on role-specific attributes (projection, longevity,
   * style_cluster, vibe, price_tier, versatility). For each role we pick the best-fitting fragrance
   * from the pool that isn't already picked and isn't too similar to others. Unfilled roles are
   * backfilled from the next best by main score so the final list is always 5 unique, diverse picks.
   */

  /** Role scores 0–100 per role; used to pick the best fragrance for each recommendation role. */
  function computeRoleScores(f: CatalogFragrance, fragProfile: ReturnType<typeof getFragranceProfile>): Record<RecommendationRole, number> {
    const proj = normalize(f.projection ?? "");
    const long = normalize(f.longevity ?? "");
    const cluster = f.styleCluster;
    const occasions = f.occasions ?? [];
    const seasons = f.seasons ?? [];
    const vibe = normalize(f.vibe ?? "");
    const isNichePrice = f.priceTier === "niche" || f.priceTier === "ultra-niche";
    const isNicheBrand = f.designerNiche === "niche";
    const accords = (f.accords ?? []).map((a) => normalize(a));

    let safe = 0;
    if (["daily-office", "fresh-clean"].includes(cluster)) safe += 35;
    if (fragProfile.versatility >= 50) safe += 25;
    if (occasions.length >= 3) safe += 15;
    if (proj === "moderate" || proj === "intimate") safe += 15;
    if (f.priceTier === "designer" || f.priceTier === "luxury") safe += 10;

    let bold = 0;
    if (proj === "strong" || proj === "bold") bold += 30;
    if (long === "long") bold += 20;
    if (["date-night", "spicy-oriental", "dark-woody"].includes(cluster)) bold += 25;
    if (/bold|seductive|intense|powerful|opulent/.test(vibe)) bold += 25;

    let niche = 0;
    if (isNichePrice) niche += 35;
    if (isNicheBrand) niche += 25;
    if (cluster === "luxury-niche") niche += 25;
    if (/artistic|unique|refined|opulent/.test(vibe)) niche += 15;

    let versatile = 0;
    if (occasions.length >= 3) versatile += 25;
    if (seasons.length >= 2) versatile += 20;
    if (fragProfile.versatility >= 60) versatile += 30;
    if (accords.length >= 3) versatile += 25;

    let wildcard = 0;
    const primaryRoleScore = Math.max(safe, bold, niche, versatile);
    if (primaryRoleScore < 60) wildcard += 40;
    if (accords.some((a) => /oud|incense|leather|unusual|smoky/.test(a))) wildcard += 25;
    if (fragProfile.versatility >= 40 && fragProfile.versatility <= 70) wildcard += 20;
    wildcard += Math.min(15, accords.length * 3);

    return {
      SAFE: Math.min(100, safe),
      BOLD: Math.min(100, bold),
      NICHE: Math.min(100, niche),
      VERSATILE: Math.min(100, versatile),
      WILDCARD: Math.min(100, wildcard),
    };
  }

  /** True if f is too similar to any already-picked (same brand+cluster, or same category + heavy accord overlap). */
  function isTooSimilar(f: CatalogFragrance, pickedSoFar: CatalogFragrance[]): boolean {
    const fAccords = new Set((f.accords ?? []).map((a) => normalize(a)));
    const fCat = normalize(f.category ?? "");
    for (const p of pickedSoFar) {
      if (p.brand === f.brand && p.styleCluster === f.styleCluster) return true;
      const pCat = normalize(p.category ?? "");
      if (fCat === pCat) {
        const pAccords = (p.accords ?? []).map((a) => normalize(a));
        const overlap = pAccords.filter((a) => fAccords.has(a)).length;
        if (overlap >= 2) return true;
      }
    }
    return false;
  }

  function canonicalKey(p: { brand: string; name: string }): string {
    return `${normalize(p.brand)}|${normalize(p.name)}`;
  }

  const usedIds = new Set<string>();
  const usedKeys = new Set<string>();
  const pickedFragrances: CatalogFragrance[] = [];
  const picked: PickedFragrance[] = [];
  const maxMainScore = pool.length ? Math.max(...pool.map((x) => x.s)) : 0;
  const minMainScore = pool.length ? Math.min(...pool.map((x) => x.s)) : 0;
  const mainScoreRange = Math.max(1, maxMainScore - minMainScore);

  for (const role of RECOMMENDATION_ROLES) {
    const available = pool.filter(
      ({ f }) =>
        !usedIds.has(f.id) &&
        !usedKeys.has(canonicalKey(f)) &&
        !isTooSimilar(f, pickedFragrances)
    );
    if (available.length === 0) continue;

    const withRoleScores = available.map((scored) => {
      const profile = getCachedProfile(scored.f);
      const roleScores = computeRoleScores(scored.f, profile);
      const roleScore = roleScores[role];
      const normalizedMain = (scored.s - minMainScore) / mainScoreRange;
      const combined = roleScore * 0.6 + normalizedMain * 100 * 0.4;
      return { scored, roleScore, combined, mainScore: scored.s };
    });

    const usedBrandsSoFar = new Set(pickedFragrances.map((x) => x.brand));
    withRoleScores.sort((a, b) => {
      if (Math.abs(a.combined - b.combined) > 1) return b.combined - a.combined;
      const preferNewBrand = (sc: Scored) => (usedBrandsSoFar.has(sc.f.brand) ? 0 : 1);
      const brandDiff = preferNewBrand(b.scored) - preferNewBrand(a.scored);
      if (brandDiff !== 0) return brandDiff;
      return b.mainScore - a.mainScore;
    });

    const best = withRoleScores[0];
    if (best && best.roleScore >= 20) {
      const { f } = best.scored;
      usedIds.add(f.id);
      usedKeys.add(canonicalKey(f));
      pickedFragrances.push(f);
      const reason = buildRecommendationExplanation(userContext, f, getCachedProfile(f));
      picked.push({ id: f.id, name: f.name, brand: f.brand, category: f.category, reason });
    }
  }

  for (const { f } of pool) {
    if (picked.length >= 5) break;
    if (usedIds.has(f.id) || usedKeys.has(canonicalKey(f)) || isTooSimilar(f, pickedFragrances)) continue;
    usedIds.add(f.id);
    usedKeys.add(canonicalKey(f));
    pickedFragrances.push(f);
    const reason = buildRecommendationExplanation(userContext, f, getCachedProfile(f));
    picked.push({ id: f.id, name: f.name, brand: f.brand, category: f.category, reason });
  }

  while (picked.length < 5 && candidates.length > 0) {
    const next = candidates.find(
      (f) => !usedIds.has(f.id) && !usedKeys.has(canonicalKey(f)) && !isTooSimilar(f, pickedFragrances)
    );
    if (!next) break;
    usedIds.add(next.id);
    usedKeys.add(canonicalKey(next));
    pickedFragrances.push(next);
    const reason = buildRecommendationExplanation(userContext, next, getCachedProfile(next));
    picked.push({ id: next.id, name: next.name, brand: next.brand, category: next.category, reason });
  }

  // Deduplicate by id and by (brand, name) so the same fragrance never appears twice (e.g. catalog has "naxos" and "xerjoff-naxos")
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const unique: PickedFragrance[] = [];
  for (const p of picked) {
    const key = canonicalKey(p);
    if (seenIds.has(p.id) || seenKeys.has(key)) continue;
    seenIds.add(p.id);
    seenKeys.add(key);
    unique.push(p);
  }

  // Backfill to exactly 5 from next highest-ranked (withScores order), preserving diversity by taking best-available
  for (const { f } of withScores) {
    if (unique.length >= 5) break;
    const key = canonicalKey(f);
    if (seenIds.has(f.id) || seenKeys.has(key)) continue;
    seenIds.add(f.id);
    seenKeys.add(key);
    const fragProfile = getFragranceProfile(f);
    const reason = buildRecommendationExplanation(userContext, f, fragProfile);
    unique.push({ id: f.id, name: f.name, brand: f.brand, category: f.category, reason });
  }

  const pickedFinal = unique.slice(0, 5);

  const layering: LayeringSuggestionRaw[] = [];
  const detectedNames = detectedFragrances.map((d) => `${d.brand} ${d.name}`);
  if (detectedNames.length >= 1 && pickedFinal.length >= 1) {
    layering.push({
      first: detectedNames[0],
      second: `${pickedFinal[0].brand} ${pickedFinal[0].name}`,
      reason: "Use your existing bottle as base and add the recommended one for a day-to-evening transition.",
    });
  }
  if (hasCategory.has("Woody") && pickedFinal.some((p) => p.category.toLowerCase().includes("fresh"))) {
    const freshPick = pickedFinal.find((p) => p.category.toLowerCase().includes("fresh") || p.category.toLowerCase().includes("citrus"));
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
  if (hasCategory.has("Fresh") || pickedFinal.some((p) => p.category.toLowerCase().includes("fresh"))) {
    whenToWear.push({ occasion: "Office", tip: "Reach for your fresh or citrus options for a professional, approachable scent." });
  }
  if (
    hasCategory.has("Woody") ||
    pickedFinal.some((p) => p.category.toLowerCase().includes("wood"))
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

  return { fragrances: pickedFinal, layering: layeringFinal, whenToWear: whenFinal };
}
