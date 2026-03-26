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
import { getFragranceCatalogFromSupabase } from "@/lib/fragrancesFromSupabase";
import { runRecommendationEngine } from "@/lib/recommendations/engine";
import { polishRecommendationCopy, buildPolishedFromRaw } from "@/lib/recommendations/polish";

const AI_UNAVAILABLE_MESSAGE = "AI analysis temporarily unavailable. Please try again.";

/** Result of image detection. If needsConfirmation, show confirm step. If error is set, do not destructure detections/needsConfirmation. */
type AnalyzeImageResult = {
  detections: DetectionItem[];
  needsConfirmation: boolean;
  error?: string;
};

/**
 * Run AI vision on the uploaded image. Returns detections and whether we need user confirmation.
 * On OpenAI failure or missing API key, returns a safe result with error set instead of throwing.
 * Only accepts base64 image data from the client; no image URLs. Sends base64 directly to OpenAI.
 */
export async function analyzeCollectionImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<AnalyzeImageResult> {
  console.log("[upload flow] Server action: analyzeCollectionImage — called (base64 only)");
  try {
    const base64 = (imageBase64 ?? "").replace(/^data:image\/\w+;base64,/, "");
    if (!base64) {
      return { detections: [], needsConfirmation: false, error: AI_UNAVAILABLE_MESSAGE };
    }

    const raw = await detectFragrancesFromImage(base64, mimeType);
    if (!raw || !Array.isArray(raw.detections)) {
      return { detections: [], needsConfirmation: false, error: AI_UNAVAILABLE_MESSAGE };
    }
    console.log("[upload flow] Server action: analyzeCollectionImage — done, detections:", raw.detections.length);
    return { detections: raw.detections, needsConfirmation: raw.needsConfirmation ?? false };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[upload flow] Server action: analyzeCollectionImage — failed:", msg);
    return { detections: [], needsConfirmation: false, error: AI_UNAVAILABLE_MESSAGE };
  }
}

/** Fallback analysis when OpenAI fails so we still return a valid result. */
const FALLBACK_ANALYSIS = {
  scentProfile: {
    dominant: "Mixed",
    secondary: "Versatile",
    accent: "Balanced",
    description: "A balanced collection with room to grow.",
  },
  strengths: ["Diverse selection.", "Room to grow."],
  weaknesses: ["Add more variety over time."],
  missingCategories: ["Fresh", "Woody", "Oriental"] as string[],
  whoThisSuits: undefined as string | undefined,
  overallVibe: undefined as string | undefined,
  howItWears: undefined as string | undefined,
  bestSeasons: undefined as string[] | undefined,
  bestOccasions: undefined as string[] | undefined,
  whyItWorks: undefined as string | undefined,
  similarFragrances: undefined as string[] | undefined,
};

/**
 * Generate full collection analysis from confirmed detections.
 * Uses rule-based recommendation engine (5 fragrances, layering, when-to-wear), then AI to polish copy.
 * If the OpenAI analysis call fails, uses fallback text and keeps the recommendation flow intact.
 */
