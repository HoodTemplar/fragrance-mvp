/**
 * Rule-based recommendation engine.
 * Picks 5 fragrances, 2–3 layering ideas, and when-to-wear from catalog using gaps, strengths, and quiz.
 */

import {
  FRAGRANCE_CATALOG,
  categoryMatchesGap,
  type CatalogFragrance,
  type BudgetTier,
} from "@/data/fragranceCatalog";
import type {
  RecommendationInput,
  RecommendationEngineOutput,
  PickedFragrance,
  LayeringSuggestionRaw,
  WhenToWearRaw,
} from "./types";

const BUDGET_MAP: Record<string, BudgetTier> = {
  budget: "budget",
  mid: "mid",
  luxe: "luxe",
  niche: "niche",
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function alreadyOwned(detected: { name: string; brand: string }[], f: CatalogFragrance): boolean {
  const key = `${normalize(f.brand)} ${normalize(f.name)}`;
  return detected.some(
    (d) => `${normalize(d.brand)} ${normalize(d.name)}` === key
  );
}

/** Infer categories present in collection from detected names/brands (simple keywords) */
function inferredCategories(detected: { name: string; brand: string }[]): Set<string> {
  const set = new Set<string>();
  const t = detected.map((d) => `${d.name} ${d.brand}`).join(" ").toLowerCase();
  if (/\b(fresh|aquatic|acqua|citrus|bleu|light)\b/.test(t)) set.add("Fresh");
  if (/\b(wood|santal|cedar|vetiver|terre|oud)\b/.test(t)) set.add("Woody");
  if (/\b(flower|floral|rose)\b/.test(t)) set.add("Floral");
  if (/\b(amber|vanilla|gourmand)\b/.test(t)) set.add("Amber");
  if (/\b(leather|ombre)\b/.test(t)) set.add("Leather");
  if (/\b(oriental|spice|oud)\b/.test(t)) set.add("Oriental");
  if (/\b(green|herb)\b/.test(t)) set.add("Green");
  return set;
}

export function runRecommendationEngine(input: RecommendationInput): RecommendationEngineOutput {
  const {
    detectedFragrances,
    missingCategories,
    strengths,
    weaknesses,
    quizAnswers = {},
  } = input;

  const owned = new Set(detectedFragrances.map((d) => `${normalize(d.brand)} ${normalize(d.name)}`));
  const hasCategory = inferredCategories(detectedFragrances);
  const budget = BUDGET_MAP[quizAnswers.q4 ?? "mid"] ?? "mid";
  const designerNiche = (quizAnswers.q5 ?? "both") as "designer" | "niche" | "both";
  const family = (quizAnswers.q1 ?? "fresh") as string;
  const occasion = (quizAnswers.q2 ?? "daily") as string;

  const candidates = FRAGRANCE_CATALOG.filter((f) => !alreadyOwned(detectedFragrances, f));

  const score = (f: CatalogFragrance): number => {
    let s = 0;
    const catLower = f.category.toLowerCase();
    if (missingCategories.length > 0 && categoryMatchesGap(f.category, missingCategories)) s += 30;
    if (family === "fresh" && (catLower.includes("fresh") || catLower.includes("aquatic") || catLower.includes("citrus"))) s += 15;
    if (family === "woody" && (catLower.includes("wood"))) s += 15;
    if (family === "sweet" && (catLower.includes("amber") || catLower.includes("gourmand") || catLower.includes("vanilla"))) s += 15;
    if (family === "spicy" && (catLower.includes("spicy") || catLower.includes("oud") || catLower.includes("oriental"))) s += 15;
    if (occasion === "daily" && f.occasions.includes("office")) s += 10;
    if (occasion === "date" && f.occasions.includes("date")) s += 10;
    if (occasion === "nightlife" && f.occasions.includes("evening")) s += 10;
    if (budget === f.budgetTier) s += 8;
    if (budget === "budget" && (f.budgetTier === "budget" || f.budgetTier === "mid")) s += 5;
    if (designerNiche === f.designerNiche) s += 5;
    if (designerNiche === "both") s += 2;
    if (!hasCategory.has(f.category)) s += 5;
    return s;
  };

  const sorted = [...candidates].sort((a, b) => score(b) - score(a));
  const picked: PickedFragrance[] = [];
  const usedIds = new Set<string>();

  for (const f of sorted) {
    if (picked.length >= 5) break;
    if (usedIds.has(f.id)) continue;
    usedIds.add(f.id);
    let reason = "Fits your profile.";
    if (missingCategories.length > 0 && categoryMatchesGap(f.category, missingCategories)) reason = `Fills a gap: ${f.category}.`;
    else if (family === "fresh" && (f.category.toLowerCase().includes("fresh") || f.category.toLowerCase().includes("aquatic"))) reason = "Matches your preference for fresh, clean scents.";
    else if (family === "woody") reason = "Deepens your woody range with a different take.";
    else if (occasion === "daily" && f.occasions.includes("office")) reason = "Ideal for daily and office wear.";
    else if (occasion === "date" && f.occasions.includes("date")) reason = "Strong option for date night.";
    picked.push({ id: f.id, name: f.name, brand: f.brand, category: f.category, reason });
  }

  while (picked.length < 5 && candidates.length > 0) {
    const next = candidates.find((f) => !usedIds.has(f.id));
    if (!next) break;
    usedIds.add(next.id);
    picked.push({ id: next.id, name: next.name, brand: next.brand, category: next.category, reason: "A versatile addition to consider." });
  }

  const layering: LayeringSuggestionRaw[] = [];
  const detectedNames = detectedFragrances.map((d) => `${d.brand} ${d.name}`);
  if (detectedNames.length >= 1 && picked.length >= 1) {
    layering.push({
      first: detectedNames[0],
      second: `${picked[0].brand} ${picked[0].name}`,
      reason: "Use your existing bottle as base and add the recommended one for a day-to-evening transition.",
    });
  }
  if (hasCategory.has("Woody") && picked.some((p) => p.category.toLowerCase().includes("fresh"))) {
    const freshPick = picked.find((p) => p.category.toLowerCase().includes("fresh") || p.category.toLowerCase().includes("citrus"));
    if (freshPick) layering.push({
      first: freshPick.name,
      second: "one of your woody bottles",
      reason: "Layer a fresh top with your woody base for a balanced, all-day scent.",
    });
  }
  if (detectedNames.length >= 2) {
    layering.push({
      first: detectedNames[0],
      second: detectedNames[1],
      reason: "Try layering two of your current favorites for a unique combination.",
    });
  }
  const layeringFinal = layering.slice(0, 3);

  const whenToWear: WhenToWearRaw[] = [];
  if (hasCategory.has("Fresh") || picked.some((p) => p.category.toLowerCase().includes("fresh"))) {
    whenToWear.push({ occasion: "Office", tip: "Reach for your fresh or citrus options for a professional, approachable scent." });
  }
  if (
    hasCategory.has("Woody") ||
    picked.some((p) => p.category.toLowerCase().includes("wood"))
  ) {
    whenToWear.push({
      occasion: "Date night",
      tip: "Your deeper woody or amber options work well for evening.",
    });
  }
  
  if (missingCategories.some((g) => /fresh|aquatic|summer/i.test(g))) {
    whenToWear.push({
      occasion: "Summer",
      tip: "Consider adding one of the recommended fresh or aquatic options for heat-friendly wear.",
    });
  }
  
  whenToWear.push({
    occasion: "Weekend",
    tip: "Your versatile, all-season picks are ideal for casual days.",
  });
  if (whenToWear.length < 3 && strengths.length > 0) {
    whenToWear.push({ occasion: "When it matters", tip: "Lean on your strengths—use the categories you already have variety in." });
  }
  const whenFinal = whenToWear.slice(0, 5);

  return { fragrances: picked, layering: layeringFinal, whenToWear: whenFinal };
}
