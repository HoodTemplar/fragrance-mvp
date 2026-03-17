/**
 * Builds a user preference profile (numeric signals) from engine-ready quiz answers.
 * Used for trait-based matching. Same dimensions as fragrance profile.
 */

import type { FragranceProfileScores } from "./fragranceProfile";

export interface UserPreferenceInput {
  /** Engine q1: fresh | sweet | woody | spicy */
  family: string;
  /** Engine q2: daily | date | nightlife | all */
  occasion: string;
  /** Engine q8: clean | seductive | adventurous | timeless */
  vibe: string;
  /** Optional: if true, user dislikes sweet — set sweetness preference to 0 */
  avoidSweet?: boolean;
  /** Optional: prefer intimate projection -> slightly lower "loud" preference (we match projection separately) */
  projection?: string;
}

/**
 * Returns 0–100 preference scores for each dimension.
 * Higher = user prefers that trait in a recommendation.
 */
export function getUserPreferenceProfile(input: UserPreferenceInput): FragranceProfileScores {
  const { family, occasion, vibe, avoidSweet } = input;

  let freshness = 0;
  let warmth = 0;
  let sweetness = 0;
  let woodiness = 0;
  let spice = 0;
  let cleanliness = 0;
  let sensuality = 0;
  let versatility = 0;

  switch (family) {
    case "fresh":
      freshness = 85;
      cleanliness = 60;
      break;
    case "sweet":
      warmth = 75;
      sweetness = 80;
      sensuality = 55;
      break;
    case "woody":
      woodiness = 85;
      break;
    case "spicy":
      spice = 80;
      warmth = 50;
      break;
    default:
      freshness = 40;
      versatility = 70;
  }

  switch (vibe) {
    case "clean":
      cleanliness = Math.max(cleanliness, 85);
      freshness = Math.max(freshness, 50);
      break;
    case "seductive":
      sensuality = Math.max(sensuality, 85);
      warmth = Math.max(warmth, 50);
      break;
    case "adventurous":
      spice = Math.max(spice, 40);
      woodiness = Math.max(woodiness, 40);
      break;
    case "timeless":
      versatility = Math.max(versatility, 75);
      break;
    default:
      versatility = Math.max(versatility, 50);
  }

  if (occasion === "daily" || occasion === "all") {
    versatility = Math.max(versatility, 70);
  }
  if (occasion === "date") {
    sensuality = Math.max(sensuality, 60);
  }

  if (avoidSweet) {
    sweetness = 0;
    warmth = Math.min(warmth, 40);
  }

  return {
    freshness: Math.min(100, freshness),
    warmth: Math.min(100, warmth),
    sweetness: Math.min(100, sweetness),
    woodiness: Math.min(100, woodiness),
    spice: Math.min(100, spice),
    cleanliness: Math.min(100, cleanliness),
    sensuality: Math.min(100, sensuality),
    versatility: Math.min(100, versatility),
  };
}