export async function generateCollectionAnalysis(
  detections: DetectionItem[],
  quizAnswers?: Record<string, string>
): Promise<CollectionResult> {
  console.log("[upload flow] Server action: generateCollectionAnalysis — called, detections:", detections?.length ?? 0);
  const safeDetections = Array.isArray(detections) ? detections : [];

  let analysis: typeof FALLBACK_ANALYSIS;
  try {
    const raw = await generateAnalysisFromDetections(safeDetections);
    analysis =
      raw && raw.scentProfile
        ? {
          scentProfile: {
            dominant: String(raw.scentProfile.dominant ?? "").trim() || FALLBACK_ANALYSIS.scentProfile.dominant,
            secondary: String(raw.scentProfile.secondary ?? "").trim() || FALLBACK_ANALYSIS.scentProfile.secondary,
            accent: String(raw.scentProfile.accent ?? "").trim() || FALLBACK_ANALYSIS.scentProfile.accent,
            description: String(raw.scentProfile.description ?? "").trim() || FALLBACK_ANALYSIS.scentProfile.description,
          },
          strengths: Array.isArray(raw.strengths) && raw.strengths.length > 0 ? raw.strengths.map(String) : FALLBACK_ANALYSIS.strengths,
          weaknesses: Array.isArray(raw.weaknesses) && raw.weaknesses.length > 0 ? raw.weaknesses.map(String) : FALLBACK_ANALYSIS.weaknesses,
          missingCategories: Array.isArray(raw.missingCategories) && raw.missingCategories.length > 0 ? raw.missingCategories.map(String) : FALLBACK_ANALYSIS.missingCategories,
          whoThisSuits: raw.whoThisSuits?.trim() || undefined,
          overallVibe: raw.overallVibe?.trim() || undefined,
          howItWears: raw.howItWears?.trim() || undefined,
          bestSeasons: raw.bestSeasons?.length ? raw.bestSeasons.map(String) : undefined,
          bestOccasions: raw.bestOccasions?.length ? raw.bestOccasions.map(String) : undefined,
          whyItWorks: raw.whyItWorks?.trim() || undefined,
          similarFragrances: raw.similarFragrances?.length ? raw.similarFragrances.map(String) : undefined,
        }
        : FALLBACK_ANALYSIS;
  } catch (e) {
    console.error("[upload flow] Server action: generateCollectionAnalysis — analysis failed, using fallback:", e instanceof Error ? e.message : String(e));
    analysis = FALLBACK_ANALYSIS;
  }

  const scoringItems: CollectionItemForScoring[] = safeDetections.slice(0, 10).map((d, i) => ({
    id: String(i + 1),
    category: inferCategory(d.name, d.brand),
    seasons: ["spring", "summer", "fall", "winter"],
    occasions: ["office", "casual", "date", "formal"],
    versatile: true,
  }));

  const scoreResult = computeCollectionScore(
    scoringItems.length > 0 ? scoringItems : [{
      id: "1",
      category: "Mixed",
      seasons: ["spring", "summer", "fall", "winter"],
      occasions: ["casual"],
      versatile: true,
    }]
  );
  const score = scoreResult?.score ?? 50;
  const breakdown = scoreResult?.breakdown;

  const strengths = analysis.strengths.length > 0 ? analysis.strengths : FALLBACK_ANALYSIS.strengths;
  const weaknesses = analysis.weaknesses.length > 0 ? analysis.weaknesses : FALLBACK_ANALYSIS.weaknesses;
  const missingCategories = analysis.missingCategories.length > 0 ? analysis.missingCategories : FALLBACK_ANALYSIS.missingCategories;

  const genderPreference = (quizAnswers?.genderPreference ?? quizAnswers?.q11 ?? "open") as "masculine" | "feminine" | "unisex" | "open";
  const catalog = await getFragranceCatalogFromSupabase();
  if (catalog && catalog.length > 0) {
    console.log("[recommendations] Loaded", catalog.length, "fragrances from Supabase.");
  } else {
    console.log("[recommendations] Using fallback catalog (fragranceCatalog.ts).");
  }
  const engineOutput = runRecommendationEngine({
    detectedFragrances: safeDetections.map((d) => ({ name: d.name, brand: d.brand })),
    missingCategories,
    strengths,
    weaknesses,
    quizAnswers,
    genderPreference,
    catalog: catalog && catalog.length > 0 ? catalog : undefined,
  });
  const polished = await polishRecommendationCopy(engineOutput);
  const recs = polished ?? buildPolishedFromRaw(engineOutput);

  return {
    score,
    scoreBreakdown: breakdown,
    scentProfile: { ...analysis.scentProfile, genderPreference },
    strengths,
    weaknesses,
    missingCategories,
    recommendedFragrances: recs?.recommendedFragrances ?? [],
    layeringSuggestions: recs?.layeringSuggestions ?? [],
    whenToWear: recs?.whenToWear ?? [],
    whoThisSuits: analysis.whoThisSuits,
    overallVibe: analysis.overallVibe,
    howItWears: analysis.howItWears,
    bestSeasons: analysis.bestSeasons,
    bestOccasions: analysis.bestOccasions,
    whyItWorks: analysis.whyItWorks,
    similarFragrances: analysis.similarFragrances,
  };
}

/**
 * Infer a scent-family category from fragrance name and brand for scoring.
 * Aligned with catalog categories: Fresh, Woody, Floral, Amber, Oriental, and common compound types.
 */
