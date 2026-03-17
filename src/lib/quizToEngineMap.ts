/**
 * Maps new quiz answers (q1–q9, cinematic format) to the recommendation engine's
 * expected shape (family, occasion, vibe, projection, seasons, gender, etc.).
 * Keeps the engine unchanged while storing structured preference variables.
 */

export interface EngineReadyPreferences {
  /** Engine expects q1 = scent family (fresh | sweet | woody | spicy). */
  q1: string;
  /** Engine expects q2 = occasion (daily | nightlife | date | all). */
  q2: string;
  /** Engine expects q3 = feel (light | warm | bold | balanced). */
  q3: string;
  /** Engine expects q4 = budget (budget | mid | luxe | niche). */
  q4: string;
  /** Engine expects q5 = designer/niche (designer | niche | both). */
  q5: string;
  /** Engine expects q8 = vibe (clean | seductive | adventurous | timeless). */
  q8: string;
  /** Engine expects q9 = longevity (short | day | trail). */
  q9: string;
  /** Engine expects q11 = gender preference. */
  q11: "masculine" | "feminine" | "unisex" | "open";
  /** Optional: preferred seasons for scoring. */
  userPreferredSeasons?: string[];
  /** Optional: preferred projection for scoring. */
  userProjection?: string;
}

/** Q1 environment -> family hint (q8 is primary for family; q1 supports vibe). */
const ENV_TO_FAMILY: Record<string, string> = {
  paris_coffee: "sweet",
  soho_gallery: "fresh",
  mediterranean: "fresh",
  rooftop_night: "spicy",
  rainy_bookstore: "woody",
};

/** Q5 social context -> occasion. */
const CONTEXT_TO_OCCASION: Record<string, string> = {
  context_everyday: "daily",
  context_professional: "daily",
  context_dates: "date",
  context_special: "all",
  context_nightlife: "nightlife",
};

/** Q4 presence -> projection. */
const PRESENCE_TO_PROJECTION: Record<string, string> = {
  presence_aura: "intimate",
  presence_subtle: "moderate",
  presence_memorable: "strong",
  presence_bold: "strong",
};

/** Q4 presence -> feel (q3). */
const PRESENCE_TO_FEEL: Record<string, string> = {
  presence_aura: "light",
  presence_subtle: "balanced",
  presence_memorable: "bold",
  presence_bold: "bold",
};

/** Q6 climate -> seasons. */
const CLIMATE_TO_SEASONS: Record<string, string[]> = {
  climate_summer: ["summer"],
  climate_spring: ["spring"],
  climate_autumn: ["fall"],
  climate_winter: ["winter"],
  climate_all: [],
};

/** Q8 scent direction -> primary family (strongest signal). */
const SCENT_TO_FAMILY: Record<string, string> = {
  scent_citrus_woods: "fresh",
  scent_musk_floral: "fresh",
  scent_amber_spice: "spicy",
  scent_smoky_incense: "woody",
  scent_vanilla_warmth: "sweet",
  scent_green_fresh: "fresh",
};

/** Q2 style + Q3 impression -> vibe. */
function deriveVibe(style: string, impression: string): string {
  const styleVibe: Record<string, string> = {
    clean_minimal: "clean",
    classic_polished: "timeless",
    bold_fashion: "adventurous",
    creative_unconventional: "adventurous",
    relaxed_effortless: "clean",
  };
  const impressionVibe: Record<string, string> = {
    impression_clean: "clean",
    impression_intriguing: "adventurous",
    impression_attractive: "seductive",
    impression_expensive: "timeless",
    impression_fresh: "clean",
  };
  return impressionVibe[impression] ?? styleVibe[style] ?? "timeless";
}

/** Q7 turnoff_heavy -> prefer shorter longevity. */
function deriveLongevity(answers: Record<string, string>): string {
  const q7 = answers.q7 ?? "";
  if (q7 === "turnoff_heavy") return "short";
  return "day";
}

/** Q9 -> gender. */
const GENDER_MAP: Record<string, "masculine" | "feminine" | "unisex" | "open"> = {
  gender_masculine: "masculine",
  gender_feminine: "feminine",
  gender_unisex: "unisex",
  gender_open: "open",
};

/**
 * Maps new quiz answers (q1–q9) to engine-ready preferences.
 * Use this for runRecommendationEngine input and for storing structured preferences.
 */
export function mapQuizAnswersToEngine(
  answers: Record<string, string>
): EngineReadyPreferences {
  const q8Scent = answers.q8 ?? "";
  const q1Env = answers.q1 ?? "";
  const family = SCENT_TO_FAMILY[q8Scent] ?? ENV_TO_FAMILY[q1Env] ?? "fresh";
  const occasion = CONTEXT_TO_OCCASION[answers.q5 ?? ""] ?? "daily";
  const projection = PRESENCE_TO_PROJECTION[answers.q4 ?? ""];
  const feel = PRESENCE_TO_FEEL[answers.q4 ?? ""] ?? "balanced";
  const seasons = CLIMATE_TO_SEASONS[answers.q6 ?? ""];
  const vibe = deriveVibe(answers.q2 ?? "", answers.q3 ?? "");
  const designerNiche = (answers.q2 ?? "") === "creative_unconventional" ? "niche" : "both";
  const longevity = deriveLongevity(answers);
  const gender = GENDER_MAP[answers.q9 ?? ""] ?? "open";

  return {
    q1: family,
    q2: occasion,
    q3: feel,
    q4: "mid",
    q5: designerNiche,
    q8: vibe,
    q9: longevity,
    q11: gender,
    userPreferredSeasons: seasons && seasons.length > 0 ? seasons : undefined,
    userProjection: projection || undefined,
  };
}
