/**
 * Bridges quiz / user accord keywords to Layer 3 taxonomy activations for scoring.
 * Keeps legacy string Jaccard as fallback when taxonomy features are missing.
 */

import type { TaxonomyId } from "@/data/taxonomy/types";
import type { FragranceTaxonomyFeatures } from "./taxonomyEnrichment";
import { matchAccordTextToTaxonomyId } from "./taxonomyEnrichment";

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Original engine behavior: set overlap on raw accord lines (0..1). */
export function legacyScentFamilyJaccard(userAccords: string[], fragAccordLines: string[]): number {
  const userAccordSet = new Set(userAccords.map((a) => norm(a)));
  const fragAccordSet = new Set(fragAccordLines.map((a) => norm(a)));
  let intersection = 0;
  userAccordSet.forEach((ua) => {
    if (Array.from(fragAccordSet).some((fa) => fa === ua || fa.includes(ua) || ua.includes(fa))) intersection += 1;
  });
  const union = Math.max(1, userAccordSet.size + fragAccordSet.size - intersection);
  return intersection / union;
}

/**
 * Weighted Jaccard similarity in taxonomy-id space between user keywords (mapped to accords)
 * and fragrance {@link FragranceTaxonomyFeatures.accordActivations} (normalized weights).
 * Optional subtype bonus when similarity is already positive — spreads scores for nuanced profiles.
 */
export function computeTaxonomyWeightedScentSimilarity(
  userAccords: string[],
  features: FragranceTaxonomyFeatures | null
): { similarity01: number; subtypeBonus01: number; ok: boolean } {
  if (!features?.accordActivations?.length) {
    return { similarity01: 0, subtypeBonus01: 0, ok: false };
  }

  const userMap = new Map<TaxonomyId, number>();
  for (const ua of userAccords) {
    const id = matchAccordTextToTaxonomyId(ua);
    if (id) userMap.set(id, (userMap.get(id) ?? 0) + 1);
  }

  const userSum = Array.from(userMap.values()).reduce((a, b) => a + b, 0);
  if (userSum === 0) {
    return { similarity01: 0, subtypeBonus01: 0, ok: false };
  }

  userMap.forEach((v, k) => userMap.set(k, v / userSum));

  const act = features.accordActivations;
  const wSum = act.reduce((s, x) => s + x.weight, 0) || 1;
  const fragMap = new Map<TaxonomyId, number>();
  for (const x of act) {
    fragMap.set(x.accordId, (fragMap.get(x.accordId) ?? 0) + x.weight / wSum);
  }

  const ids = new Set<TaxonomyId>([...Array.from(userMap.keys()), ...Array.from(fragMap.keys())]);
  let inter = 0;
  let uni = 0;
  for (const id of Array.from(ids)) {
    const u = userMap.get(id) ?? 0;
    const v = fragMap.get(id) ?? 0;
    inter += Math.min(u, v);
    uni += Math.max(u, v);
  }

  const similarity01 = uni > 0 ? inter / uni : 0;

  const nSub = features.subtypeIds?.length ?? 0;
  const subtypeBonus01 =
    similarity01 > 0.02 ? Math.min(0.08, nSub * 0.022) : 0;

  return { similarity01, subtypeBonus01, ok: true };
}
