/**
 * Note subcategories (Layer 1): finer slices under macro {@link NOTE_CATEGORIES}.
 * Parent ids reference keys in `noteTaxonomy` merged categories.
 */

import type { NoteSubcategory, TaxonomyId } from "./types";

export const NOTE_SUBCATEGORIES: Record<TaxonomyId, NoteSubcategory> = {
  // Citrus
  note_subcat_citrus_bright_zest: {
    id: "note_subcat_citrus_bright_zest",
    label: "Bright zest / peel",
    parentCategoryId: "note_cat_citrus",
    description: "High-lift peel and sparkling citrus tops.",
    synonyms: ["zesty citrus", "peel forward"],
  },
  note_subcat_citrus_bitter: {
    id: "note_subcat_citrus_bitter",
    label: "Bitter / aromatic citrus",
    parentCategoryId: "note_cat_citrus",
    description: "Bigarade, bitter orange, chinotto-style bitterness.",
    synonyms: ["bitter orange", "bigarade"],
  },
  note_subcat_citrus_juicy: {
    id: "note_subcat_citrus_juicy",
    label: "Juicy / pulp citrus",
    parentCategoryId: "note_cat_citrus",
    description: "Pulp-forward, sweet-juicy citrus impressions.",
    synonyms: ["juicy citrus"],
  },

  // Fruits
  note_subcat_fruit_stone: {
    id: "note_subcat_fruit_stone",
    label: "Stone fruits",
    parentCategoryId: "note_cat_fruit",
    description: "Peach, plum, apricot.",
  },
  note_subcat_fruit_berry: {
    id: "note_subcat_fruit_berry",
    label: "Berries",
    parentCategoryId: "note_cat_fruit",
    description: "Berry compote and tart berry accents.",
  },

  // Florals
  note_subcat_floral_rose_family: {
    id: "note_subcat_floral_rose_family",
    label: "Rose family",
    parentCategoryId: "note_cat_floral",
    description: "Rose damascena, tea rose, rose oxide.",
  },
  note_subcat_floral_jasmine_family: {
    id: "note_subcat_floral_jasmine_family",
    label: "Jasmine family",
    parentCategoryId: "note_cat_floral",
    description: "Jasmine sambac, grandiflorum, indolic jasmine.",
  },

  note_subcat_green_stemmy: {
    id: "note_subcat_green_stemmy",
    label: "Green stem / leaf",
    parentCategoryId: "note_cat_green_aromatic",
    description: "Crushed stems, leafy greens, galbanum-adjacent.",
    synonyms: ["stemmy green", "green leaf"],
  },

  // White florals (macro category)
  note_subcat_white_floral_indolic: {
    id: "note_subcat_white_floral_indolic",
    label: "Indolic white florals",
    parentCategoryId: "note_cat_white_florals",
    description: "Heavy, heady white florals with indolic depth.",
  },
  note_subcat_white_floral_creamy: {
    id: "note_subcat_white_floral_creamy",
    label: "Creamy white florals",
    parentCategoryId: "note_cat_white_florals",
    description: "Tuberose, gardenia, creamy ylang.",
  },

  // Woods
  note_subcat_wood_dry: {
    id: "note_subcat_wood_dry",
    label: "Dry woods",
    parentCategoryId: "note_cat_woods",
    description: "Cedar, dry vetiver, pencil-shavings wood.",
  },
  note_subcat_wood_creamy: {
    id: "note_subcat_wood_creamy",
    label: "Creamy woods",
    parentCategoryId: "note_cat_woods",
    description: "Sandalwood, soft creamy wood bases.",
  },
  note_subcat_wood_smoky: {
    id: "note_subcat_wood_smoky",
    label: "Smoky woods",
    parentCategoryId: "note_cat_woods",
    description: "Birch tar, cade, smoked wood.",
  },

  // Spices
  note_subcat_spice_warm: {
    id: "note_subcat_spice_warm",
    label: "Warm baking spices",
    parentCategoryId: "note_cat_spices",
    description: "Cinnamon, clove, nutmeg.",
  },
  note_subcat_spice_fresh: {
    id: "note_subcat_spice_fresh",
    label: "Fresh / peppery spices",
    parentCategoryId: "note_cat_spices",
    description: "Black/pink pepper, cardamom, coriander seed.",
  },

  // Gourmand
  note_subcat_gourmand_lactonic: {
    id: "note_subcat_gourmand_lactonic",
    label: "Lactonic / milky",
    parentCategoryId: "note_cat_gourmand_sweet",
    description: "Milk, rice, lactonic cream.",
  },
  note_subcat_gourmand_roasted: {
    id: "note_subcat_gourmand_roasted",
    label: "Roasted / toasted",
    parentCategoryId: "note_cat_gourmand_sweet",
    description: "Coffee, cocoa, toasted nuts.",
  },

  // Aquatic / mineral
  note_subcat_aquatic_saline: {
    id: "note_subcat_aquatic_saline",
    label: "Saline / sea breeze",
    parentCategoryId: "note_cat_aquatic_marine",
    description: "Salt spray, brine, marine air.",
  },
  note_subcat_mineral_flint: {
    id: "note_subcat_mineral_flint",
    label: "Flint / mineral",
    parentCategoryId: "note_cat_mineral_salty_metallic",
    description: "Wet stone, flint, mineralic dryness.",
  },

  // Musks
  note_subcat_musk_clean: {
    id: "note_subcat_musk_clean",
    label: "Clean / laundry musk",
    parentCategoryId: "note_cat_musks",
    description: "Detergent-clean, cotton musk.",
  },
  note_subcat_musk_skin: {
    id: "note_subcat_musk_skin",
    label: "Skin / intimate musk",
    parentCategoryId: "note_cat_musks",
    description: "Skin-like, warm musk.",
  },

  // Earth
  note_subcat_earth_humus: {
    id: "note_subcat_earth_humus",
    label: "Humus / soil",
    parentCategoryId: "note_cat_earth_soil",
    description: "Wet earth, humus, rootiness.",
  },
};
