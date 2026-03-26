import type { ScentProfile, ScentArchetypeResult } from "@/types";
import type { EngineReadyPreferences } from "@/lib/quizToEngineMap";

export type ScentDnaDisplay = {
  families: string[];
  accords: string[];
  sweetness: string;
  darkness: string;
  texture: string;
};

function titleCase(s: string) {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function familyFromEngine(q1Family: string | undefined) {
  const f = (q1Family ?? "").trim().toLowerCase();
  if (!f) return "Fresh";
  if (f === "fresh") return "Fresh";
  if (f === "sweet") return "Sweet";
  if (f === "woody") return "Woody";
  if (f === "spicy") return "Spicy";
  return titleCase(f);
}

function deriveAccords(family: string, vibe: string, avoidSweet: boolean): string[] {
  const baseByFamily: Record<string, string[]> = {
    Fresh: ["Citrus sparkle", "Aquatic lift", "Green aromatics"],
    Sweet: ["Vanilla warmth", "Amber glow", avoidSweet ? "Soft woods" : "Gourmand softness"],
    Woody: ["Cedar-dry woods", "Skin musk base", "Creamy sandalwood"],
    Spicy: ["Warm spice haze", "Incense-like depth", "Leather edge"],
  };

  const vibeAccords: Record<string, string[]> = {
    clean: ["Clean musk"],
    timeless: ["Polished woods"],
    adventurous: ["Smoky incense"],
    seductive: ["Silk-like warmth"],
  };

  const base = baseByFamily[family] ?? baseByFamily.Fresh;
  const vibeBits = vibeAccords[vibe] ?? [];

  // Return 4-ish accords for a readable "DNA" block.
  const out = [...base, ...vibeBits];
  return Array.from(new Set(out)).slice(0, 4);
}

function deriveSweetness(family: string, avoidSweet: boolean): string {
  if (avoidSweet) {
    return family === "Sweet" ? "Dry, low-sweet (keeps it sophisticated)" : "Low-sweet and clean";
  }
  if (family === "Sweet") return "Creamy sweetness (glossy but elegant)";
  if (family === "Fresh") return "Light sweetness (fresh-forward)";
  return "Balanced sweetness (minimal gourmand edges)";
}

function deriveDarkness(vibe: string, feel: string, family: string, projection: string | undefined): string {
  const proj = (projection ?? "").toLowerCase();

  let score = 0;
  if (vibe === "adventurous") score += 3;
  if (feel === "bold") score += 2;
  if (family === "spicy") score += 2;
  if (family === "woody") score += vibe === "adventurous" ? 2 : 1;
  if (proj === "strong" || proj === "bold") score += 1;

  if (score >= 6) return "Moody / dark-leaning";
  if (score >= 4) return "Shadowy depth";
  return "Bright-to-medium (not heavy)";
}

function deriveTexture(vibe: string, feel: string, family: string, projection: string | undefined): string {
  const proj = (projection ?? "").toLowerCase();
  if (proj === "intimate") {
    return vibe === "clean" ? "Airy, skin-close crispness" : "Close, velvet-textured layering";
  }
  if (proj === "strong" || proj === "bold") {
    return vibe === "adventurous" ? "Velvety with a smoky edge" : "Dense, more persistent texture";
  }

  if (family === "Fresh") return vibe === "clean" ? "Airy and crisp" : "Breezy, smooth coolness";
  if (family === "Sweet") return vibe === "seductive" ? "Silky gourmand warmth" : "Creamy-soft comfort";
  if (family === "Woody") return feel === "bold" ? "Dry woods with a grounded finish" : "Soft-wood dryness";
  if (family === "Spicy") return vibe === "adventurous" ? "Resinous depth with tension" : "Warm resin and spice haze";
  return vibe === "clean" ? "Airy crispness" : "Polished, layered texture";
}

function getFamiliesFromArchetype(archetype?: ScentArchetypeResult): string[] | null {
  if (!archetype?.fragranceFamilies?.length) return null;
  // Keep it short for the UI: dominant first, then 2–3 secondary families.
  return archetype.fragranceFamilies.slice(0, 4);
}

/**
 * Client-safe "Scent DNA" inference from quiz answers.
 * This does not change the recommendation engine; it only improves the result UI.
 */
export function deriveScentDnaFromQuiz(
  profile: ScentProfile | null,
  quizAnswers: Record<string, string> | null,
  quizPreferences: EngineReadyPreferences | null
): ScentDnaDisplay {
  const archetype = profile?.archetype;
  const q1Family = quizPreferences?.q1 ?? "";
  const family = familyFromEngine(q1Family);
  const vibe = quizPreferences?.q8 ?? "timeless";
  const feel = quizPreferences?.q3 ?? "balanced";
  const projection = quizPreferences?.userProjection;
  const avoidSweet = quizAnswers?.q7 === "turnoff_sweet";

  const families = getFamiliesFromArchetype(archetype) ?? [family];
  const accords = deriveAccords(family, vibe, avoidSweet);
  const sweetness = deriveSweetness(family, avoidSweet);
  const darkness = deriveDarkness(vibe, feel, family, projection);
  const texture = deriveTexture(vibe, feel, family, projection);

  return { families, accords, sweetness, darkness, texture };
}

