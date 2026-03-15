/**
 * Mock data for the MVP - used until real AI/API or Supabase is connected.
 * Replace these with real API calls or Supabase queries later.
 */

import type { CollectionResult, RecommendedFragrance, QuizResult } from "@/types";
import {
  computeCollectionScore,
  type CollectionItemForScoring,
} from "@/lib/scoring";

/** Sample collection used to compute the score with MVP scoring rules (see docs/SCORING.md) */
const SAMPLE_COLLECTION_FOR_SCORING: CollectionItemForScoring[] = [
  { id: "1", category: "Woody", seasons: ["fall", "winter"], occasions: ["office", "casual"], versatile: true },
  { id: "2", category: "Woody Citrus", seasons: ["spring", "summer", "fall"], occasions: ["office", "casual", "date"], versatile: true },
  { id: "3", category: "Fresh", seasons: ["spring", "summer"], occasions: ["office", "casual"], versatile: false },
  { id: "4", category: "Amber", seasons: ["fall", "winter"], occasions: ["date", "formal"], versatile: false },
  { id: "5", category: "Floral", seasons: ["spring", "summer"], occasions: ["casual", "date"], versatile: true },
];

/** Collection result with score from scoring rules and optional breakdown. Use this so the score is transparent. */
export function getCollectionResult(): CollectionResult {
  const { score, breakdown } = computeCollectionScore(SAMPLE_COLLECTION_FOR_SCORING);
  return {
    ...MOCK_COLLECTION_RESULT_STATIC,
    score,
    scoreBreakdown: breakdown,
  };
}

const MOCK_COLLECTION_RESULT_STATIC: Omit<CollectionResult, "score" | "scoreBreakdown"> = {
  scentProfile: {
    dominant: "Woody & Amber",
    secondary: "Fresh Citrus",
    accent: "Floral",
    description:
      "Your collection leans warm and sophisticated with a bright, wearable edge. You appreciate depth without sacrificing approachability.",
  },
  strengths: [
    "Strong variety in woody and amber scents",
    "Good balance of day and evening options",
    "Several versatile all-season picks",
  ],
  weaknesses: [
    "Limited fresh or aquatic options for summer",
    "Few overtly floral choices for variety",
  ],
  missingCategories: [
    "Fresh / Aquatic",
    "Green / Herbal",
    "Oriental / Spicy",
  ],
  recommendedFragrances: [
    {
      id: "1",
      name: "Bleu de Chanel",
      brand: "Chanel",
      category: "Fresh Woody",
      note: "Versatile daily wear that fills your fresh gap.",
      isSponsored: false,
    },
    {
      id: "2",
      name: "Terre d'Hermès",
      brand: "Hermès",
      category: "Woody Citrus",
      note: "Earthy, refined—fits your woody preference with a green twist.",
      isSponsored: false,
    },
    {
      id: "3",
      name: "Acqua di Gio",
      brand: "Giorgio Armani",
      category: "Fresh Aquatic",
      note: "Classic summer staple you're missing.",
      isSponsored: false,
    },
    {
      id: "4",
      name: "Santal 33",
      brand: "Le Labo",
      category: "Woody",
      note: "Cult favorite that deepens your woody range.",
      isSponsored: false,
    },
    {
      id: "5",
      name: "Ombre Leather",
      brand: "Tom Ford",
      category: "Leather",
      note: "Adds edge and evening presence to your collection.",
      isSponsored: true,
    },
  ],
  layeringSuggestions: [
    "Layer a citrus top (e.g. bergamot) with your woodiest base for day-to-evening transition.",
    "Try a fresh aquatic under a woody scent for a unique summer combo.",
  ],
  whenToWear: [
    "Office: Your woody-citrus options are ideal for professional settings.",
    "Date night: Reach for your ambers and deeper woods.",
    "Weekend: Your versatile all-season picks work well.",
    "Summer heat: Consider adding one fresh aquatic from the recommendations.",
  ],
};

/** Static mock result (score fixed at 78). Prefer getCollectionResult() for rule-based score. */
export const MOCK_COLLECTION_RESULT: CollectionResult = {
  ...MOCK_COLLECTION_RESULT_STATIC,
  score: 78,
};

export const MOCK_QUIZ_RESULT: QuizResult = {
  profile: {
    dominant: "Fresh & Clean",
    secondary: "Light Woody",
    accent: "Citrus",
    description:
      "You prefer scents that feel clean, bright, and easy to wear. You like a touch of warmth without heavy sweetness.",
  },
  recommendations: [
    {
      id: "q1",
      name: "Another 13",
      brand: "Le Labo",
      category: "Skin Scent / Woody",
      note: "Minimal, clean, almost invisible—fits your preference.",
      isSponsored: false,
    },
    {
      id: "q2",
      name: "Wood Sage & Sea Salt",
      brand: "Jo Malone",
      category: "Fresh Woody",
      note: "Light, breezy, perfect for your profile.",
      isSponsored: false,
    },
    {
      id: "q3",
      name: "Gypsy Water",
      brand: "Byredo",
      category: "Fresh Woody",
      note: "Clean pine and vanilla—refined and wearable.",
      isSponsored: false,
    },
  ],
};

/** Admin: list of fragrance IDs that can be marked as sponsored later */
export const SPONSORED_IDS = ["5"];
