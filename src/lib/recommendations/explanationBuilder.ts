/**
 * Builds human, expert-style "why this for you" explanations for each recommendation.
 * Uses user context and fragrance traits so the note feels real, intentional, and consultant-level.
 */

import type { CatalogFragrance } from "@/data/fragranceCatalog";
import type { FragranceProfileScores } from "./fragranceProfile";

export interface UserContext {
  family: string;
  occasion: string;
  vibe: string;
  userProjection?: string;
  missingCategories: string[];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Returns one or two sentences: why this fragrance fits this user.
 * Expert, human tone; references occasion, vibe, projection, and gaps where relevant.
 */
export function buildRecommendationExplanation(
  user: UserContext,
  f: CatalogFragrance,
  fragranceProfile: FragranceProfileScores
): string {
  const occasion = user.occasion;
  const vibe = user.vibe;
  const family = user.family;
  const userProj = user.userProjection;
  const name = f.name;
  const category = f.category ?? "";
  const cat = normalize(category);
  const fragVibe = normalize(f.vibe ?? "");
  const fragProj = normalize(f.projection ?? "");

  const parts: string[] = [];

  if (user.missingCategories.length > 0 && (cat.includes("fresh") || cat.includes("woody") || cat.includes("floral") || cat.includes("amber") || cat.includes("oriental"))) {
    parts.push(`We picked this to round out your collection—it adds a proper ${category.toLowerCase()} option so you’re covered for more situations.`);
  }

  if (occasion === "date" && (f.occasions.includes("date") || f.occasions.includes("evening"))) {
    if (fragranceProfile.sensuality > 50) {
      parts.push(`Warm and memorable without feeling heavy; one of our go-tos for date night and evening wear.`);
    } else {
      parts.push(`Refined and present—works beautifully for dates and evenings without overwhelming the room.`);
    }
  } else if (occasion === "daily" && (f.occasions.includes("office") || f.occasions.includes("casual"))) {
    parts.push(`Fits everyday and office wear really well: versatile, easy to reach for, and never out of place.`);
  } else if (occasion === "nightlife" && (f.occasions.includes("evening"))) {
    parts.push(`Has the presence you want when you’re out—bold enough to be noticed, without going over the top.`);
  }

  if (userProj && fragProj) {
    if (userProj === "intimate" && (fragProj === "intimate" || fragProj === "soft")) {
      parts.push(`Stays close to the skin, exactly what you asked for.`);
    } else if (userProj === "strong" && (fragProj === "strong" || fragProj === "bold")) {
      parts.push(`Leaves a clear trail—noticeable and memorable when you want to be.`);
    } else if (fragProj === "moderate") {
      parts.push(`Sits in that sweet spot: noticeable but not loud, so it works in most settings.`);
    }
  }

  if (vibe === "clean" && (fragranceProfile.cleanliness > 50 || fragVibe.includes("clean") || fragVibe.includes("fresh"))) {
    parts.push(`Clean and refined—right in line with the kind of scent you gravitate toward.`);
  } else if (vibe === "seductive" && (fragranceProfile.sensuality > 50 || fragranceProfile.warmth > 50)) {
    parts.push(`Warm and inviting; the kind of scent that leaves a real impression.`);
  } else if (vibe === "timeless" && (fragVibe.includes("classic") || fragVibe.includes("refined") || fragranceProfile.versatility > 60)) {
    parts.push(`Timeless and versatile—one of those bottles you’ll keep reaching for.`);
  } else if (family === "fresh" && fragranceProfile.freshness > 60) {
    parts.push(`Matches your taste for fresh, clean scents—bright, easy to wear, and never cloying.`);
  } else if (family === "woody" && fragranceProfile.woodiness > 50) {
    parts.push(`Adds a distinct take on wood—deepens your range without repeating what you already have.`);
  } else if (family === "sweet" && fragranceProfile.warmth > 50 && fragranceProfile.sweetness > 40) {
    parts.push(`Warm and inviting, with the depth and richness you enjoy.`);
  } else if (family === "spicy" && fragranceProfile.spice > 50) {
    parts.push(`Brings the spice and depth you’re drawn to—bold but still very wearable.`);
  }

  if (parts.length === 0) {
    return `${name} is a strong fit for your profile—${category} that works across a lot of situations. Worth trying next.`;
  }
  return parts.join(" ");
}
