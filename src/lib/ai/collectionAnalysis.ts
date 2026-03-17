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
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: key });
}

/**
 * Send image to AI and get back likely fragrance names and brands as JSON.
 * If uncertain (any confidence below threshold), needsConfirmation is true.
 * Only sends image data as base64 (data URL). No remote image_url — OpenAI receives inline base64 only.
 */
export async function detectFragrancesFromImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<DetectFragrancesResult> {
  const openai = getOpenAI();
  console.log("[upload flow] Step 1: OpenAI detection call — starting (model: gpt-4o, base64 only)");
  try {
    // OpenAI vision: send image as inline base64 data URL only (no remote URLs).
    const imagePayload = {
      type: "image_url" as const,
      image_url: { url: `data:${mimeType};base64,${imageBase64}` },
    };

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
            imagePayload,
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
      max_tokens: 1536,
      messages: [
        {
          role: "user",
          content: `You are an expert fragrance consultant writing a personalized, human analysis of a customer's fragrance collection. Sound like a knowledgeable friend—warm, specific, and insightful. Avoid generic fluff; reference the actual bottles where it helps. Write in clear, confident prose. Return only a single JSON object, no other text.

Collection:
${listText}

JSON structure (use these exact keys). All keys are required; for arrays use 2-4 items unless the list is empty.
{
  "scentProfile": {
    "dominant": "Main scent family (e.g. Woody & Amber, Fresh Citrus)",
    "secondary": "Supporting theme",
    "accent": "Noticeable accent (e.g. Floral, Spicy)",
    "description": "One or two sentences: what this collection says about their taste. Be specific and human."
  },
  "strengths": ["2-4 concrete strengths—what they did right"],
  "weaknesses": ["1-3 gentle, constructive gaps or blind spots"],
  "missingCategories": ["Scent families or styles they might enjoy adding"],
  "whoThisSuits": "One sentence: who this collection is for (e.g. 'Someone who likes depth and versatility without sacrificing wearability').",
  "overallVibe": "One short paragraph: the overall vibe of this collection—mood, personality, how it comes across.",
  "howItWears": "One or two sentences: how this collection wears in practice—development, longevity, versatility, when it shines.",
  "bestSeasons": ["2-4 seasons where this collection really works, e.g. Spring, Fall"],
  "bestOccasions": ["2-4 occasions, e.g. Office, Weekend casual, Date night"],
  "whyItWorks": "One or two sentences: why this collection works as a whole—balance, coherence, or intentional variety.",
  "layeringSuggestions": ["2-3 specific layering ideas using their bottles or styles"],
  "whenToWear": ["2-4 practical tips: occasion or situation + short tip"],
  "similarFragrances": ["2-4 short suggestions: 'If you like X, try Y' or 'Fans of this collection often enjoy...'"]
}

If the list is empty or "No specific bottles", still return a complete JSON with a generic, encouraging balanced profile and empty or minimal arrays where needed.`,
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

    const str = (v: unknown) => (v != null ? String(v).trim() : "");
    const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : []);

    console.log("[upload flow] Step 4: analysis generation call — success");
    return {
      scentProfile: {
        dominant: str(json.scentProfile.dominant) || "Mixed",
        secondary: str(json.scentProfile.secondary) || "Versatile",
        accent: str(json.scentProfile.accent) || "Balanced",
        description: str(json.scentProfile.description) || "A balanced collection with room to grow.",
      },
      strengths: arr(json.strengths),
      weaknesses: arr(json.weaknesses),
      missingCategories: arr(json.missingCategories),
      layeringSuggestions: arr(json.layeringSuggestions),
      whenToWear: arr(json.whenToWear),
      whoThisSuits: str(json.whoThisSuits) || undefined,
      overallVibe: str(json.overallVibe) || undefined,
      howItWears: str(json.howItWears) || undefined,
      bestSeasons: arr(json.bestSeasons).length > 0 ? arr(json.bestSeasons) : undefined,
      bestOccasions: arr(json.bestOccasions).length > 0 ? arr(json.bestOccasions) : undefined,
      whyItWorks: str(json.whyItWorks) || undefined,
      similarFragrances: arr(json.similarFragrances).length > 0 ? arr(json.similarFragrances) : undefined,
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
