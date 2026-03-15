/**
 * AI-powered fragrance collection analysis.
 * Uses OpenAI Vision for image understanding and GPT for analysis text.
 * Throws with the exact error message when the API key is missing or a call fails.
 */

import OpenAI from "openai";
import type { DetectionItem, DetectFragrancesResult, AnalysisPromptResult } from "./types";

const CONFIDENCE_THRESHOLD = 0.7;

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set in .env.local");
  }
  return new OpenAI({ apiKey: key });
}

/**
 * Send image to AI and get back likely fragrance names and brands as JSON.
 * If uncertain (any confidence below threshold), needsConfirmation is true.
 */
export async function detectFragrancesFromImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<DetectFragrancesResult> {
  const openai = getOpenAI();
  console.log("[upload flow] Step 1: OpenAI detection call — starting (model: gpt-4o)");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are analyzing a photo of a fragrance shelf or collection. Identify each visible bottle.

Return a JSON object only, no other text, with this exact structure:
{
  "detections": [
    { "name": "Exact fragrance name if readable", "brand": "Brand name", "confidence": 0.0 to 1.0 }
  ]
}

Rules:
- confidence = how sure you are (0-1). Use lower values if the label is blurry or partially visible.
- If you cannot read a bottle, omit it or use confidence 0.3.
- Return only valid JSON.`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("OpenAI detection: empty response from model.");
    }

    const json = extractJSON(content);
    if (!json || !Array.isArray(json.detections)) {
      throw new Error("OpenAI detection: response was not valid JSON with a detections array.");
    }

    const detections: DetectionItem[] = json.detections
      .filter((d: unknown) => d && typeof d === "object" && "name" in d && "brand" in d)
      .map((d: Record<string, unknown>) => ({
        name: String(d.name ?? "").trim() || "Unknown",
        brand: String(d.brand ?? "").trim() || "Unknown",
        confidence: typeof d.confidence === "number" ? Math.max(0, Math.min(1, d.confidence)) : 0.5,
      }))
      .filter((d) => d.name || d.brand);

    const needsConfirmation = detections.some((d) => d.confidence < CONFIDENCE_THRESHOLD);
    console.log("[upload flow] Step 1: OpenAI detection call — success, detections:", detections.length, "needsConfirmation:", needsConfirmation);
    return { detections, needsConfirmation };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "OpenAI detection failed.";
    console.error("[upload flow] Step 1: OpenAI detection call — failed:", msg);
    throw e instanceof Error ? e : new Error(msg);
  }
}

/**
 * Generate full analysis text (profile, strengths, weaknesses, etc.) from confirmed detections.
 * Returns JSON. Throws with the exact error message if the API key is missing or the call fails.
 */
export async function generateAnalysisFromDetections(
  detections: DetectionItem[]
): Promise<AnalysisPromptResult> {
  const openai = getOpenAI();
  console.log("[upload flow] Step 4: analysis generation call — starting, detections count:", detections.length);
  const listText =
    detections.length > 0
      ? detections.map((d) => `- ${d.brand} ${d.name}`).join("\n")
      : "No specific bottles identified.";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Based on this fragrance collection list (from a photo), write a short analysis. Return only a single JSON object, no other text.

Collection:
${listText}

JSON structure (use these exact keys):
{
  "scentProfile": {
    "dominant": "e.g. Woody & Amber",
    "secondary": "e.g. Fresh Citrus",
    "accent": "e.g. Floral",
    "description": "One or two sentences describing their overall scent profile"
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "missingCategories": ["category 1", "category 2"],
  "layeringSuggestions": ["suggestion 1", "suggestion 2"],
  "whenToWear": ["occasion: tip", "occasion: tip"]
}

Keep each array to 2-4 items. Be concise. If the list is empty or "No specific bottles", still return a generic balanced profile.`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("OpenAI analysis: empty response from model.");
    }

    const json = extractJSON(content) as AnalysisPromptResult | null;
    if (!json || !json.scentProfile) {
      throw new Error("OpenAI analysis: response was not valid JSON with scentProfile.");
    }

    console.log("[upload flow] Step 4: analysis generation call — success");
    return {
      scentProfile: {
        dominant: String(json.scentProfile.dominant ?? "").trim() || "Mixed",
        secondary: String(json.scentProfile.secondary ?? "").trim() || "Versatile",
        accent: String(json.scentProfile.accent ?? "").trim() || "Balanced",
        description: String(json.scentProfile.description ?? "").trim() || "A balanced collection with room to grow.",
      },
      strengths: Array.isArray(json.strengths) ? json.strengths.map(String) : [],
      weaknesses: Array.isArray(json.weaknesses) ? json.weaknesses.map(String) : [],
      missingCategories: Array.isArray(json.missingCategories) ? json.missingCategories.map(String) : [],
      layeringSuggestions: Array.isArray(json.layeringSuggestions) ? json.layeringSuggestions.map(String) : [],
      whenToWear: Array.isArray(json.whenToWear) ? json.whenToWear.map(String) : [],
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "OpenAI analysis failed.";
    console.error("[upload flow] Step 4: analysis generation call — failed:", msg);
    throw e instanceof Error ? e : new Error(msg);
  }
}

function extractJSON(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
