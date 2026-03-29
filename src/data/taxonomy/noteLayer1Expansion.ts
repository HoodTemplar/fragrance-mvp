/**
 * Layer 1 expansion: additional macro categories and standardized notes.
 * Merged into `NOTE_CATEGORIES` / `NOTES` in `noteTaxonomy.ts` (no key overlap with core).
 */

import type { NoteCategory, StandardizedNote, TaxonomyId } from "./types";

/** New macro categories (Fragrantica-inspired buckets, expanded for recommendations). */
export const NOTE_CATEGORIES_EXPANDED: Record<TaxonomyId, NoteCategory> = {
  note_cat_white_florals: {
    id: "note_cat_white_florals",
    label: "White florals",
    description: "Tuberose, gardenia, ylang-ylang, indolic and creamy white blooms.",
    synonyms: ["white flowers", "white floral"],
  },
  note_cat_vegetables_nuts: {
    id: "note_cat_vegetables_nuts",
    label: "Vegetables & nuts",
    description: "Tomato leaf, carrot, cucumber, almond, hazelnut.",
    synonyms: ["vegetable notes", "nutty notes"],
  },
  note_cat_beverages: {
    id: "note_cat_beverages",
    label: "Beverages",
    description: "Spirits, tea beyond basic tea notes, coffee adjacents, sparkling wine cues.",
    synonyms: ["drink notes", "booze accord"],
  },
  note_cat_fougere: {
    id: "note_cat_fougere",
    label: "Fougère materials",
    description: "Lavender–oakmoss–coumarin structure materials.",
    synonyms: ["fougere notes", "fern"],
  },
  note_cat_aldehydic: {
    id: "note_cat_aldehydic",
    label: "Aldehydes",
    description: "Sparkling aldehydic lift, fatty aldehydes, metallic effervescence.",
    synonyms: ["aldehydic", "aldehyde"],
  },
  note_cat_earth_soil: {
    id: "note_cat_earth_soil",
    label: "Earth / soil / petrichor",
    description: "Humus, wet soil, petrichor, rooty earth.",
    synonyms: ["earthy", "soil", "petrichor"],
  },
};

/**
 * Additional standardized notes (Layer 1). Keys must not collide with `NOTES` in noteTaxonomy core.
 */
