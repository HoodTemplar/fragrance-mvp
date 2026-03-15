/**
 * Collection score (0–100) for the MVP.
 * Simple, transparent rules: variety, versatility, season coverage, occasion coverage, redundancy.
 */

/** One bottle in the collection, with tags the scorer uses */
export interface CollectionItemForScoring {
  id: string;
  category: string;
  seasons: ("spring" | "summer" | "fall" | "winter")[];
  occasions: ("office" | "casual" | "date" | "formal")[];
  versatile: boolean;
}

/** How the total score was built (for transparency) */
export interface ScoreBreakdown {
  variety: { points: number; max: number; explanation: string };
  versatility: { points: number; max: number; explanation: string };
  seasonCoverage: { points: number; max: number; explanation: string };
  occasionCoverage: { points: number; max: number; explanation: string };
  lowRedundancy: { points: number; max: number; explanation: string };
  total: number;
}

const MAX_VARIETY = 25;
const MAX_VERSATILITY = 20;
const MAX_SEASON = 20;
const MAX_OCCASION = 20;
const MAX_LOW_REDUNDANCY = 15;

/**
 * Compute collection score and breakdown from a list of bottles.
 */
export function computeCollectionScore(
  items: CollectionItemForScoring[]
): { score: number; breakdown: ScoreBreakdown } {
  if (items.length === 0) {
    return {
      score: 0,
      breakdown: {
        variety: { points: 0, max: MAX_VARIETY, explanation: "No bottles in collection." },
        versatility: { points: 0, max: MAX_VERSATILITY, explanation: "No bottles in collection." },
        seasonCoverage: { points: 0, max: MAX_SEASON, explanation: "No bottles in collection." },
        occasionCoverage: { points: 0, max: MAX_OCCASION, explanation: "No bottles in collection." },
        lowRedundancy: { points: 0, max: MAX_LOW_REDUNDANCY, explanation: "No bottles in collection." },
        total: 0,
      },
    };
  }

  const categories = new Set(items.map((i) => i.category.toLowerCase().trim()));
  const varietyPoints = Math.min(
    MAX_VARIETY,
    Math.max(0, categories.size * 5)
  );

  const versatileCount = items.filter((i) => i.versatile).length;
  const versatilityPoints =
    versatileCount >= 3 ? MAX_VERSATILITY : versatileCount >= 2 ? 10 : versatileCount >= 1 ? 5 : 0;

  const seasonsCovered = new Set<string>();
  items.forEach((i) => i.seasons.forEach((s) => seasonsCovered.add(s)));
  const seasonPoints = Math.min(MAX_SEASON, seasonsCovered.size * 5);

  const occasionsCovered = new Set<string>();
  items.forEach((i) => i.occasions.forEach((o) => occasionsCovered.add(o)));
  const occasionPoints = Math.min(MAX_OCCASION, occasionsCovered.size * 5);

  const roleCount: Record<string, number> = {};
  items.forEach((i) => {
    const key = `${i.category.toLowerCase()}|${[...i.occasions].sort().join(",")}`;
    roleCount[key] = (roleCount[key] ?? 0) + 1;
  });
  const redundantBottles = Object.values(roleCount)
    .filter((c) => c > 1)
    .reduce((sum, c) => sum + (c - 1), 0);
  const redundancyPenalty = Math.min(MAX_LOW_REDUNDANCY, redundantBottles * 5);
  const lowRedundancyPoints = Math.max(0, MAX_LOW_REDUNDANCY - redundancyPenalty);

  const total = Math.min(
    100,
    varietyPoints + versatilityPoints + seasonPoints + occasionPoints + lowRedundancyPoints
  );

  const breakdown: ScoreBreakdown = {
    variety: {
      points: varietyPoints,
      max: MAX_VARIETY,
      explanation:
        categories.size <= 1
          ? "One scent family. Add more categories for variety."
          : `${categories.size} different scent families (max ${MAX_VARIETY} pts).`,
    },
    versatility: {
      points: versatilityPoints,
      max: MAX_VERSATILITY,
      explanation:
        versatileCount === 0
          ? "No bottles marked as all-season or day-to-night."
          : `${versatileCount} versatile bottle(s) (all-season or day-to-night).`,
    },
    seasonCoverage: {
      points: seasonPoints,
      max: MAX_SEASON,
      explanation: `${seasonsCovered.size} of 4 seasons covered (5 pts each).`,
    },
    occasionCoverage: {
      points: occasionPoints,
      max: MAX_OCCASION,
      explanation: `${occasionsCovered.size} of 4 occasions covered (5 pts each).`,
    },
    lowRedundancy: {
      points: lowRedundancyPoints,
      max: MAX_LOW_REDUNDANCY,
      explanation:
        redundantBottles === 0
          ? "No duplicate roles (same category + occasion)."
          : `${redundantBottles} bottle(s) overlap in role; fewer duplicates = higher score.`,
    },
    total,
  };

  return { score: total, breakdown };
}
