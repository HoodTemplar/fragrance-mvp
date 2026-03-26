/**
 * Relationship mappings derived from the accord taxonomy.
 *
 * This provides quick lookup tables so enrichment/scoring code can:
 * - map standardized notes to accord activations
 * - map accords into primary families and hybrid families
 *
 * The current app does not use these tables yet.
 */

import { ACCORDS } from "./accordTaxonomy";
import type { TaxonomyId } from "./types";

export type NoteToAccordsMap = Record<TaxonomyId, Array<{ accordId: TaxonomyId; weight: number }>>;
export type AccordToFamiliesMap = Record<
  TaxonomyId,
  {
    primaryFamilies: Array<{ primaryFamilyId: TaxonomyId; weight: number }>;
    hybridFamilies: Array<{ hybridFamilyId: TaxonomyId; weight: number }>;
  }
>;

function mergeMaxWeight<T extends { weight: number }>(items: T[]): T[] {
  // Simple stable merge: group by JSON key of id fields.
  // In practice enrichment code can do smarter merging later.
  const byKey = new Map<string, T>();
  for (const item of items) {
    // eslint-disable-next-line no-useless-constructor
    const key = JSON.stringify(item);
    const existing = byKey.get(key);
    if (!existing) byKey.set(key, item);
    else if (item.weight > existing.weight) byKey.set(key, item);
  }
  return Array.from(byKey.values());
}

export const NOTE_TO_ACCORDS: NoteToAccordsMap = (() => {
  const out: NoteToAccordsMap = {};
  for (const accord of Object.values(ACCORDS)) {
    for (const nc of accord.noteContributors) {
      out[nc.noteId] = out[nc.noteId] ?? [];
      out[nc.noteId].push({ accordId: accord.id, weight: nc.weight });
    }
  }

  // Optional: keep weights deterministic and avoid duplicate entries.
  for (const noteId of Object.keys(out)) {
    const uniqueKeyed = new Map<string, { accordId: TaxonomyId; weight: number }>();
    for (const v of out[noteId]) {
      const key = v.accordId;
      const existing = uniqueKeyed.get(key);
      if (!existing || v.weight > existing.weight) uniqueKeyed.set(key, v);
    }
    out[noteId] = Array.from(uniqueKeyed.values());
  }

  return out;
})();

export const ACCORD_TO_FAMILIES: AccordToFamiliesMap = (() => {
  const out: AccordToFamiliesMap = {};
  for (const accord of Object.values(ACCORDS)) {
    out[accord.id] = {
      primaryFamilies: accord.familyMappings.primaryFamilyMappings,
      hybridFamilies: accord.familyMappings.hybridFamilyMappings,
    };
  }
  return out;
})();

