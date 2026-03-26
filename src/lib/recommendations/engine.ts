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

/** When catalog lookup fails, use neutral scores so role assignment still yields a full permutation. */
const NEUTRAL_ROLE_SCORES: Record<RecommendationRole, number> = {
  SAFE: 50,
  BOLD: 50,
  NICHE: 50,
  VERSATILE: 50,
  WILDCARD: 50,
};

/** All n-length permutations without repetition (n ≤ elements.length). Small n only. */
function permutationsOfLength<T>(elements: T[], n: number): T[][] {
  if (n === 0) return [[]];
  if (n > elements.length) return [];
  const out: T[][] = [];
  function dfs(prefix: T[], remaining: T[]) {
    if (prefix.length === n) {
      out.push([...prefix]);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      dfs([...prefix, remaining[i]], remaining.filter((_, j) => j !== i));
    }
  }
  dfs([], elements);
  return out;
}

/**
 * One-to-one assignment of distinct roles to each slot that maximizes total role-fit score.
 * Avoids greedy order bias (SAFE-first no longer steals the globally best BOLD candidate).
 */
function assignRolesOptimal(roleScoresByIndex: Array<Record<RecommendationRole, number> | null>): RecommendationRole[] {
  const n = roleScoresByIndex.length;
  if (n === 0) return [];

  const scores = roleScoresByIndex.map((rs) => rs ?? NEUTRAL_ROLE_SCORES);

  if (n === 1) {
    let bestRole: RecommendationRole = "SAFE";
    let best = -Infinity;
    for (const role of RECOMMENDATION_ROLES) {
      const s = scores[0][role];
      if (s > best) {
        best = s;
        bestRole = role;
      }
    }
    return [bestRole];
  }

  if (n > RECOMMENDATION_ROLES.length) {
    return assignRolesOptimal(roleScoresByIndex.slice(0, RECOMMENDATION_ROLES.length));
  }

  const perms = permutationsOfLength(RECOMMENDATION_ROLES, n);
  let bestPerm: RecommendationRole[] | null = null;
  let bestSum = -Infinity;

  for (const perm of perms) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += scores[i][perm[i]];
    if (sum > bestSum) {
      bestSum = sum;
      bestPerm = perm;
    } else if (sum === bestSum && bestPerm) {
      const a = perm.join(",");
      const b = bestPerm.join(",");
      if (a < b) bestPerm = perm;
    }
  }

  return bestPerm ?? Array.from({ length: n }, (_, i) => RECOMMENDATION_ROLES[i]);
}

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
  // Keep "daily" broad enough to include professional/formal-leaning scents.
  daily: ["office", "casual", "formal"],
  // Nightlife often overlaps with "evening" and "date" wearing.
  nightlife: ["evening", "date"],
  // Date-night commonly includes both "date" and "evening".
  date: ["date", "evening"],
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
  seductive: ["sensual", "romantic", "daring", "attractive", "glamorous", "intimate", "warm", "bold", "dark", "mysterious"],
  adventurous: ["adventurous", "bold", "unusual", "edgy", "sporty", "dynamic", "iconic"],
  timeless: ["classic", "refined", "elegant", "sophisticated", "tailored", "polished", "iconic", "luxurious", "modern"],
  clean: ["fresh", "minimal", "airy", "crisp", "clean", "soapy", "musky", "polished", "light"],
  fresh: ["clean", "airy", "minimal", "crisp", "fresh"],
  mysterious: ["dark", "seductive", "bold", "intense", "noir", "mysterious", "smoky", "leathery", "opulent"],
  warm: ["spicy", "amber", "cozy", "rich", "warm", "balsamic", "resinous"],
};

