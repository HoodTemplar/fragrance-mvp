/**
 * Generates a scent profile from quiz answers (new 9-question format).
 * Maps answers to dominant family, occasion, accent, and a short description.
 * Uses same family/occasion/vibe logic as the engine mapper for consistency.
 */

import { mapQuizAnswersToEngine } from "@/lib/quizToEngineMap";
import type { ScentProfile } from "@/types";

const FAMILY_LABELS: Record<string, string> = {
  fresh: "Fresh & Clean",
  sweet: "Sweet & Gourmand",
  woody: "Woody & Earthy",
  spicy: "Spicy & Oriental",
};

const OCCASION_LABELS: Record<string, string> = {
  daily: "Daily wear",
  nightlife: "Nightlife",
  date: "Date night",
  all: "Every occasion",
};

const ACCENT_LABELS: Record<string, string> = {
  light: "Transparent",
  warm: "Warm",
  bold: "Bold",
  balanced: "Balanced",
};

export function generateScentProfile(answers: Record<string, string>): ScentProfile {
  const engine = mapQuizAnswersToEngine(answers);
  const family = engine.q1;
  const occasion = engine.q2;
  const feel = engine.q3;
  const vibe = engine.q8;
  const genderPreference = engine.q11;

  const dominant = FAMILY_LABELS[family] ?? "Fresh & Clean";
  const secondary = OCCASION_LABELS[occasion] ?? "Daily wear";
  const accent = ACCENT_LABELS[feel] ?? "Balanced";

  const parts: string[] = [];
  parts.push(`You lean ${family} with a taste for ${occasion === "all" ? "any occasion" : occasion}.`);
  if (vibe === "clean") parts.push("You gravitate toward clean, refined scents that feel put-together.");
  else if (vibe === "seductive") parts.push("You want a scent that leaves an impression.");
  else if (vibe === "adventurous") parts.push("You’re drawn to intriguing, unexpected fragrances.");
  else parts.push("You value timeless, classic character.");
  if (engine.q5 === "niche") parts.push("You’re drawn to niche and artisanal fragrances.");
  else if (engine.q5 === "designer") parts.push("Designer classics and crowd-pleasers resonate with you.");
  else parts.push("You choose by the scent itself—designer or niche.");
  if (answers.q7 === "turnoff_sweet") parts.push("You prefer dry or fresh over sweet.");
  else if (answers.q8 === "scent_vanilla_warmth") parts.push("You embrace warmth and creamy vanilla.");
  if (engine.userPreferredSeasons?.length === 1) {
    parts.push(`Your natural habitat is ${engine.userPreferredSeasons[0]}.`);
  } else if (engine.userPreferredSeasons && engine.userPreferredSeasons.length > 1) {
    parts.push("You wear fragrance across the seasons.");
  }

  const description =
    parts.join(" ") ||
    "Your answers point to a balanced, versatile scent profile—fresh enough for day, with depth for when it matters.";

  return {
    dominant,
    secondary,
    accent,
    description,
    genderPreference,
  };
}
