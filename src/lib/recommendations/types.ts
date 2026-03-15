/**
 * Types for the recommendation engine (rule-based selection + AI polish).
 */

import type { CatalogFragrance } from "@/data/fragranceCatalog";

export type GenderPreference = "masculine" | "feminine" | "unisex" | "open";

export interface RecommendationInput {
  /** Fragrances detected in the user's collection (name, brand) */
  detectedFragrances: { name: string; brand: string }[];
  /** Categories the collection is missing */
  missingCategories: string[];
  /** Collection strengths (free text from analysis) */
  strengths: string[];
  /** Collection weaknesses */
  weaknesses: string[];
  /** Optional quiz answers (q1 = family, q2 = occasion, q4 = budget, q5 = designer/niche, q8 = vibe, q9 = longevity, q11 = genderPreference) */
  quizAnswers?: Record<string, string>;
  /** Gender preference for recommendations (from quiz q11 or upload flow). */
  genderPreference?: GenderPreference;
  /** Preferred seasons (optional; if not set, season match is skipped). */
  userPreferredSeasons?: string[];
  /** Preferred projection (optional; if not set, projection match is skipped). */
  userProjection?: string;
  /** Preferred price tiers (optional; when set, matching fragrances get a score boost). */
  userPreferredPriceTiers?: string[];
  /** Optional fragrance catalog (e.g. from Supabase). If omitted, engine uses local fragranceCatalog.ts. */
  catalog?: CatalogFragrance[];
}

/** One fragrance pick from the engine (before AI polish adds the note) */
export interface PickedFragrance {
  id: string;
  name: string;
  brand: string;
  category: string;
  /** Why we picked it (for AI to turn into polished note) */
  reason: string;
}

/** One layering suggestion (for AI to turn into one sentence) */
export interface LayeringSuggestionRaw {
  first: string;
  second: string;
  reason: string;
}

/** One when-to-wear item (for AI to turn into one line) */
export interface WhenToWearRaw {
  occasion: string;
  tip: string;
}

export interface RecommendationEngineOutput {
  fragrances: PickedFragrance[];
  layering: LayeringSuggestionRaw[];
  whenToWear: WhenToWearRaw[];
}

/** After AI polish: same structure but with polished copy */
export interface PolishedRecommendations {
  recommendedFragrances: Array<{
    id: string;
    name: string;
    brand: string;
    category: string;
    note: string;
    isSponsored?: boolean;
  }>;
  layeringSuggestions: string[];
  whenToWear: string[];
}
