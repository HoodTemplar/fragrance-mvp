/**
 * Maps quiz-derived engine preferences to the best-matching Scent DNA archetype.
 * Scores each archetype by family, occasion, vibe, and optional signals; returns the top match.
 */

import type { EngineReadyPreferences } from "@/lib/quizToEngineMap";
import { SCENT_ARCHETYPES, getArchetypeById, type ScentArchetype } from "@/data/scentArchetypes";

/** Which family/vibe/occasion each archetype best matches. */
const ARCHETYPE_SIGNALS: Record<
  string,
  { families: string[]; vibes: string[]; occasions: string[]; projection?: string }
> = {
  coastal_philosopher: { families: ["fresh"], vibes: ["clean"], occasions: ["daily"], projection: "intimate" },
  velvet_alchemist: { families: ["sweet"], vibes: ["seductive"], occasions: ["date"], projection: "moderate" },
  silver_minimalist: { families: ["fresh"], vibes: ["clean"], occasions: ["daily"], projection: "intimate" },
  shadow_poet: { families: ["woody", "spicy"], vibes: ["adventurous"], occasions: ["nightlife"], projection: "strong" },
  modern_aristocrat: { families: ["woody"], vibes: ["timeless"], occasions: ["daily", "all"], projection: "moderate" },
  sunlit_nomad: { families: ["fresh"], vibes: ["adventurous"], occasions: ["daily", "all"], projection: "moderate" },
  night_architect: { families: ["woody", "spicy"], vibes: ["adventurous"], occasions: ["nightlife"], projection: "strong" },
  quiet_collector: { families: [], vibes: [], occasions: ["all"], projection: undefined },
};

function scoreArchetype(prefs: EngineReadyPreferences, archetype: ScentArchetype): number {
  const signals = ARCHETYPE_SIGNALS[archetype.id];
  if (!signals) return 0;

  let score = 0;
  const family = prefs.q1;
  const occasion = prefs.q2;
  const vibe = prefs.q8;
  const projection = prefs.userProjection;

  if (signals.families.length > 0 && signals.families.includes(family)) score += 3;
  if (signals.vibes.length > 0 && signals.vibes.includes(vibe)) score += 2;
  if (signals.occasions.includes(occasion) || (occasion === "all" && signals.occasions.includes("all"))) score += 2;
  if (projection && signals.projection && projection === signals.projection) score += 1;

  if (archetype.id === "quiet_collector" && prefs.q11 === "open") score += 4;
  if (archetype.id === "silver_minimalist" && projection === "intimate") score += 2;
  if (archetype.id === "velvet_alchemist" && (family === "sweet" || vibe === "seductive")) score += 2;
  if (archetype.id === "shadow_poet" && (family === "woody" || family === "spicy")) score += 2;
  if (archetype.id === "night_architect" && occasion === "nightlife" && prefs.q5 === "niche") score += 2;
  if (archetype.id === "coastal_philosopher" && family === "fresh" && vibe === "clean") score += 2;
  if (archetype.id === "sunlit_nomad" && family === "fresh" && vibe === "adventurous") score += 2;
  if (archetype.id === "modern_aristocrat" && (vibe === "timeless" || prefs.q5 === "designer")) score += 2;

  return score;
}

/**
 * Returns the best-matching archetype for the given engine preferences.
 * If no clear winner, returns a sensible default (e.g. modern_aristocrat or sunlit_nomad).
 */
export function getArchetypeForPreferences(prefs: EngineReadyPreferences): ScentArchetype {
  let best: ScentArchetype = SCENT_ARCHETYPES[0];
  let bestScore = -1;

  for (const archetype of SCENT_ARCHETYPES) {
    const s = scoreArchetype(prefs, archetype);
    if (s > bestScore) {
      bestScore = s;
      best = archetype;
    }
  }

  return best;
}

export { getArchetypeById };
