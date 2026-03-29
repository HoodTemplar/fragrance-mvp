/**
 * Relationship mappings derived from the accord taxonomy.
 *
 * This provides quick lookup tables so enrichment/scoring code can:
 * - map standardized notes to accord activations
 * - map accords into primary families and hybrid families
 *
 * The current app does not use these tables yet.
 */

import type { TaxonomyId } from "./types";
import { ACCORDS } from "./accordTaxonomy";
import { buildNoteToAccordRuleMap } from "./noteToAccordRules";

export type NoteToAccordsMap = Record<TaxonomyId, Array<{ accordId: TaxonomyId; weight: number }>>;
export type AccordToFamiliesMap = Record<
  TaxonomyId,
  {
    primaryFamilies: Array<{ primaryFamilyId: TaxonomyId; weight: number }>;
    hybridFamilies: Array<{ hybridFamilyId: TaxonomyId; weight: number }>;
  }
>;

/** Note → accords: inverted `noteContributors` on all {@link ACCORDS} + {@link EXTRA_NOTE_TO_ACCORD_RULES}. */
export const NOTE_TO_ACCORDS: NoteToAccordsMap = buildNoteToAccordRuleMap();

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

