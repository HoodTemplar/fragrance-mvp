/**
 * Generates a simple scent profile from quiz answers.
 * Maps answers to dominant family, occasion, budget, and a short description.
 */

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

export function generateScentProfile(answers: Record<string, string>): ScentProfile {
  const family = answers.q1 ?? "fresh";
  const occasion = answers.q2 ?? "daily";
  const feel = answers.q3 ?? "balanced";
  const budget = answers.q4 ?? "mid";
  const designerNiche = answers.q5 ?? "both";
  const sweet = answers.q6 ?? "subtle";
  const rotation = answers.q7 ?? "rotation";
  const vibe = answers.q8 ?? "timeless";
  const longevity = answers.q9 ?? "day";
  const journey = answers.q10 ?? "curious";

  const dominant = FAMILY_LABELS[family] ?? "Fresh & Clean";
  const secondary = OCCASION_LABELS[occasion] ?? "Daily wear";
  const accent = feel === "light" ? "Transparent" : feel === "warm" ? "Warm" : feel === "bold" ? "Bold" : "Balanced";

  const parts: string[] = [];
  parts.push(`You lean ${family} with a taste for ${occasion === "all" ? "any occasion" : occasion}.`);
  if (sweet === "love") parts.push("You embrace sweetness; gourmand and amber suit you.");
  else if (sweet === "avoid") parts.push("You prefer dry, fresh, or woody over sweet.");
  else parts.push("You like sweetness when it’s refined and subtle.");
  if (designerNiche === "niche") parts.push("You’re drawn to niche and artisanal fragrances.");
  else if (designerNiche === "designer") parts.push("Designer classics and crowd-pleasers resonate with you.");
  else parts.push("You choose by the scent itself—designer or niche.");
  if (budget === "niche" || budget === "luxe") parts.push("You invest in quality and discovery.");
  if (vibe === "seductive") parts.push("You want a scent that leaves an impression.");
  if (vibe === "timeless") parts.push("You value timeless, classic character.");

  const description = parts.join(" ");
  const genderPreference = (answers.q11 ?? "open") as "masculine" | "feminine" | "unisex" | "open";

  return {
    dominant,
    secondary,
    accent,
    description: description || "Your answers point to a balanced, versatile scent profile—fresh enough for day, with depth for when it matters.",
    genderPreference,
  };
}