export const NOTES_EXPANDED: Record<TaxonomyId, StandardizedNote> = {
  // Citrus (expansion)
  note_yuzu: {
    id: "note_yuzu",
    label: "Yuzu",
    categoryIds: ["note_cat_citrus"],
    subcategoryIds: ["note_subcat_citrus_bright_zest"],
    clusterIds: ["note_cluster_citrus_sparkle"],
    synonyms: ["yuzu citrus", "japanese yuzu"],
  },
  note_kumquat: {
    id: "note_kumquat",
    label: "Kumquat",
    categoryIds: ["note_cat_citrus"],
    subcategoryIds: ["note_subcat_citrus_juicy"],
    synonyms: ["kumquat fruit"],
  },
  note_pomelo: {
    id: "note_pomelo",
    label: "Pomelo",
    categoryIds: ["note_cat_citrus"],
    subcategoryIds: ["note_subcat_citrus_juicy"],
    synonyms: ["pomelo peel"],
  },
  note_bigarade: {
    id: "note_bigarade",
    label: "Bitter orange (bigarade)",
    categoryIds: ["note_cat_citrus"],
    subcategoryIds: ["note_subcat_citrus_bitter"],
    clusterIds: ["note_cluster_bitter_citrus"],
    synonyms: ["bigarade", "bitter orange", "seville orange"],
  },

  // White florals
  note_gardenia: {
    id: "note_gardenia",
    label: "Gardenia",
    categoryIds: ["note_cat_floral", "note_cat_white_florals"],
    subcategoryIds: ["note_subcat_white_floral_creamy"],
    clusterIds: ["note_cluster_white_floral_bouquet"],
    synonyms: ["gardenia flower"],
  },
  note_ylang_ylang: {
    id: "note_ylang_ylang",
    label: "Ylang-ylang",
    categoryIds: ["note_cat_floral", "note_cat_white_florals"],
    subcategoryIds: ["note_subcat_white_floral_creamy", "note_subcat_white_floral_indolic"],
    clusterIds: ["note_cluster_white_floral_bouquet"],
    synonyms: ["ylang ylang", "cananga"],
  },
  note_magnolia: {
    id: "note_magnolia",
    label: "Magnolia",
    categoryIds: ["note_cat_floral", "note_cat_white_florals"],
    subcategoryIds: ["note_subcat_white_floral_creamy"],
    synonyms: ["magnolia blossom"],
  },
  note_frangipani: {
    id: "note_frangipani",
    label: "Frangipani / plumeria",
    categoryIds: ["note_cat_floral", "note_cat_white_florals"],
    synonyms: ["plumeria", "frangipani flower"],
  },
  note_lilium: {
    id: "note_lilium",
    label: "Lily (lilium)",
    categoryIds: ["note_cat_floral", "note_cat_white_florals"],
    synonyms: ["white lily", "casablanca lily"],
  },

  // Florals (general expansion)
  note_violet: {
    id: "note_violet",
    label: "Violet",
    categoryIds: ["note_cat_floral"],
    synonyms: ["violet flower", "violet petals"],
  },
  note_violet_leaf: {
    id: "note_violet_leaf",
    label: "Violet leaf",
    categoryIds: ["note_cat_green_aromatic"],
    subcategoryIds: ["note_subcat_green_stemmy"],
    clusterIds: ["note_cluster_green_stemmy"],
    synonyms: ["violet leaves", "green violet"],
  },
  note_peony: {
    id: "note_peony",
    label: "Peony",
    categoryIds: ["note_cat_floral"],
    synonyms: ["peony blossom"],
  },
  note_osmanthus: {
    id: "note_osmanthus",
    label: "Osmanthus",
    categoryIds: ["note_cat_floral", "note_cat_fruit"],
    description: "Apricot-leather floral nuance.",
    synonyms: ["osmanthus flower"],
  },
  note_freesia: {
    id: "note_freesia",
    label: "Freesia",
    categoryIds: ["note_cat_floral"],
    synonyms: ["freesia flower"],
  },

  // Vegetables & nuts
  note_tomato_leaf: {
    id: "note_tomato_leaf",
    label: "Tomato leaf",
    categoryIds: ["note_cat_vegetables_nuts", "note_cat_green_aromatic"],
    clusterIds: ["note_cluster_green_stemmy"],
    synonyms: ["tomato vine", "tomato plant"],
  },
  note_carrot: {
    id: "note_carrot",
    label: "Carrot",
    categoryIds: ["note_cat_vegetables_nuts"],
    synonyms: ["carrot seed", "carrot root"],
  },
  note_almond: {
    id: "note_almond",
    label: "Almond",
    categoryIds: ["note_cat_vegetables_nuts", "note_cat_gourmand_sweet"],
    synonyms: ["almond milk", "bitter almond"],
  },
  note_hazelnut: {
    id: "note_hazelnut",
    label: "Hazelnut",
    categoryIds: ["note_cat_vegetables_nuts", "note_cat_gourmand_sweet"],
    synonyms: ["noisette", "filbert"],
  },

  // Beverages
  note_rum: {
    id: "note_rum",
    label: "Rum",
    categoryIds: ["note_cat_beverages"],
    synonyms: ["dark rum", "molasses rum"],
  },
  note_whiskey: {
    id: "note_whiskey",
    label: "Whiskey / whisky",
    categoryIds: ["note_cat_beverages"],
    synonyms: ["bourbon", "scotch accord"],
  },
  note_champagne: {
    id: "note_champagne",
    label: "Champagne / sparkling wine",
    categoryIds: ["note_cat_beverages", "note_cat_aldehydic"],
    synonyms: ["sparkling wine", "champagne accord"],
  },
  note_matcha: {
    id: "note_matcha",
    label: "Matcha",
    categoryIds: ["note_cat_beverages", "note_cat_teas"],
    synonyms: ["green tea powder", "matcha tea"],
  },
  note_sake: {
    id: "note_sake",
    label: "Sake",
    categoryIds: ["note_cat_beverages"],
    synonyms: ["rice wine", "nihonshu"],
  },

  // Fougère
  note_coumarin: {
    id: "note_coumarin",
    label: "Coumarin",
    categoryIds: ["note_cat_fougere", "note_cat_gourmand_sweet"],
    synonyms: ["tonka lactone", "hay sweet"],
  },
  note_geranium: {
    id: "note_geranium",
    label: "Geranium",
    categoryIds: ["note_cat_fougere", "note_cat_floral"],
    synonyms: ["geranium leaf", "rose geranium"],
  },

  // Aldehydes
  note_aldehyde_c11: {
    id: "note_aldehyde_c11",
    label: "Aldehyde C-11 (undecylenic)",
    categoryIds: ["note_cat_aldehydic"],
    synonyms: ["c11 aldehyde", "undecylenic aldehyde"],
  },
  note_aldehyde_stearic: {
    id: "note_aldehyde_stearic",
    label: "Fatty / stearic aldehydes",
    categoryIds: ["note_cat_aldehydic"],
    synonyms: ["fatty aldehydes", "aldehydic sparkle"],
  },

  // Earth
  note_patchouli: {
    id: "note_patchouli",
    label: "Patchouli",
    categoryIds: ["note_cat_earth_soil", "note_cat_green_aromatic"],
    subcategoryIds: ["note_subcat_earth_humus"],
    clusterIds: ["note_cluster_earth_patchouli"],
    synonyms: ["patchouli leaf", "patchouli oil"],
  },
  note_petrichor: {
    id: "note_petrichor",
    label: "Petrichor",
    categoryIds: ["note_cat_earth_soil", "note_cat_mineral_salty_metallic"],
    synonyms: ["wet pavement", "rain on stone"],
  },

  // Resins (expansion)
  note_myrrh: {
    id: "note_myrrh",
    label: "Myrrh",
    categoryIds: ["note_cat_resins_balsams", "note_cat_smoke_incense"],
    clusterIds: ["note_cluster_resinous_incense_base"],
    synonyms: ["myrrh resin", "commiphora"],
  },
  note_opoponax: {
    id: "note_opoponax",
    label: "Opoponax (sweet myrrh)",
    categoryIds: ["note_cat_resins_balsams"],
    synonyms: ["sweet myrrh", "opoponax resin"],
  },
  note_styrax: {
    id: "note_styrax",
    label: "Styrax / benzoin resinoid",
    categoryIds: ["note_cat_resins_balsams"],
    synonyms: ["lebanon styrax", "storax"],
  },

  // Spices (expansion)
  note_nutmeg: {
    id: "note_nutmeg",
    label: "Nutmeg",
    categoryIds: ["note_cat_spices"],
    subcategoryIds: ["note_subcat_spice_warm"],
    clusterIds: ["note_cluster_spice_warm_kitchen"],
    synonyms: ["nutmeg spice"],
  },
  note_saffron: {
    id: "note_saffron",
    label: "Saffron",
    categoryIds: ["note_cat_spices"],
    synonyms: ["saffron threads", "crocus"],
  },
  note_pink_pepper: {
    id: "note_pink_pepper",
    label: "Pink pepper",
    categoryIds: ["note_cat_spices"],
    subcategoryIds: ["note_subcat_spice_fresh"],
    synonyms: ["pink peppercorn", "baies rose"],
  },
  note_cumin: {
    id: "note_cumin",
    label: "Cumin",
    categoryIds: ["note_cat_spices"],
    synonyms: ["cumin seed"],
  },

  // Woods (expansion)
  note_birch: {
    id: "note_birch",
    label: "Birch / birch tar",
    categoryIds: ["note_cat_woods", "note_cat_smoke_incense"],
    subcategoryIds: ["note_subcat_wood_smoky"],
    clusterIds: ["note_cluster_dry_woody_forest", "note_cluster_smoke_leather_tobacco"],
    synonyms: ["birch tar", "birch wood"],
  },
  note_guaiac_wood: {
    id: "note_guaiac_wood",
    label: "Guaiac wood",
    categoryIds: ["note_cat_woods"],
    subcategoryIds: ["note_subcat_wood_dry"],
    synonyms: ["guaiac", "guaiacwood"],
  },
  note_pine: {
    id: "note_pine",
    label: "Pine / fir",
    categoryIds: ["note_cat_woods", "note_cat_green_aromatic"],
    synonyms: ["pine needle", "fir balsam"],
  },

  // Gourmand (expansion)
  note_milk: {
    id: "note_milk",
    label: "Milk / lactonic",
    categoryIds: ["note_cat_gourmand_sweet"],
    subcategoryIds: ["note_subcat_gourmand_lactonic"],
    clusterIds: ["note_cluster_lactonic_gourmand"],
    synonyms: ["lactonic", "cream milk"],
  },
  note_rice: {
    id: "note_rice",
    label: "Rice",
    categoryIds: ["note_cat_gourmand_sweet"],
    subcategoryIds: ["note_subcat_gourmand_lactonic"],
    clusterIds: ["note_cluster_lactonic_gourmand"],
    synonyms: ["rice steam", "rice powder"],
  },

  // Aquatic (expansion)
  note_seaweed: {
    id: "note_seaweed",
    label: "Seaweed / algae",
    categoryIds: ["note_cat_aquatic_marine"],
    subcategoryIds: ["note_subcat_aquatic_saline"],
    clusterIds: ["note_cluster_aquatic_saline_mineral"],
    synonyms: ["kelp", "marine algae", "seaweed"],
  },

  // Green
  note_galbanum: {
    id: "note_galbanum",
    label: "Galbanum",
    categoryIds: ["note_cat_green_aromatic"],
    subcategoryIds: ["note_subcat_green_stemmy"],
    clusterIds: ["note_cluster_green_stemmy"],
    synonyms: ["galbanum resin", "green galbanum"],
  },
};