/** Returns 2 = exact match, 1 = synonym match, 0 = no match. */
function vibeMatchStrength(userVibe: string, catalogVibe: string): 0 | 1 | 2 {
  if (!userVibe || !catalogVibe) return 0;
  const u = normalize(userVibe);
  const c = normalize(catalogVibe);
  if (u === c) return 2;
  if (c.includes(u)) return 2;
  // Split into words and also consider hyphenated/compound vibes.
  const catalogWords = c.split(/[\s/,-]+/).filter(Boolean);
  const userSynonyms = VIBE_SYNONYMS[u];
  if (userSynonyms?.some((v) => catalogWords.some((w) => w === v || w.includes(v) || v.includes(w)))) return 1;
  if (userSynonyms?.some((v) => c === v || c.includes(v) || v.includes(c))) return 1;
  for (const [quizVal, catalogVals] of Object.entries(VIBE_SYNONYMS)) {
    if (normalize(quizVal) === u && catalogVals.some((v) => c === v || c.includes(v))) return 1;
  }
  return 0;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildCatalogVibeText(f: CatalogFragrance): string {
  // Many DB rows have sparse `vibe`. For matching only, we blend in other stable signals
  // so vibe matching doesn't silently collapse to "no match".
  const accords = (f.accords ?? []).join(" ");
  const parts = [f.vibe ?? "", f.category ?? "", accords, f.styleCluster ?? ""];
  return normalize(parts.filter(Boolean).join(" "));
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
  const userLongevityNumeric = userLongevityPref === "short" ? 1 : userLongevityPref === "trail" ? 5 : 3;
  const q7Turnoff = (quizAnswers.q7 ?? "") as string;

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

  const candidates = catalog.filter((f) => !alreadyOwned(detectedFragrances, f));

  // --- Fragrance Intelligence Model (FIM) helpers ---
  type TextureToken = "airy" | "watery" | "creamy" | "resinous" | "dry" | "powdery" | "smoky" | "leathery" | "musky";
  type FamiliarityToken = "mass_appeal" | "distinctive" | "niche_collectable" | "challenging";
  type ScentFamilyToken = "fresh" | "sweet" | "woody" | "spicy";

  const quizQ5 = quizAnswers.q5 ?? "both";

  const userIntensityNumeric = (() => {
    const p = normalize(userProjection ?? "");
    if (p === "intimate") return 1;
    if (p === "moderate" || p === "soft") return 2;
    if (p === "strong") return 3;
    if (p === "bold") return 4;
    return 2;
  })();

  const userTexture: TextureToken = (() => {
    const v = normalize(userVibe ?? "");
    if (v === "clean") return "musky";
    if (v === "warm") return "resinous";
    if (v === "mysterious") return "smoky";
    if (family === "fresh") return "airy";
    if (family === "sweet") return "creamy";
    if (family === "woody") return "dry";
    if (family === "spicy") return "resinous";
    return "airy";
  })();

  const userFamiliarity: FamiliarityToken = (() => {
    if (quizQ5 === "niche") return "niche_collectable";
    if (quizQ5 === "designer") return "mass_appeal";
    return "distinctive";
  })();

  function whenToWearLabel(f: CatalogFragrance): string {
    const occs = new Set((f.occasions ?? []).map((o) => normalize(o)));
    const hasAny = (...tags: string[]) => tags.some((t) => occs.has(normalize(t)));
    if (hasAny("date", "evening")) return "Date nights & evenings";
    if (hasAny("formal")) return "Formal occasions";
    if (hasAny("office", "casual")) return "Office & everyday wear";
    if (hasAny("summer")) return "Spring/summer wear";
    return "Multi-setting wear";
  }

  function deriveProjectionNumeric(f: CatalogFragrance): number {
    const p = normalize(f.projection ?? "");
    if (p === "intimate") return 1;
    if (p === "moderate" || p === "soft") return 2;
    if (p === "strong") return 3;
    if (p === "bold") return 4;
    return 2;
  }

  function deriveLongevityNumeric(f: CatalogFragrance): number {
    const l = normalize(f.longevity ?? "");
    if (l === "short") return 1;
    if (l === "moderate") return 3;
    if (l === "long") return 5;
    return 3;
  }

  function deriveTextureToken(f: CatalogFragrance): TextureToken {
    const cat = normalize(f.category ?? "");
    const accords = (f.accords ?? []).map((a) => normalize(a));
    const vibe = normalize(f.vibe ?? "");

    const has = (needle: string | RegExp) => {
      if (typeof needle === "string") return accords.some((a) => a.includes(needle)) || cat.includes(needle);
      return accords.some((a) => needle.test(a)) || needle.test(cat);
    };

    if (has("aquatic") || has("marine") || has(/sea salt|acqua|ocean/)) return "watery";
    if (has("iris") || cat.includes("iris")) return "powdery";
    if (has(/smoky|incense|oriental/)) return "smoky";
    if (has("leather") || has("suede") || cat.includes("leather")) return "leathery";
    if (has("amber") || has("oud") || has("incense") || cat.includes("oriental")) return "resinous";
    if (has("vanilla") || has("gourmand") || has("tonka") || has("caramel") || has("milk") || has("coconut")) return "creamy";
    if (has("musk") || vibe.includes("clean") || vibe.includes("minimal") || has("clean")) return "musky";
    if (has(/wood|woody|cedar|vetiver|sandal|oud/)) return "dry";
    if (cat.includes("fresh") || cat.includes("citrus") || vibe.includes("fresh")) return "airy";
    return "dry";
  }

  function deriveScentFamilyToken(f: CatalogFragrance): ScentFamilyToken {
    const cat = normalize(f.category ?? "");
    const accords = (f.accords ?? []).map((a) => normalize(a));

    const hasFresh =
      accords.some((a) => ["citrus", "fresh", "aquatic", "green", "marine", "bergamot", "pineapple", "neroli"].some((t) => a.includes(t))) ||
      cat.includes("fresh") ||
      cat.includes("aquatic") ||
      cat.includes("citrus");

    const hasSweet =
      accords.some((a) => ["vanilla", "amber", "gourmand", "sweet", "tonka", "caramel", "milk", "coconut", "peach"].some((t) => a.includes(t))) ||
      /amber|gourmand|vanilla|sweet/.test(cat);

    const hasWoody =
      accords.some((a) => ["woody", "wood", "sandalwood", "cedar", "vetiver", "oud"].some((t) => a.includes(t))) ||
      /woody|wood|oud|sandalwood|cedar/.test(cat);

    const hasSpicy =
      accords.some((a) => ["spicy", "oriental", "pepper", "incense", "leather", "smoky", "oud"].some((t) => a.includes(t))) ||
      /spicy|oriental/.test(cat);

    if (hasFresh) return "fresh";
    if (hasSweet) return "sweet";
    if (hasWoody && !hasSpicy) return "woody";
    if (hasWoody && hasSpicy) return "spicy";
    if (hasSpicy) return "spicy";
    return "fresh";
  }

  function deriveFamiliarityToken(f: CatalogFragrance): FamiliarityToken {
    const texture = deriveTextureToken(f);
    const accords = (f.accords ?? []).map((a) => normalize(a));
    const proj = deriveProjectionNumeric(f);
    const lon = deriveLongevityNumeric(f);
    const challengingAccords = accords.some((a) => /oud|incense|leather|smoky|unusual/.test(a));
    if (challengingAccords && (proj >= 3 || lon >= 5)) return "challenging";

    const isNiche = f.priceTier === "niche" || f.priceTier === "ultra-niche" || f.designerNiche === "niche";
    if (isNiche) return "niche_collectable";

    const isMass = f.priceTier === "budget" || f.priceTier === "designer" || f.priceTier === "luxury";
    if (isMass) return texture === "resinous" || texture === "smoky" ? "distinctive" : "mass_appeal";

    return "distinctive";
  }

  function textureGroup(t: TextureToken): "fresh" | "warm" | "wood" | "smoke" | "powder" | "leather" | "musky" {
    if (t === "airy" || t === "watery") return "fresh";
    if (t === "creamy" || t === "resinous") return "warm";
    if (t === "dry") return "wood";
    if (t === "smoky") return "smoke";
    if (t === "powdery") return "powder";
    if (t === "leathery") return "leather";
    return "musky";
  }

  const score = (f: CatalogFragrance): number => {
    // --- FIM multi-dimensional scoring ---
    // Dimensions:
    // - scent_family (dominant): accord overlap vs the user's family accord set
    // - vibe (dominant): exact/synonym vibe match
    // - texture: derived from catalog accords/vibe
    // - setting: occasion tag intersection
    // - intensity: projection numeric proximity
    // - season: preferred seasons overlap
    // - familiarity: mass_appeal vs distinctive vs niche vs challenging

    const accords = (f.accords ?? []).map((a) => normalize(a));

    // 1) scent_family (continuous similarity to reduce score ties)
    const userAccordSet = new Set(userAccords.map((a) => normalize(a)));
    const fragAccordSet = new Set(accords.map((a) => normalize(a)));
    let intersection = 0;
    userAccordSet.forEach((ua) => {
      if (Array.from(fragAccordSet).some((fa) => fa === ua || fa.includes(ua) || ua.includes(fa))) intersection += 1;
    });
    const union = Math.max(1, userAccordSet.size + fragAccordSet.size - intersection);
    const jaccard = intersection / union; // 0..1
    const scentFamilyScore = Math.round(15 + 85 * jaccard);

    // 2) vibe
    const vibeStrength = userVibe ? vibeMatchStrength(userVibe, buildCatalogVibeText(f)) : 0;
    // Add small extra resolution based on how much of the vibe text overlaps with synonyms.
    const vibeText = buildCatalogVibeText(f);
    const vibeWords = vibeText.split(/[\s/,-]+/).filter(Boolean);
    const synonymWords = (VIBE_SYNONYMS[userVibe] ?? []).map((x) => normalize(x));
    const synonymHits = synonymWords.filter((syn) => vibeWords.some((w) => w === syn || w.includes(syn) || syn.includes(w))).length;
    const vibeHitBonus = Math.min(10, synonymHits * 3);
    const vibeScore = (vibeStrength === 2 ? 95 : vibeStrength === 1 ? 70 : 35) + vibeHitBonus;

    // 3) texture
    const fragTexture = deriveTextureToken(f);
    const textureScore =
      fragTexture === userTexture ? 100 :
      textureGroup(fragTexture) === textureGroup(userTexture) ? 70 : 35;

    // 4) setting
    const occasionMatches = f.occasions.filter((o) => userOccasions.includes(o));
    const maxSetting = Math.max(1, Math.min(3, userOccasions.length));
    const settingScore =
      occasionMatches.length === 0
        ? 20
        : Math.round((Math.min(occasionMatches.length, maxSetting) / maxSetting) * 100);

    // 5) intensity (projection)
    const fragIntensity = deriveProjectionNumeric(f);
    const diff = Math.abs(fragIntensity - userIntensityNumeric);
    const intensityScore = Math.max(0, Math.round(100 - diff * 25));

    // Longevity match (so users who want a "short stay" get shorter wear)
    const fragLongevityNumeric = deriveLongevityNumeric(f);

    // 6) season
    let seasonScore = 50;
    if (userPreferredSeasons?.length && f.seasons?.length) {
      const overlap = f.seasons.filter((se) =>
        userPreferredSeasons.some((us) => normalize(us) === normalize(se))
      ).length;
      if (f.seasons.includes("all")) {
        seasonScore = 80;
      } else {
        const maxOverlap = Math.max(1, Math.min(2, userPreferredSeasons.length));
        const ratio = overlap / maxOverlap;
        seasonScore = overlap === 0 ? 20 : Math.round(20 + ratio * 80);
      }
    }

    // 7) familiarity
    const fragFamiliarity = deriveFamiliarityToken(f);
    let familiarityScore = 30;
    if (fragFamiliarity === userFamiliarity) familiarityScore = 85;
    else if (userFamiliarity === "distinctive") familiarityScore = fragFamiliarity === "challenging" ? 55 : 65;
    else if (userFamiliarity === "mass_appeal") {
      familiarityScore =
        fragFamiliarity === "distinctive" ? 65 :
        fragFamiliarity === "niche_collectable" ? 50 :
        fragFamiliarity === "challenging" ? 30 : 55;
    } else if (userFamiliarity === "niche_collectable") {
      familiarityScore =
        fragFamiliarity === "mass_appeal" ? 45 :
        fragFamiliarity === "niche_collectable" ? 85 :
        fragFamiliarity === "challenging" ? 70 : 60;
    }

    // 0) style intent (quiz-derived)
    const styleScore = userPreferredStyleClusters.length
      ? userPreferredStyleClusters.includes(f.styleCluster)
        ? 100
        : 25
      : 50;

    // Extra differentiation: reward richer metadata slightly (reduces ties when many candidates match similarly)
    const richnessScore = Math.min(
      100,
      (f.accords?.length ?? 0) * 10 +
        (f.seasons?.length ?? 0) * 6 +
        (f.occasions?.length ?? 0) * 4 +
        (f.vibe ? 8 : 0)
    );

    // Weighted total: dominant scent_family + vibe
    const weights = {
      scent_family: 25,
      vibe: 20,
      style_intent: 10,
      texture: 10,
      setting: 14,
      intensity: 12,
      season: 6,
      familiarity: 2,
      richness: 1,
    } as const;

    const baseTotal =
      (scentFamilyScore * weights.scent_family +
        vibeScore * weights.vibe +
        styleScore * weights.style_intent +
        textureScore * weights.texture +
        settingScore * weights.setting +
        intensityScore * weights.intensity +
        seasonScore * weights.season +
        familiarityScore * weights.familiarity +
        richnessScore * weights.richness) /
      100;

    // Keep important existing constraints as additional adjustments
    let constraintAdjust = 0;
    if (genderPreference !== "open") {
      if (f.gender === genderPreference) constraintAdjust += 18;
      else if (f.gender !== "unisex") constraintAdjust -= 18;
    }

    // Apply longevity user preference (q9 / derived from turnoffs)
    const longevityDiff = Math.abs(fragLongevityNumeric - userLongevityNumeric);
    if (longevityDiff === 0) constraintAdjust += 10;
    else if (longevityDiff === 1) constraintAdjust += 4;
    else if (longevityDiff === 2) constraintAdjust -= 6;
    else constraintAdjust -= 12;

    // Apply non-sweet turnoffs from q7.
    if (q7Turnoff === "turnoff_powdery" && fragTexture === "powdery") constraintAdjust -= 26;
    if (q7Turnoff === "turnoff_heavy" && (fragLongevityNumeric >= 5 || fragIntensity >= 4)) constraintAdjust -= 30;
    if (q7Turnoff === "turnoff_loud" && fragIntensity >= 4) constraintAdjust -= 30;
    if (q7Turnoff === "turnoff_sharp") {
      const fragVibe = normalize(f.vibe ?? "");
      if (fragVibe.includes("sharp") || fragIntensity >= 4) constraintAdjust -= 24;
    }

    if (avoidSweet) {
      const sweetish = accords.filter((a) => /vanilla|gourmand|sweet|tonka|caramel|amber/.test(a)).length;
      if (sweetish >= 2) constraintAdjust -= 35;
    }

    if (userPreferredPriceTiers.length > 0) {
      constraintAdjust += userPreferredPriceTiers.includes(f.priceTier) ? 8 : -4;
    }

    if (missingCategories.length > 0 && categoryMatchesGap(f.category, missingCategories)) {
      constraintAdjust += 7;
    }

    return baseTotal + constraintAdjust;
  };

  const withScores = candidates.map((f) => ({ f, s: score(f) }));
  withScores.sort((a, b) => b.s - a.s);
  // FIM requirement: use the full catalog (no truncation/pooling).
  const pool = withScores;

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

    const fragProjNumeric = deriveProjectionNumeric(f);
    const fragLonNumeric = deriveLongevityNumeric(f);

    // User-anchored base: how well does this fragrance match *the user's intent*?
    const userAccordMatches = (() => {
      let hits = 0;
      for (const ua of userAccords) {
        const nu = normalize(ua);
        if (accords.some((c) => normalize(c) === nu || normalize(c).includes(nu))) hits += 1;
      }
      return hits;
    })();

    const familyRatio = userAccordMatches / Math.max(1, userAccords.length);

    const vibeStrength = userVibe ? vibeMatchStrength(userVibe, buildCatalogVibeText(f)) : 0;
    const vibeNorm = vibeStrength === 2 ? 1 : vibeStrength === 1 ? 0.65 : 0.25;

    const settingOverlap = occasions.filter((o) => userOccasions.includes(o)).length;
    const settingNorm = settingOverlap / Math.max(1, userOccasions.length);

    const styleMatch = userPreferredStyleClusters.includes(cluster) ? 1 : 0;

    const intentBase = familyRatio * 45 + vibeNorm * 25 + settingNorm * 20 + styleMatch * 10; // 0..100

    const wantsDaily = userOccasions.includes("office") || userOccasions.includes("casual");
    const wantsDate = userOccasions.includes("date") || userOccasions.includes("evening");

    // Role-specific traits are *relative to the user's intent*, not generic stereotypes.
    const intensityDiff = Math.abs(fragProjNumeric - userIntensityNumeric);
    const intensityCloseness = Math.max(0, 100 - intensityDiff * 25);

    const projNumeric = fragProjNumeric;
    const intensityTraitBold = Math.max(0, Math.min(100, (projNumeric - userIntensityNumeric + 1) * 30));

    const longTrait = fragLonNumeric >= userLongevityNumeric ? 100 : fragLonNumeric === 3 && userLongevityNumeric === 5 ? 70 : 50;

    const dailyTrait = wantsDaily
      ? occasions.some((o) => o === "office" || o === "casual") ? 100 : 55
      : occasions.some((o) => o === "office" || o === "casual") ? 70 : 50;

    const dateTrait = wantsDate
      ? occasions.some((o) => o === "date" || o === "evening") ? 100 : 55
      : occasions.some((o) => o === "date" || o === "evening") ? 70 : 50;

    let safe = intentBase * 0.7 + intensityCloseness * 0.3;
    safe = safe * (dailyTrait / 100);

    let bold = intentBase * 0.55 + intensityTraitBold * 0.25 + longTrait * 0.2;
    bold = bold * (dateTrait / 100);

    let niche = intentBase * 0.55 + (isNichePrice || isNicheBrand ? 85 : 45) * 0.25;
    niche = niche + (wantsDate ? 15 : 0);
    niche = niche * (dateTrait / 100);

    const versatileOcc = Math.min(100, (occasions.length / 4) * 100);
    const versatileSeasons = Math.min(100, (seasons.length / 3) * 100);
    const versatilityTrait = 0.5 * versatileOcc + 0.5 * versatileSeasons;
    let versatile = intentBase * 0.6 + fragProfile.versatility * 0.25 + versatilityTrait * 0.15;

    // Signature / wildcard: just the best user intent (diversity handled elsewhere)
    let wildcard = intentBase;

    // Clamp 0..100 for downstream combined score normalization
    safe = Math.max(0, Math.min(100, safe));
    bold = Math.max(0, Math.min(100, bold));
    niche = Math.max(0, Math.min(100, niche));
    versatile = Math.max(0, Math.min(100, versatile));
    wildcard = Math.max(0, Math.min(100, wildcard));

    return {
      SAFE: safe,
      BOLD: bold,
      NICHE: niche,
      VERSATILE: versatile,
      WILDCARD: wildcard,
    };
  }

  /** Collapse catalog vibe strings into a token for diversity filtering. */
  function deriveVibeToken(vibe: string): string {
    const v = normalize(vibe ?? "");
    if (!v) return "";
    if (/clean|minimal|airy|fresh/.test(v)) return "clean";
    if (/timeless|classic|refined|elegant|iconic/.test(v)) return "timeless";
    if (/mysterious|dark|seductive|daring|opulent|intense|noir/.test(v)) return "mysterious";
    if (/adventur|unusual|edgy|bold/.test(v)) return "adventurous";
    if (/warm|spice|amber|cozy|rich/.test(v)) return "warm";
    if (/sensual|silk|romantic/.test(v)) return "seductive";
    return "";
  }

  /** True if f is too similar to any already-picked (same brand+cluster, or same category + heavy accord overlap). */
  function isTooSimilar(f: CatalogFragrance, pickedSoFar: CatalogFragrance[]): boolean {
    const fAccords = new Set((f.accords ?? []).map((a) => normalize(a)));
    const fFamily = deriveScentFamilyToken(f);
    const fTexture = deriveTextureToken(f);
    const fProj = deriveProjectionNumeric(f);
    const fVibeToken = deriveVibeToken(f.vibe ?? "");
    const fStyleCluster = f.styleCluster;
    const fPriceTier = f.priceTier;

    for (const p of pickedSoFar) {
      const pAccords = new Set((p.accords ?? []).map((a) => normalize(a)));
      const overlap = Array.from(fAccords).filter((a) => pAccords.has(a)).length;

      const pFamily = deriveScentFamilyToken(p);
      const pTexture = deriveTextureToken(p);
      const pProj = deriveProjectionNumeric(p);
      const pVibeToken = deriveVibeToken(p.vibe ?? "");

      const styleSame = p.styleCluster === fStyleCluster;
      const priceSame = p.priceTier === fPriceTier;
      const projDiff = Math.abs(fProj - pProj);
      const vibeSame = !!(fVibeToken && pVibeToken && fVibeToken === pVibeToken);

      // Hard duplicates / near-duplicates
      if (p.brand === f.brand && p.styleCluster === f.styleCluster) return true;

      // Accord overlap is a strong signal, but can be missing; fall back to other traits.
      if (overlap >= 4) return true;

      // Same family + same texture often feels similar; allow this even without heavy accord overlap.
      const sameProfileBase = fFamily === pFamily && fTexture === pTexture;
      if (sameProfileBase && (overlap >= 2 || (vibeSame && projDiff <= 1))) return true;

      // If style cluster + vibe match, strongly discourage duplicates even when accords are incomplete.
      if (styleSame && (overlap >= 2 || (vibeSame && projDiff <= 1))) return true;

      // Ultra-similar when multiple trait axes align.
      if (sameProfileBase && vibeSame && projDiff <= 1 && (styleSame || priceSame)) return true;
    }

    return false;
  }

  function canonicalKey(p: { brand: string; name: string }): string {
    return `${normalize(p.brand)}|${normalize(p.name)}`;
  }

  /** Returns a diversity penalty for candidates that are similar to what's already picked. */
  function similarityPenaltyToPicked(f: CatalogFragrance, pickedSoFar: CatalogFragrance[]): number {
    if (pickedSoFar.length === 0) return 0;

    const fAccords = new Set((f.accords ?? []).map((a) => normalize(a)));
    const fFamily = deriveScentFamilyToken(f);
    const fTexture = deriveTextureToken(f);
    const fVibeToken = deriveVibeToken(f.vibe ?? "");
    const fProj = deriveProjectionNumeric(f);
    const fStyleCluster = f.styleCluster;
    const fPriceTier = f.priceTier;

    let maxPenalty = 0;
    for (const p of pickedSoFar) {
      const pAccords = new Set((p.accords ?? []).map((a) => normalize(a)));
      const overlap = Array.from(fAccords).filter((a) => pAccords.has(a)).length;
      const pFamily = deriveScentFamilyToken(p);
      const pTexture = deriveTextureToken(p);
      const pVibeToken = deriveVibeToken(p.vibe ?? "");
      const pProj = deriveProjectionNumeric(p);
      const projDiff = Math.abs(pProj - fProj);
      const styleSame = p.styleCluster === fStyleCluster;
      const priceSame = p.priceTier === fPriceTier;

      const seasonOverlap =
        (f.seasons ?? []).some((fs) => (p.seasons ?? []).some((ps) => normalize(fs) === normalize(ps))) ? 1 : 0;

      let pPenalty = 0;
      // Downweight accord overlap: it’s not always present in the DB.
      pPenalty += Math.min(16, overlap * 2);
      if (p.brand === f.brand) pPenalty += 10;
      if (pFamily === fFamily) pPenalty += 10;
      if (pTexture === fTexture) pPenalty += 8;
      if (pVibeToken && fVibeToken && pVibeToken === fVibeToken) pPenalty += 6;
      if (styleSame) pPenalty += 8;
      if (priceSame) pPenalty += 6;
      if (projDiff <= 0) pPenalty += 6;
      else if (projDiff <= 1) pPenalty += 3;
      if (seasonOverlap) pPenalty += 4;
      maxPenalty = Math.max(maxPenalty, pPenalty);
    }

    return Math.min(35, maxPenalty);
  }

  const usedIds = new Set<string>();
  const usedKeys = new Set<string>();
  const pickedFragrances: CatalogFragrance[] = [];
  const picked: PickedFragrance[] = [];
  const maxMainScore = pool.length ? Math.max(...pool.map((x) => x.s)) : 0;
  const minMainScore = pool.length ? Math.min(...pool.map((x) => x.s)) : 0;
  const mainScoreRange = Math.max(1, maxMainScore - minMainScore);

  const roleDiversityWeights: Record<RecommendationRole, number> = {
    SAFE: 0.35,
    BOLD: 0.65,
    NICHE: 0.7,
    VERSATILE: 0.5,
    WILDCARD: 0.6,
  };

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
      const diversityPenalty =
        similarityPenaltyToPicked(scored.f, pickedFragrances) * roleDiversityWeights[role];
      const combined = roleScore * 0.6 + normalizedMain * 100 * 0.4 - diversityPenalty;
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
    if (best) {
      const { f } = best.scored;
      usedIds.add(f.id);
      usedKeys.add(canonicalKey(f));
      pickedFragrances.push(f);

      const why = buildRecommendationExplanation(userContext, f, getCachedProfile(f));
      const when = whenToWearLabel(f);
      const roleLine =
        role === "SAFE"
          ? "Role: SAFE — the easy-to-wear anchor that matches your profile."
          : role === "BOLD"
            ? "Role: BOLD — higher intensity and stronger presence when you want to be remembered."
            : role === "NICHE"
              ? "Role: NICHE — distinctive and artistic, built for collectors and conversation starters."
              : role === "VERSATILE"
                ? "Role: VERSATILE — balanced across settings, so it stays useful day after day."
                : "Role: WILDCARD — the unexpected-but-aligned pick that adds personality to your lineup.";

      const reason = `${why} When to wear: ${when}. ${roleLine}`;
      const confidence = Math.max(0, Math.min(1, best.combined / 100));
      picked.push({
        id: f.id,
        name: f.name,
        brand: f.brand,
        category: f.category,
        reason,
        role,
        confidence,
        whyThisWorks: why,
      });
    }
  }

  for (const { f, s } of pool) {
    if (picked.length >= 5) break;
    if (usedIds.has(f.id) || usedKeys.has(canonicalKey(f)) || isTooSimilar(f, pickedFragrances)) continue;
    usedIds.add(f.id);
    usedKeys.add(canonicalKey(f));
    pickedFragrances.push(f);
    const why = buildRecommendationExplanation(userContext, f, getCachedProfile(f));
    const when = whenToWearLabel(f);
    const reason = `${why} When to wear: ${when}. Role: EXTRA — backfilled to keep your 5-fragrance set complete.`;
    const confidence = Math.max(0, Math.min(1, (s - minMainScore) / mainScoreRange));
    picked.push({ id: f.id, name: f.name, brand: f.brand, category: f.category, reason, confidence, whyThisWorks: why });
  }

  while (picked.length < 5 && candidates.length > 0) {
    const next = candidates.find(
      (f) => !usedIds.has(f.id) && !usedKeys.has(canonicalKey(f)) && !isTooSimilar(f, pickedFragrances)
    );
    if (!next) break;
    usedIds.add(next.id);
    usedKeys.add(canonicalKey(next));
    pickedFragrances.push(next);
    const why = buildRecommendationExplanation(userContext, next, getCachedProfile(next));
    const when = whenToWearLabel(next);
    const reason = `${why} When to wear: ${when}. Role: EXTRA — backfilled to keep your 5-fragrance set complete.`;
    const nextMainScore = withScores.find((x) => x.f.id === next.id)?.s ?? minMainScore;
    const confidence = Math.max(0, Math.min(1, (nextMainScore - minMainScore) / mainScoreRange));
    picked.push({
      id: next.id,
      name: next.name,
      brand: next.brand,
      category: next.category,
      reason,
      confidence,
      whyThisWorks: why,
    });
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
  for (const { f, s } of withScores) {
    if (unique.length >= 5) break;
    const key = canonicalKey(f);
    if (seenIds.has(f.id) || seenKeys.has(key)) continue;
    seenIds.add(f.id);
    seenKeys.add(key);
    const fragProfile = getFragranceProfile(f);
    const why = buildRecommendationExplanation(userContext, f, fragProfile);
    const when = whenToWearLabel(f);
    const reason = `${why} When to wear: ${when}. Role: EXTRA — backfilled from the next best candidates.`;
    const confidence = Math.max(0, Math.min(1, (s - minMainScore) / mainScoreRange));
    unique.push({ id: f.id, name: f.name, brand: f.brand, category: f.category, reason, confidence, whyThisWorks: why });
  }

  const pickedFinal = unique.slice(0, 5);

  // Priority 5: every output slot gets exactly one distinct engine role (no index fallback in UI).
  // Optimal one-to-one assignment avoids greedy SAFE-first bias and default SAFE stubs.
  const catalogById = new Map(catalog.map((c) => [c.id, c]));
  const finalCatalogs: Array<{ picked: PickedFragrance; f: CatalogFragrance | null }> = pickedFinal.map(
    (p) => ({ picked: p, f: catalogById.get(p.id) ?? null })
  );

  const roleScoresByIndex = finalCatalogs.map(({ f }) => {
    if (!f) return null;
    const profile = getCachedProfile(f);
    return computeRoleScores(f, profile);
  });

  const assignedRoles = assignRolesOptimal(roleScoresByIndex);

  function roleLineFor(role: RecommendationRole): string {
    switch (role) {
      case "SAFE":
        return "Role: SAFE — the easy-to-wear anchor that matches your profile.";
      case "BOLD":
        return "Role: BOLD — higher intensity and stronger presence when you want to be remembered.";
      case "NICHE":
        return "Role: NICHE — distinctive and artistic, built for collectors and conversation starters.";
      case "VERSATILE":
        return "Role: VERSATILE — balanced across settings, so it stays useful day after day.";
      case "WILDCARD":
        return "Role: WILDCARD — the unexpected-but-aligned pick that adds personality to your lineup.";
      default:
        return "Role: WILDCARD — the unexpected-but-aligned pick that adds personality to your lineup.";
    }
  }

  // Patch role + reason text for consistent “intended role” display (every slot, including rare catalog misses).
  for (let i = 0; i < finalCatalogs.length; i++) {
    const { picked, f } = finalCatalogs[i];
    const role = assignedRoles[i];
    picked.role = role;

    if (!f) {
      picked.reason = `${picked.reason.replace(/\s*Role: EXTRA[^\n]*/g, "").trim()} ${roleLineFor(role)}`;
      if (typeof picked.confidence !== "number") picked.confidence = 0.5;
      continue;
    }

    const why = picked.whyThisWorks ?? buildRecommendationExplanation(userContext, f, getCachedProfile(f));
    const when = whenToWearLabel(f);
    picked.reason = `${why} When to wear: ${when}. ${roleLineFor(role)}`;

    if (typeof picked.confidence !== "number") {
      const mainRaw = withScores.find((x) => x.f.id === f.id)?.s ?? score(f);
      const confidence = Math.max(0, Math.min(1, (mainRaw - minMainScore) / mainScoreRange));
      picked.confidence = confidence;
    }
  }

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
