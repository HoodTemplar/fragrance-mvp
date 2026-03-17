/**
 * Derives a structured fragrance profile (numeric signals) from a catalog entry.
 * Used for trait-based matching and human explanations. Does not change catalog or DB.
 */

import type { CatalogFragrance } from "@/data/fragranceCatalog";

export interface FragranceProfileScores {
  freshness: number;
  warmth: number;
  sweetness: number;
  woodiness: number;
  spice: number;
  cleanliness: number;
  sensuality: number;
  versatility: number;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function accordMatches(accords: string[] | undefined, terms: string[]): number {
  if (!accords?.length) return 0;
  const a = accords.map((x) => norm(x));
  return terms.filter((t) => a.some((x) => x.includes(norm(t)))).length;
}

function categoryMatches(category: string, terms: string[]): boolean {
  const c = norm(category);
  return terms.some((t) => c.includes(norm(t)));
}

/**
 * Builds 0–100 scores for each dimension from a catalog fragrance.
 * Uses accords, category, vibe, and occasions so we don't require new DB fields.
 */
export function getFragranceProfile(f: CatalogFragrance): FragranceProfileScores {
  const accords = f.accords ?? [];
  const cat = norm(f.category ?? "");
  const vibe = norm(f.vibe ?? "");
  const occasions = f.occasions ?? [];

  const freshAccords = accordMatches(f.accords, ["citrus", "aquatic", "green", "marine", "fresh", "bergamot", "ozonic"]);
  const warmAccords = accordMatches(f.accords, ["vanilla", "amber", "tonka", "gourmand", "warm", "sweet", "balsamic"]);
  const woodyAccords = accordMatches(f.accords, ["woody", "cedar", "sandalwood", "vetiver", "oud", "wood"]);
  const spiceAccords = accordMatches(f.accords, ["spicy", "incense", "pepper", "oriental", "leather", "oud"]);

  let freshness = Math.min(100, 20 * freshAccords + (categoryMatches(f.category ?? "", ["fresh", "aquatic", "citrus", "green"]) ? 40 : 0));
  let warmth = Math.min(100, 20 * warmAccords + (categoryMatches(f.category ?? "", ["amber", "oriental", "gourmand", "vanilla"]) ? 35 : 0));
  let sweetness = Math.min(100, 25 * (accords.some((x) => /vanilla|gourmand|sweet|tonka|caramel|fruit/.test(norm(x))) ? 1 : 0) + (categoryMatches(f.category ?? "", ["gourmand", "sweet"]) ? 50 : 0));
  let woodiness = Math.min(100, 15 * woodyAccords + (categoryMatches(f.category ?? "", ["woody", "wood"]) ? 45 : 0));
  let spice = Math.min(100, 15 * spiceAccords + (categoryMatches(f.category ?? "", ["oriental", "spicy", "oud"]) ? 40 : 0));

  if (freshness === 0 && cat) {
    if (/fresh|aquatic|citrus|green/.test(cat)) freshness = 60;
  }
  if (warmth === 0 && (cat.includes("amber") || cat.includes("oriental") || cat.includes("gourmand"))) warmth = 55;
  if (woodiness === 0 && /wood|cedar|vetiver|sandal|oud/.test(cat)) woodiness = 50;
  if (spice === 0 && /spice|oud|incense|oriental|leather/.test(cat)) spice = 45;

  let cleanliness = 0;
  if (vibe && /clean|minimal|refined|fresh/.test(vibe)) cleanliness = 70;
  if (accordMatches(f.accords, ["musk", "clean", "white musk", "iris"])) cleanliness = Math.max(cleanliness, 60);
  if (freshness > 50) cleanliness = Math.max(cleanliness, 40);

  let sensuality = 0;
  if (vibe && /seductive|warm|sensual|intimate/.test(vibe)) sensuality = 70;
  if (warmth > 50 || sweetness > 40) sensuality = Math.max(sensuality, 50);

  const versatileOccasions = ["office", "casual", "date"].filter((o) => occasions.includes(o as "office" | "casual" | "date"));
  const versatility = Math.min(100, 25 * versatileOccasions.length + (occasions.length >= 3 ? 25 : 0));

  return {
    freshness: Math.round(Math.min(100, freshness)),
    warmth: Math.round(Math.min(100, warmth)),
    sweetness: Math.round(Math.min(100, sweetness)),
    woodiness: Math.round(Math.min(100, woodiness)),
    spice: Math.round(Math.min(100, spice)),
    cleanliness: Math.round(Math.min(100, cleanliness)),
    sensuality: Math.round(Math.min(100, sensuality)),
    versatility: Math.round(Math.min(100, versatility)),
  };
}
