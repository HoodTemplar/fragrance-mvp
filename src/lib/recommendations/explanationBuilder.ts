/**
 * Builds human, expert-style "why this for you" explanations for each recommendation.
 * Uses user context and fragrance traits so the note feels real and intentional.
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
 * Consultant tone; references user's occasion, vibe, or projection where relevant.
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
    const gap = user.missingCategories[0];
    parts.push(`We chose this to fill a gap in your collection: it brings ${category.toLowerCase()} into the mix.`);
  }

  if (occasion === "date" && (f.occasions.includes("date") || f.occasions.includes("evening"))) {
    if (fragranceProfile.sensuality > 50) {
      parts.push(`It’s warm and memorable without being heavy—ideal for date night and evenings.`);
    } else {
      parts.push(`It works well for dates and evenings: refined and present without overwhelming.`);
    }
  } else if (occasion === "daily" && (f.occasions.includes("office") || f.occasions.includes("casual"))) {
    parts.push(`It fits your everyday and professional moments—versatile and easy to wear.`);
  } else if (occasion === "nightlife" && (f.occasions.includes("evening"))) {
    parts.push(`It has the presence you want for nights out—bold enough to be noticed.`);
  }

  if (userProj && fragProj) {
    if (userProj === "intimate" && (fragProj === "intimate" || fragProj === "soft")) {
      parts.push(`The projection stays close, just as you like.`);
    } else if (userProj === "strong" && (fragProj === "strong" || fragProj === "bold")) {
      parts.push(`It leaves a clear trail—noticeable and memorable.`);
    } else if (fragProj === "moderate") {
      parts.push(`It sits in a comfortable middle: noticeable but not loud.`);
    }
  }

  if (vibe === "clean" && (fragranceProfile.cleanliness > 50 || fragVibe.includes("clean") || fragVibe.includes("fresh"))) {
    parts.push(`Clean and refined—exactly the kind of scent you gravitate toward.`);
  } else if (vibe === "seductive" && (fragranceProfile.sensuality > 50 || fragranceProfile.warmth > 50)) {
    parts.push(`Warm and inviting; it’s the kind of scent that leaves an impression.`);
  } else if (vibe === "timeless" && (fragVibe.includes("classic") || fragVibe.includes("refined") || fragranceProfile.versatility > 60)) {
    parts.push(`Timeless and versatile—a bottle you’ll reach for again and again.`);
  } else if (family === "fresh" && fragranceProfile.freshness > 60) {
    parts.push(`It matches your preference for fresh, clean scents—bright and easy to wear.`);
  } else if (family === "woody" && fragranceProfile.woodiness > 50) {
    parts.push(`It deepens your woody range with a distinct character.`);
  } else if (family === "sweet" && fragranceProfile.warmth > 50 && fragranceProfile.sweetness > 40) {
    parts.push(`Warm and inviting, with the kind of depth you enjoy.`);
  } else if (family === "spicy" && fragranceProfile.spice > 50) {
    parts.push(`It brings the spice and depth you’re drawn to—bold but wearable.`);
  }

  if (parts.length === 0) {
    return `${name} fits your profile: ${category}. It’s a strong option to try next.`;
  }
  return parts.join(" ");
}
