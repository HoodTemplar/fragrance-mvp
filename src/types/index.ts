/**
 * Shared types for Scent DNA.
 * These describe the shape of data we use across the app (results, quiz, profile).
 */

export type GenderPreference = "masculine" | "feminine" | "unisex" | "open";

/** Archetype data attached to quiz result for premium result reveal. */
export interface ScentArchetypeResult {
  id: string;
  name: string;
  characterDescription: string;
  fragranceFamilies: string[];
  typicalOccasions: string[];
  seasonsWhereItShines: string[];
  recommendationStyle: string;
}

export interface ScentProfile {
  dominant: string;
  secondary: string;
  accent: string;
  description: string;
  /** Preferred fragrance gender; used for recommendations. */
  genderPreference?: GenderPreference;
  /** Scent DNA archetype for result screen (e.g. The Coastal Philosopher). */
  archetype?: ScentArchetypeResult;
}

import type { ScoreBreakdown } from "@/lib/scoring";

export interface CollectionResult {
  score: number;
  scoreBreakdown?: ScoreBreakdown;
  scentProfile: ScentProfile;
  strengths: string[];
  weaknesses: string[];
  missingCategories: string[];
  recommendedFragrances: RecommendedFragrance[];
  layeringSuggestions: string[];
  whenToWear: string[];
  /** Who this collection suits (expert, human sentence). */
  whoThisSuits?: string;
  /** Overall vibe of the collection (one short paragraph). */
  overallVibe?: string;
  /** How the collection wears in practice. */
  howItWears?: string;
  /** Best seasons for this collection. */
  bestSeasons?: string[];
  /** Best occasions for this collection. */
  bestOccasions?: string[];
  /** Why this collection works (expert summary). */
  whyItWorks?: string;
  /** Similar fragrances or "if you like X, try Y" suggestions. */
  similarFragrances?: string[];
}

/** Role used for editorial display (engine returns one per role in order). */
export type RecommendationRole = "SAFE" | "BOLD" | "NICHE" | "VERSATILE" | "WILDCARD";

export interface RecommendedFragrance {
  id: string;
  name: string;
  brand: string;
  category: string;
  note: string;
  /**
   * Confidence in this recommendation for the current user/inputs.
   * Stored as 0..1 so UI can render as a percentage.
   */
  confidence?: number;

  /**
   * Expert explanation (pre-polish / rule-based) for why this fragrance fits.
   * Used for "Why this works for you" UI.
   */
  whyThisWorks?: string;

  /** When true, show "Sponsored" badge and track clicks for future monetization */
  isSponsored?: boolean;
  /** Optional. When set, clicks are attributed to this sponsor slot (for billing/analytics). */
  sponsorSlotId?: string;
  /** Optional. For editorial UI: visual style per role (inferred by index if not set). */
  role?: RecommendationRole;
}

export interface QuizAnswer {
  questionId: string;
  value: string | number;
}

export interface QuizResult {
  profile: ScentProfile;
  recommendations: RecommendedFragrance[];
}

export interface SavedResult {
  id: string;
  userId: string;
  type: "collection" | "quiz";
  data: CollectionResult | QuizResult;
  createdAt: string;
}
