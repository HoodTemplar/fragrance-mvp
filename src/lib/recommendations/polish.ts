/**
 * AI polish for recommendation copy only.
 * Takes rule-based picks and turns them into short, non-generic blurbs.
 * Falls back to raw reasons if API is missing or the call fails.
 */

import OpenAI from "openai";
import type { RecommendationEngineOutput, PolishedRecommendations } from "./types";

function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
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

/**
 * Polish recommendation copy using AI. Returns null on failure so caller can use raw copy.
 */
export async function polishRecommendationCopy(
  engineOutput: RecommendationEngineOutput
): Promise<PolishedRecommendations | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  const fragList = engineOutput.fragrances
    .map((f) => `- ${f.brand} ${f.name} (${f.category}): ${f.reason}`)
    .join("\n");
  const layerList = engineOutput.layering
    .map((l) => `- ${l.first} + ${l.second}: ${l.reason}`)
    .join("\n");
  const whenList = engineOutput.whenToWear
    .map((w) => `- ${w.occasion}: ${w.tip}`)
    .join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `You are a fragrance expert. Rewrite the following recommendation copy to be polished, specific, and non-generic. Keep each item concise (1–2 sentences). Do not add new fragrances or change the structure—only improve the wording.

FRAGRANCE PICKS (write a short, specific "note" for each—why it fits this person):
${fragList}

LAYERING (rewrite each as one polished sentence):
${layerList}

WHEN TO WEAR (rewrite each as one short line):
${whenList}

Return only a JSON object with this exact structure (no other text):
{
  "notes": ["note for first fragrance", "note for second", ...],
  "layeringCopy": ["first polished layering sentence", "second", ...],
  "whenToWearCopy": ["first when-to-wear line", "second", ...]
}
The arrays must have the same length and order as the inputs.`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return null;

    const json = extractJSON(content) as { notes?: string[]; layeringCopy?: string[]; whenToWearCopy?: string[] } | null;
    if (!json || !Array.isArray(json.notes)) return null;

    const notes = json.notes as string[];
    const layeringCopy = Array.isArray(json.layeringCopy) ? (json.layeringCopy as string[]) : engineOutput.layering.map((l) => `${l.first} + ${l.second}: ${l.reason}`);
    const whenToWearCopy = Array.isArray(json.whenToWearCopy) ? (json.whenToWearCopy as string[]) : engineOutput.whenToWear.map((w) => `${w.occasion}: ${w.tip}`);

    return {
      recommendedFragrances: engineOutput.fragrances.map((f, i) => ({
        id: f.id,
        name: f.name,
        brand: f.brand,
        category: f.category,
        note: (notes[i] ?? f.reason).trim(),
        isSponsored: false,
      })),
      layeringSuggestions: layeringCopy.slice(0, 3),
      whenToWear: whenToWearCopy,
    };
  } catch {
    return null;
  }
}

/**
 * Build polished recommendations: run engine then polish. If polish fails, use raw reasons.
 */
export function buildPolishedFromRaw(engineOutput: RecommendationEngineOutput): PolishedRecommendations {
  return {
    recommendedFragrances: engineOutput.fragrances.map((f) => ({
      id: f.id,
      name: f.name,
      brand: f.brand,
      category: f.category,
      note: f.reason,
      isSponsored: false,
    })),
    layeringSuggestions: engineOutput.layering.map((l) => `${l.first} + ${l.second} — ${l.reason}`),
    whenToWear: engineOutput.whenToWear.map((w) => `${w.occasion}: ${w.tip}`),
  };
}
