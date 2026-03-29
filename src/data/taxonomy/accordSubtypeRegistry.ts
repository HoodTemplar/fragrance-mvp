/**
 * Resolve Layer 3 subtype for an accord: explicit `subtypeId` on the definition,
 * else fallback for legacy core rows (no migration of giant accord objects).
 */

import type { AccordDefinition, TaxonomyId } from "./types";

/** Core accords that predate optional `subtypeId` — map id → subtype id. */
export const ACCORD_SUBTYPE_FALLBACK_BY_ACCORD_ID: Partial<Record<TaxonomyId, TaxonomyId>> = {
  accord_aquatic_mineral_stone: "accord_sub_aquatic_mineral",
  accord_aquatic_salty_sea_salt: "accord_sub_aquatic_salty",
  accord_aquatic_ozonic_calone: "accord_sub_aquatic_ozonic",
  accord_wood_dry_cedar: "accord_sub_woody_dry",
  accord_wood_dry_vetiver: "accord_sub_woody_dry",
  accord_amber_resinous: "accord_sub_sweet_resinous",
  accord_gourmand_vanilla_cream: "accord_sub_gourmand_edible",
};

export function getAccordSubtypeId(def: AccordDefinition): TaxonomyId | undefined {
  return def.subtypeId ?? ACCORD_SUBTYPE_FALLBACK_BY_ACCORD_ID[def.id];
}
