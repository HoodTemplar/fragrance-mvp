/**
 * Layer 3: accord sub-facets under macro {@link ACCORD_CATEGORIES}.
 * Parent ids reference rows in `accordTaxonomy` / `accordLayer3Expansion` categories.
 */

import type { AccordCategorySubtype, TaxonomyId } from "./types";

export const ACCORD_CATEGORY_SUBTYPES: Record<TaxonomyId, AccordCategorySubtype> = {
  accord_sub_woody_creamy: {
    id: "accord_sub_woody_creamy",
    parentCategoryId: "accord_cat_woody_creamy",
    label: "Creamy woody",
    description: "Milky, sandalwood-forward, cashmere-like wood depth.",
    synonyms: ["creamy wood", "milky wood"],
  },
  accord_sub_woody_dry: {
    id: "accord_sub_woody_dry",
    parentCategoryId: "accord_cat_woody_dry",
    label: "Dry woody",
    description: "Pencil-shavings, crisp cedar/vetiver structure without round sweetness.",
    synonyms: ["dry wood", "crisp wood"],
  },
  accord_sub_woody_smoky: {
    id: "accord_sub_woody_smoky",
    parentCategoryId: "accord_cat_woody_dark",
    label: "Smoky woody",
    description: "Birch tar, cade, campfire smoke fused with wood.",
    synonyms: ["smoky wood", "tar wood"],
  },
  accord_sub_gourmand_edible: {
    id: "accord_sub_gourmand_edible",
    parentCategoryId: "accord_cat_gourmand_sweet",
    label: "Edible gourmand",
    description: "Foody, dessert, coffee/chocolate/caramel realism.",
    synonyms: ["edible gourmand", "foody gourmand"],
  },
  accord_sub_sweet_resinous: {
    id: "accord_sub_sweet_resinous",
    parentCategoryId: "accord_cat_amber_resinous",
    label: "Resinous sweet",
    description: "Balsamic amber-labdanum sweetness, chewy resin glow (not sugary fluff).",
    synonyms: ["resinous sweet", "balsamic sweet"],
  },
  accord_sub_sweet_airy: {
    id: "accord_sub_sweet_airy",
    parentCategoryId: "accord_cat_sugary_sweet",
    label: "Airy sweet",
    description: "Light, ethereal sugar—cotton-candy lift, sheer musk-sugar haze.",
    synonyms: ["airy sweet", "ethereal sweet"],
  },
  accord_sub_aquatic_mineral: {
    id: "accord_sub_aquatic_mineral",
    parentCategoryId: "accord_cat_aquatic_mineral",
    label: "Mineral aquatic",
    description: "Cold stone, wet rock, flinty sea-shore mineral water.",
    synonyms: ["mineral aquatic", "stone water"],
  },
  accord_sub_aquatic_salty: {
    id: "accord_sub_aquatic_salty",
    parentCategoryId: "accord_cat_aquatic_salty",
    label: "Salty aquatic",
    description: "Sea spray, brine, salt crystals on skin.",
    synonyms: ["salty aquatic", "brine"],
  },
  accord_sub_aquatic_ozonic: {
    id: "accord_sub_aquatic_ozonic",
    parentCategoryId: "accord_cat_aquatic_ozonic",
    label: "Ozonic aquatic",
    description: "Calone-like clean sea air, bright synthetic freshness.",
    synonyms: ["ozonic aquatic", "sea air"],
  },
};
