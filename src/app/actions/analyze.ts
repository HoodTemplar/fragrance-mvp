"use server";

/**
 * AI collection analysis: detect fragrances from image, then generate analysis from confirmed list.
 * Recommendation logic is rule-based (5 picks, layering, when-to-wear); AI only polishes the copy.
 */

import {
  detectFragrancesFromImage,
  generateAnalysisFromDetections,
} from "@/lib/ai/collectionAnalysis";
import type { DetectionItem } from "@/lib/ai/types";
import type { CollectionResult } from "@/types";
import { getCollectionResult } from "@/lib/mockData";
import { computeCollectionScore } from "@/lib/scoring";
import type { CollectionItemForScoring } from "@/lib/scoring";
import { runRecommendationEngine } from "@/lib/recommendations/engine";
import { polishRecommendationCopy, buildPolishedFromRaw } from "@/lib/recommendations/polish";

/** Result of image detection. If needsConfirmation, show confirm step. */
export type AnalyzeImageResult = {
  detections: DetectionItem[];
  needsConfirmation: boolean;
  error?: string;
};

/**
 * Run AI vision on the uploaded image. Returns detections and whether we need user confirmation.
 * Throws with the exact error message on failure.
 */
export async function analyzeCollectionImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<AnalyzeImageResult> {
  console.log("[upload flow] Server action: analyzeCollectionImage — called");
  const { detections, needsConfirmation } = await detectFragrancesFromImage(
    imageBase64.replace(/^data:image\/\w+;base64,/, ""),
    mimeType
  );
  console.log("[upload flow] Server action: analyzeCollectionImage — done, detections:", detections.length);
  return { detections, needsConfirmation };
}

/**
 * Generate full collection analysis from confirmed detections.
 * Uses rule-based recommendation engine (5 fragrances, layering, when-to-wear), then AI to polish copy.
 * Throws with the exact error message if the AI analysis call fails.
 */
export async function generateCollectionAnalysis(
  detections: DetectionItem[],
  quizAnswers?: Record<string, string>
): Promise<CollectionResult> {
  console.log("[upload flow] Server action: generateCollectionAnalysis — called, detections:", detections.length);
  const analysis = await generateAnalysisFromDetections(detections);

  const scoringItems: CollectionItemForScoring[] = detections.slice(0, 10).map((d, i) => ({
    id: String(i + 1),
    category: inferCategory(d.name, d.brand),
    seasons: ["spring", "summer", "fall", "winter"],
    occasions: ["office", "casual", "date", "formal"],
    versatile: true,
  }));

  const { score, breakdown } = computeCollectionScore(
    scoringItems.length > 0 ? scoringItems : [{
      id: "1",
      category: "Mixed",
      seasons: ["spring", "summer", "fall", "winter"],
      occasions: ["casual"],
      versatile: true,
    }]
  );

  const strengths = analysis.strengths.length > 0 ? analysis.strengths : ["Diverse selection.", "Room to grow."];
  const weaknesses = analysis.weaknesses.length > 0 ? analysis.weaknesses : ["Add more variety over time."];
  const missingCategories = analysis.missingCategories.length > 0 ? analysis.missingCategories : ["Fresh", "Woody", "Oriental"];

  const engineOutput = runRecommendationEngine({
    detectedFragrances: detections.map((d) => ({ name: d.name, brand: d.brand })),
    missingCategories,
    strengths,
    weaknesses,
    quizAnswers,
  });
  const polished = await polishRecommendationCopy(engineOutput);
  const recs = polished ?? buildPolishedFromRaw(engineOutput);

  return {
    score,
    scoreBreakdown: breakdown,
    scentProfile: analysis.scentProfile,
    strengths,
    weaknesses,
    missingCategories,
    recommendedFragrances: recs.recommendedFragrances,
    layeringSuggestions: recs.layeringSuggestions,
    whenToWear: recs.whenToWear,
  };
}

function inferCategory(name: string, brand: string): string {
  const t = `${name} ${brand}`.toLowerCase();
  if (t.includes("fresh") || t.includes("aquatic") || t.includes("citrus")) return "Fresh";
  if (t.includes("wood") || t.includes("santal") || t.includes("cedar")) return "Woody";
  if (t.includes("flower") || t.includes("floral") || t.includes("rose")) return "Floral";
  if (t.includes("amber") || t.includes("vanilla") || t.includes("gourmand")) return "Amber";
  if (t.includes("oud") || t.includes("spice") || t.includes("oriental")) return "Oriental";
  return "Mixed";
}

/**
 * Get recommendations for quiz-only flow (no collection). Uses same rule-based engine + AI polish.
 */
export async function getRecommendationsForQuiz(
  quizAnswers: Record<string, string>
): Promise<{ recommendedFragrances: CollectionResult["recommendedFragrances"]; layeringSuggestions: string[]; whenToWear: string[] }> {
  const engineOutput = runRecommendationEngine({
    detectedFragrances: [],
    missingCategories: ["Fresh", "Woody", "Floral", "Amber", "Oriental"],
    strengths: [],
    weaknesses: [],
    quizAnswers,
  });
  const polished = await polishRecommendationCopy(engineOutput);
  const recs = polished ?? buildPolishedFromRaw(engineOutput);
  return {
    recommendedFragrances: recs.recommendedFragrances,
    layeringSuggestions: recs.layeringSuggestions,
    whenToWear: recs.whenToWear,
  };
}
