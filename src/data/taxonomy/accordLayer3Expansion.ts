/**
 * Layer 3: expanded nuanced accords (creamy vs dry vs smoky woody; edible vs resinous vs airy sweet;
 * mineral vs salty vs ozonic aquatic are tagged via subtypes — see `accordSubtypeRegistry.ts` for core rows).
 *
 * Merged into `ACCORDS` / `ACCORD_CATEGORIES` in `accordTaxonomy.ts` (additive only).
 */

import type { AccordCategory, AccordDefinition, PerceptualTraitId, TaxonomyId } from "./types";

/** Machine-readable version for exports / caches. */
export const ACCORD_ONTOLOGY_LAYER_VERSION = "layer3-accords-2026.03";

/** Additive macro categories (empty if all new accords fit existing parents). */
export const ACCORD_CATEGORIES_EXPANDED: Record<TaxonomyId, AccordCategory> = {};

export const ACCORDS_EXPANDED: Record<TaxonomyId, AccordDefinition> = {
  accord_layer3_woody_creamy_sandalwood: {
    id: "accord_layer3_woody_creamy_sandalwood",
    categoryId: "accord_cat_woody_creamy",
    subtypeId: "accord_sub_woody_creamy",
    label: "Creamy Woody (Sandalwood)",
    synonyms: ["creamy woody", "milky wood", "sandalwood cream", "cream wood"],
    definition:
      "Creamy woody depth—sandalwood smoothness with lactonic roundness and soft persistence.",
    noteContributors: [
      { noteId: "note_sandalwood", weight: 0.45 },
      { noteId: "note_cashmeran", weight: 0.20 },
      { noteId: "note_milk", weight: 0.15 },
      { noteId: "note_vanilla", weight: 0.12 },
      { noteId: "note_white_musk", weight: 0.08 },
    ],
    traitDeltas: {
      trait_creaminess: 0.88,
      trait_temperature_warmth: 0.55,
      trait_darkness: 0.20,
      trait_sensuality: 0.40,
      trait_mass_appeal: 0.45,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_woody_creamy", weight: 0.92 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_woody_dry_cedar_vetiver", weight: 0.35 }],
    },
  },

  accord_layer3_woody_dry_crisp: {
    id: "accord_layer3_woody_dry_crisp",
    categoryId: "accord_cat_woody_dry",
    subtypeId: "accord_sub_woody_dry",
    label: "Dry Woody (Crisp)",
    synonyms: ["dry woody", "dry wood", "pencil shavings wood", "crisp woody"],
    definition: "Dry woody signature—sharp cedar/oak structure, low lactones, cool linear wood.",
    noteContributors: [
      { noteId: "note_cedar", weight: 0.35 },
      { noteId: "note_oak_wood", weight: 0.25 },
      { noteId: "note_vetiver", weight: 0.25 },
      { noteId: "note_oakmoss", weight: 0.15 },
    ],
    traitDeltas: {
      trait_temperature_coolness: 0.45,
      trait_darkness: 0.25,
      trait_cleanliness: 0.25,
      trait_complexity: 0.35,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_woody_dry", weight: 0.90 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_woody_dry_cedar_vetiver", weight: 0.88 }],
    },
  },

  accord_layer3_woody_smoky_birch: {
    id: "accord_layer3_woody_smoky_birch",
    categoryId: "accord_cat_woody_dark",
    subtypeId: "accord_sub_woody_smoky",
    label: "Smoky Woody (Birch / Tar)",
    synonyms: ["smoky woody", "birch tar wood", "campfire wood", "smoldering wood"],
    definition: "Smoky woody atmosphere—birch tar, cade-like smoke married to dry wood backbone.",
    noteContributors: [
      { noteId: "note_birch", weight: 0.40 },
      { noteId: "note_smoke", weight: 0.30 },
      { noteId: "note_cedar", weight: 0.15 },
      { noteId: "note_vetiver", weight: 0.15 },
    ],
    traitDeltas: {
      trait_smokiness: 0.85,
      trait_darkness: 0.75,
      trait_leatheriness: 0.35,
      trait_boldness: 0.55,
      trait_uniqueness: 0.50,
    } as Partial<Record<PerceptualTraitId, number>>,
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_woody_dark_oud", weight: 0.70 }],
      hybridFamilyMappings: [
        { hybridFamilyId: "hybrid_family_leather_smoky", weight: 0.65 },
        { hybridFamilyId: "hybrid_family_woody_dark_oud_leather", weight: 0.50 },
      ],
    },
  },

  accord_layer3_gourmand_edible_foody: {
    id: "accord_layer3_gourmand_edible_foody",
    categoryId: "accord_cat_gourmand_sweet",
    subtypeId: "accord_sub_gourmand_edible",
    label: "Edible Gourmand",
    synonyms: ["edible gourmand", "foody accord", "dessert gourmand", "kitchen gourmand"],
    definition: "Literal edible sweetness—coffee, cocoa, caramel realism with appetite appeal.",
    noteContributors: [
      { noteId: "note_coffee", weight: 0.30 },
      { noteId: "note_cocoa", weight: 0.25 },
      { noteId: "note_caramel", weight: 0.25 },
      { noteId: "note_honey", weight: 0.12 },
      { noteId: "note_vanilla", weight: 0.08 },
    ],
    traitDeltas: {
      trait_sweetness: 0.92,
      trait_temperature_warmth: 0.75,
      trait_mass_appeal: 0.65,
      trait_creaminess: 0.40,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_gourmand_sweet", weight: 0.95 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_gourmand_vanilla_cream", weight: 0.70 }],
    },
  },

  accord_layer3_sweet_resinous_balsamic: {
    id: "accord_layer3_sweet_resinous_balsamic",
    categoryId: "accord_cat_amber_resinous",
    subtypeId: "accord_sub_sweet_resinous",
    label: "Resinous Sweet",
    synonyms: ["resinous sweet", "balsamic sweet", "chewy amber sweet"],
    definition: "Sweetness from resin—labdanum/benzoin chew, glowing balsamic depth (not candy).",
    noteContributors: [
      { noteId: "note_labdanum", weight: 0.35 },
      { noteId: "note_benzoin", weight: 0.30 },
      { noteId: "note_amber", weight: 0.25 },
      { noteId: "note_frankincense", weight: 0.10 },
    ],
    traitDeltas: {
      trait_resinousness: 0.90,
      trait_sweetness: 0.50,
      trait_temperature_warmth: 0.85,
      trait_darkness: 0.40,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_amber_resinous", weight: 0.92 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_amber_resinous", weight: 0.88 }],
    },
  },

  accord_layer3_sweet_airy_ethereal: {
    id: "accord_layer3_sweet_airy_ethereal",
    categoryId: "accord_cat_sugary_sweet",
    subtypeId: "accord_sub_sweet_airy",
    label: "Airy Sweet",
    synonyms: ["airy sweet", "ethereal sweet", "cotton candy haze", "sheer sugar"],
    definition: "Light airborne sweetness—sheer musk, soft vanilla sugar, minimal density.",
    noteContributors: [
      { noteId: "note_white_musk", weight: 0.35 },
      { noteId: "note_iso_e_super", weight: 0.25 },
      { noteId: "note_ambroxan", weight: 0.20 },
      { noteId: "note_honey", weight: 0.12 },
      { noteId: "note_vanilla", weight: 0.08 },
    ],
    traitDeltas: {
      trait_sweetness: 0.55,
      trait_fresh_airiness: 0.70,
      trait_cleanliness: 0.45,
      trait_mass_appeal: 0.60,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_gourmand_sweet", weight: 0.45 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_clean_musk", weight: 0.55 }],
    },
  },
};
