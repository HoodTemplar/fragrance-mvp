/**
 * Derives a structured fragrance profile (numeric signals) from a catalog entry.
 * Used for trait-based matching and human explanations. Does not change catalog or DB.
 */

import type { CatalogFragrance } from "@/data/fragranceCatalog";
import { getFragranceTaxonomyFeatures } from "./taxonomyEnrichment";

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

  // --- Phase 1 taxonomy blend (safe wiring) ---
  // If we can match standardized accords into the taxonomy, we blend in those trait signals.
  // This does not replace heuristic scoring; it just improves trait estimation gradually.
  const taxonomy = getFragranceTaxonomyFeatures(f);
  if (taxonomy?.confidence && taxonomy.confidence > 0.25) {
    const blendW = Math.max(0.15, Math.min(0.35, taxonomy.confidence * 0.25));
    const t = taxonomy.traitScores;

    const txFresh = typeof t.trait_freshness === "number" ? t.trait_freshness * 100 : null;
    const txWarm = typeof t.trait_temperature_warmth === "number" ? t.trait_temperature_warmth * 100 : null;
    const txSweet = typeof t.trait_sweetness === "number" ? t.trait_sweetness * 100 : null;
    const txClean = typeof t.trait_cleanliness === "number" ? t.trait_cleanliness * 100 : null;
    const txSensual = typeof t.trait_sensuality === "number" ? t.trait_sensuality * 100 : null;

    if (txFresh != null) freshness = freshness * (1 - blendW) + txFresh * blendW;
    if (txWarm != null) warmth = warmth * (1 - blendW) + txWarm * blendW;
    if (txSweet != null) sweetness = sweetness * (1 - blendW) + txSweet * blendW;
    if (txClean != null) cleanliness = cleanliness * (1 - blendW) + txClean * blendW;
    if (txSensual != null) sensuality = sensuality * (1 - blendW) + txSensual * blendW;
  }

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