function inferCategory(name: string, brand: string): string {
  const t = `${name} ${brand}`.toLowerCase();
  if (t.includes("aquatic") || t.includes("marine") || t.includes("sea salt") || t.includes("acqua") || t.includes("ocean")) return "Fresh Aquatic";
  if (t.includes("citrus") || t.includes("neroli") || t.includes("cedrat") || t.includes("bergamot") || t.includes("orange") || t.includes("lemon") || t.includes("lime")) return "Fresh Citrus";
  if (t.includes("green") || t.includes("greenley") || t.includes("herbal") || (t.includes("vetiver") && !t.includes("woody"))) return "Green";
  if (t.includes("fresh") || t.includes("light blue") || t.includes("invictus") || t.includes("bleu") || t.includes("sauvage")) return "Fresh";
  if (t.includes("wood") || t.includes("santal") || t.includes("cedar") || t.includes("oud wood") || t.includes("sandal") || t.includes("vetiver")) return "Woody";
  if (t.includes("woody citrus") || t.includes("terre d") || t.includes("hacivat")) return "Woody Citrus";
  if (t.includes("fresh woody") || t.includes("wood sage")) return "Fresh Woody";
  if (t.includes("leather") || t.includes("ombre leather")) return "Leather";
  if (t.includes("flower") || t.includes("floral") || t.includes("rose") || t.includes("iris") || t.includes("jasmine") || t.includes("lily")) return "Floral";
  if (t.includes("amber") || t.includes("vanilla") || t.includes("gourmand") || t.includes("noir extreme") || t.includes("one million")) return "Amber";
  if (t.includes("oud") || t.includes("oriental") || t.includes("angel") || t.includes("spice") && (t.includes("oriental") || t.includes("oud"))) return "Oriental";
  if (t.includes("skin scent") || t.includes("another 13") || t.includes("musk")) return "Skin Scent";
  return "Mixed";
}

/**
 * Get recommendations for quiz-only flow (no collection). Uses same rule-based engine + AI polish.
 * Maps new quiz answers (q1–q9) to engine-ready preferences before calling the engine.
 */
export async function getRecommendationsForQuiz(
  quizAnswers: Record<string, string>
): Promise<{ recommendedFragrances: CollectionResult["recommendedFragrances"]; layeringSuggestions: string[]; whenToWear: string[] }> {
  const { mapQuizAnswersToEngine } = await import("@/lib/quizToEngineMap");
  const enginePreferences = mapQuizAnswersToEngine(quizAnswers);

  const catalog = await getFragranceCatalogFromSupabase();
  if (catalog && catalog.length > 0) {
    console.log("[recommendations] Loaded", catalog.length, "fragrances from Supabase.");
  } else {
    console.log("[recommendations] Using fallback catalog (fragranceCatalog.ts).");
  }

  // Personalize "missing category" gap boost so we don't give every user the same advantage.
  // These keywords feed into `categoryMatchesGap()` which matches via word overlap.
  const missingCategories = (() => {
    const family = enginePreferences.q1;
    switch (family) {
      case "fresh":
        return ["Woody", "Amber", "Oriental"];
      case "sweet":
        return ["Fresh", "Woody", "Oriental"];
      case "woody":
        return ["Fresh", "Floral", "Amber"];
      case "spicy":
        return ["Fresh", "Floral", "Woody"];
      default:
        return ["Fresh", "Woody", "Floral", "Amber", "Oriental"];
    }
  })();

  const quizAnswersForEngine: Record<string, string> = {
    q1: enginePreferences.q1,
    q2: enginePreferences.q2,
    q3: enginePreferences.q3,
    q4: enginePreferences.q4,
    q5: enginePreferences.q5,
    q8: enginePreferences.q8,
    q9: enginePreferences.q9,
    q11: enginePreferences.q11,
    q7: quizAnswers.q7 ?? "",
  };
  const engineOutput = runRecommendationEngine({
    detectedFragrances: [],
    missingCategories,
    strengths: [],
    weaknesses: [],
    quizAnswers: quizAnswersForEngine,
    genderPreference: enginePreferences.q11,
    userPreferredSeasons: enginePreferences.userPreferredSeasons,
    userProjection: enginePreferences.userProjection,
    catalog: catalog && catalog.length > 0 ? catalog : undefined,
    avoidSweet: quizAnswers.q7 === "turnoff_sweet",
  });
  const polished = await polishRecommendationCopy(engineOutput);
  const recs = polished ?? buildPolishedFromRaw(engineOutput);
  return {
    recommendedFragrances: recs.recommendedFragrances,
    layeringSuggestions: recs.layeringSuggestions,
    whenToWear: recs.whenToWear,
  };
}
