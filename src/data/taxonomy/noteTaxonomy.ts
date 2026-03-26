/**
 * Starter note taxonomy.
 *
 * This provides:
 * - note categories
 * - standardized note definitions
 *
 * It is intentionally a "starter universe": enough to validate plumbing and scale later.
 * No existing recommendation code is modified to use this yet.
 */

import type { NoteCategory, StandardizedNote, TaxonomyId } from "./types";

export const NOTE_CATEGORIES: Record<TaxonomyId, NoteCategory> = {
  note_cat_citrus: {
    id: "note_cat_citrus",
    label: "Citrus",
    description: "Bright, zesty citrus top notes and peel brightness.",
    synonyms: ["citrus notes", "citrus family"],
  },
  note_cat_fruit: {
    id: "note_cat_fruit",
    label: "Fruits",
    description: "Fruity fruit tones (berries, stone fruits, tropical).",
    synonyms: ["fruit notes", "fruity"],
  },
  note_cat_floral: {
    id: "note_cat_floral",
    label: "Florals",
    description: "Roses, jasmines, tuberose, airy/creamy floral impressions.",
    synonyms: ["floral notes", "flowers"],
  },
  note_cat_green_aromatic: {
    id: "note_cat_green_aromatic",
    label: "Green / Aromatic",
    description: "Herbal greens, fresh aromatics, leafy herbal accents.",
    synonyms: ["green", "aromatic green", "herbal aromatic"],
  },
  note_cat_herbs: {
    id: "note_cat_herbs",
    label: "Herbs",
    description: "Leafy herb notes (sage/thyme/rosemary/basil).",
    synonyms: ["herbal notes"],
  },
  note_cat_teas: {
    id: "note_cat_teas",
    label: "Teas",
    description: "Tea-leaf and tea-bloom impressions.",
    synonyms: ["tea notes", "tea accord"],
  },
  note_cat_spices: {
    id: "note_cat_spices",
    label: "Spices",
    description: "Peppery, ginger, cinnamon/clove and warm spice aromas.",
    synonyms: ["spice notes"],
  },
  note_cat_woods: {
    id: "note_cat_woods",
    label: "Woods",
    description: "Dry woods, creamy woods, and dark woody materials.",
    synonyms: ["woody notes"],
  },
  note_cat_resins_balsams: {
    id: "note_cat_resins_balsams",
    label: "Resins / Balsams",
    description: "Frankincense, myrrh, benzoin, labdanum and balsams.",
    synonyms: ["resin notes", "balsams"],
  },
  note_cat_amber_resinous: {
    id: "note_cat_amber_resinous",
    label: "Amber / Resinous",
    description: "Ambergris/amber/resin warmth impressions.",
    synonyms: ["amber notes", "resin warmth"],
  },
  note_cat_gourmand_sweet: {
    id: "note_cat_gourmand_sweet",
    label: "Gourmand / Sweet",
    description: "Vanilla, tonka, caramel, honey, cocoa, coffee sweetness.",
    synonyms: ["gourmand notes", "sweet notes", "dessert notes"],
  },
  note_cat_musks: {
    id: "note_cat_musks",
    label: "Musks",
    description: "Skin musks, clean musks, laundry musks and synthetic-style musks.",
    synonyms: ["musk notes"],
  },
  note_cat_animalic: {
    id: "note_cat_animalic",
    label: "Animalic / Earthy",
    description: "Civet/castoreum/ambergris-style animalic textures.",
    synonyms: ["animalic"],
  },
  note_cat_leather_suede: {
    id: "note_cat_leather_suede",
    label: "Leather / Suede",
    description: "Leather, suede, and smoldering leather tones.",
    synonyms: ["leather notes", "suede notes"],
  },
  note_cat_smoke_incense: {
    id: "note_cat_smoke_incense",
    label: "Smoke / Incense",
    description: "Smoked woods, incense resins, and oud-smoke atmosphere.",
    synonyms: ["smoke notes", "incense notes"],
  },
  note_cat_aquatic_marine: {
    id: "note_cat_aquatic_marine",
    label: "Aquatic / Marine",
    description: "Marine salinity, oceanic breeze, ozonic “sea air” cues.",
    synonyms: ["aquatic notes", "marine notes"],
  },
  note_cat_mineral_salty_metallic: {
    id: "note_cat_mineral_salty_metallic",
    label: "Mineral / Salty / Metallic",
    description: "Stone-water feel, salt spray, ozone-metal “chrome” impressions.",
    synonyms: ["mineral notes", "salty notes", "metallic notes"],
  },
  note_cat_powdery_iris: {
    id: "note_cat_powdery_iris",
    label: "Powdery / Iris",
    description: "Iris/orris powder softness and dry elegant powder cues.",
    synonyms: ["powder notes", "iris notes"],
  },
  note_cat_synthetic_aroma_chemicals: {
    id: "note_cat_synthetic_aroma_chemicals",
    label: "Synthetic Aroma Chemicals",
    description: "Aroma-chemical style musks, ambroxan/iso-e and clean frameworks.",
    synonyms: ["synthetic notes", "chemicals"],
  },
};

export const NOTES: Record<TaxonomyId, StandardizedNote> = {
  // Citrus
  note_bergamot: {
    id: "note_bergamot",
    label: "Bergamot",
    categoryIds: ["note_cat_citrus"],
    synonyms: ["bergamot oil", "eau de bergamot", "bergamot essential oil"],
  },
  note_lemon: { id: "note_lemon", label: "Lemon", categoryIds: ["note_cat_citrus"], synonyms: ["lemon peel", "citron"] },
  note_lime: { id: "note_lime", label: "Lime", categoryIds: ["note_cat_citrus"], synonyms: ["lime zest"] },
  note_orange: { id: "note_orange", label: "Orange", categoryIds: ["note_cat_citrus"], synonyms: ["sweet orange", "orange peel", "orange zest"] },
  note_mandarin: { id: "note_mandarin", label: "Mandarin", categoryIds: ["note_cat_citrus"], synonyms: ["mandarine"] },
  note_grapefruit: { id: "note_grapefruit", label: "Grapefruit", categoryIds: ["note_cat_citrus"], synonyms: ["grapefruit zest"] },
  note_cedrat: { id: "note_cedrat", label: "Cedrat / Cidrat", categoryIds: ["note_cat_citrus"], synonyms: ["cedrat", "cidrat"] },
  note_neroli: { id: "note_neroli", label: "Neroli", categoryIds: ["note_cat_citrus"], synonyms: ["neroli leaf", "orange blossom leaf"] },
  note_petitgrain: { id: "note_petitgrain", label: "Petitgrain", categoryIds: ["note_cat_citrus"], synonyms: ["petit grain"] },
  note_citrus_peel: { id: "note_citrus_peel", label: "Citrus Peel", categoryIds: ["note_cat_citrus"], synonyms: ["citrus zest", "zest", "peel"] },

  // Fruits
  note_pear: { id: "note_pear", label: "Pear", categoryIds: ["note_cat_fruit"], synonyms: ["pear fruit"] },
  note_peach: { id: "note_peach", label: "Peach", categoryIds: ["note_cat_fruit"], synonyms: ["peach flesh"] },
  note_plum: { id: "note_plum", label: "Plum", categoryIds: ["note_cat_fruit"], synonyms: ["plum fruit"] },
  note_cherry: { id: "note_cherry", label: "Cherry", categoryIds: ["note_cat_fruit"], synonyms: ["cherry fruit"] },
  note_cassis: { id: "note_cassis", label: "Blackcurrant (cassis)", categoryIds: ["note_cat_fruit"], synonyms: ["cassis", "blackcurrant"] },
  note_raspberry: { id: "note_raspberry", label: "Raspberry", categoryIds: ["note_cat_fruit"], synonyms: ["raspberries"] },
  note_strawberry: { id: "note_strawberry", label: "Strawberry", categoryIds: ["note_cat_fruit"], synonyms: ["strawberries"] },
  note_fig: { id: "note_fig", label: "Fig", categoryIds: ["note_cat_fruit"], synonyms: ["fig fruit", "fig leaf"] },
  note_pineapple: { id: "note_pineapple", label: "Pineapple", categoryIds: ["note_cat_fruit"], synonyms: ["pineapple juice"] },
  note_coconut: { id: "note_coconut", label: "Coconut", categoryIds: ["note_cat_fruit"], synonyms: ["coconut milk"] },

  // Florals
  note_rose: { id: "note_rose", label: "Rose", categoryIds: ["note_cat_floral"], synonyms: ["rose absolute", "rose petals"] },
  note_jasmine: { id: "note_jasmine", label: "Jasmine", categoryIds: ["note_cat_floral"], synonyms: ["jasmine tea accord", "jasmin"] },
  note_tuberose: { id: "note_tuberose", label: "Tuberose", categoryIds: ["note_cat_floral"], synonyms: ["tuberose absolute"] },
  note_orange_blossom: { id: "note_orange_blossom", label: "Orange Blossom", categoryIds: ["note_cat_floral"], synonyms: ["neroli blossom", "orange blossom petals"] },
  note_lily_of_the_valley: { id: "note_lily_of_the_valley", label: "Lily of the Valley", categoryIds: ["note_cat_floral"], synonyms: ["lily-of-the-valley", "muguet"] },
  note_iris: { id: "note_iris", label: "Iris", categoryIds: ["note_cat_powdery_iris"], synonyms: ["iris absolute", "iris butter"] },

  // Green / aromatic / herbs (subset)
  note_lavender: { id: "note_lavender", label: "Lavender", categoryIds: ["note_cat_green_aromatic", "note_cat_herbs"], synonyms: ["lavender herb"] },
  note_eucalyptus: { id: "note_eucalyptus", label: "Eucalyptus", categoryIds: ["note_cat_green_aromatic", "note_cat_herbs"], synonyms: ["eucalypetus"] },
  note_sage: { id: "note_sage", label: "Sage", categoryIds: ["note_cat_herbs", "note_cat_green_aromatic"], synonyms: ["salvia"] },
  note_rosemary: { id: "note_rosemary", label: "Rosemary", categoryIds: ["note_cat_herbs"], synonyms: ["rosemerry"] },
  note_mint: { id: "note_mint", label: "Mint", categoryIds: ["note_cat_herbs"], synonyms: ["spearmint", "mint leaf"] },
  note_oakmoss: { id: "note_oakmoss", label: "Oakmoss", categoryIds: ["note_cat_green_aromatic"], synonyms: ["oak moss"] },

  // Teas
  note_black_tea: { id: "note_black_tea", label: "Black Tea", categoryIds: ["note_cat_teas"], synonyms: ["black tea leaves", "tea"] },
  note_green_tea: { id: "note_green_tea", label: "Green Tea", categoryIds: ["note_cat_teas"], synonyms: ["green tea leaves"] },
  note_oolong_tea: { id: "note_oolong_tea", label: "Oolong Tea", categoryIds: ["note_cat_teas"], synonyms: ["oolong"] },

  // Spices
  note_black_pepper: { id: "note_black_pepper", label: "Black Pepper", categoryIds: ["note_cat_spices"], synonyms: ["pepper"] },
  note_ginger: { id: "note_ginger", label: "Ginger", categoryIds: ["note_cat_spices"], synonyms: ["ginger root"] },
  note_cinnamon: { id: "note_cinnamon", label: "Cinnamon", categoryIds: ["note_cat_spices"], synonyms: ["cinnammon"] },
  note_clove: { id: "note_clove", label: "Clove", categoryIds: ["note_cat_spices"], synonyms: ["clove spice"] },
  note_cardamom: { id: "note_cardamom", label: "Cardamom", categoryIds: ["note_cat_spices"], synonyms: ["cardamom seed"] },

  // Woods
  note_sandalwood: { id: "note_sandalwood", label: "Sandalwood", categoryIds: ["note_cat_woods"], synonyms: ["sandalwood oil"] },
  note_cedar: { id: "note_cedar", label: "Cedar", categoryIds: ["note_cat_woods"], synonyms: ["cedarwood"] },
  note_vetiver: { id: "note_vetiver", label: "Vetiver", categoryIds: ["note_cat_woods"], synonyms: ["vetiver grass"] },
  note_oud: { id: "note_oud", label: "Oud", categoryIds: ["note_cat_woods", "note_cat_smoke_incense"], synonyms: ["agarwood", "oudh"] },
  note_oak_wood: { id: "note_oak_wood", label: "Oak / Oak Wood", categoryIds: ["note_cat_woods"], synonyms: ["oak wood"] },

  // Resins / amber / gourmand
  note_vanilla: { id: "note_vanilla", label: "Vanilla", categoryIds: ["note_cat_gourmand_sweet", "note_cat_amber_resinous"], synonyms: ["vanilla bean"] },
  note_tonka: { id: "note_tonka", label: "Tonka", categoryIds: ["note_cat_gourmand_sweet"], synonyms: ["tonka bean"] },
  note_caramel: { id: "note_caramel", label: "Caramel", categoryIds: ["note_cat_gourmand_sweet"], synonyms: ["caramelized sugar"] },
  note_tobacco: { id: "note_tobacco", label: "Tobacco", categoryIds: ["note_cat_smoke_incense"], synonyms: ["tobacco leaf"] },
  note_honey: { id: "note_honey", label: "Honey", categoryIds: ["note_cat_gourmand_sweet"], synonyms: ["honeyed"] },
  note_coffee: { id: "note_coffee", label: "Coffee", categoryIds: ["note_cat_gourmand_sweet"], synonyms: ["coffee beans", "espresso"] },
  note_cocoa: { id: "note_cocoa", label: "Cocoa", categoryIds: ["note_cat_gourmand_sweet"], synonyms: ["cacao"] },
  note_amber: { id: "note_amber", label: "Amber", categoryIds: ["note_cat_amber_resinous"], synonyms: ["amber resin"] },
  note_benzoin: { id: "note_benzoin", label: "Benzoin", categoryIds: ["note_cat_resins_balsams", "note_cat_amber_resinous"], synonyms: ["benzoin resin"] },
  note_labdanum: { id: "note_labdanum", label: "Labdanum", categoryIds: ["note_cat_resins_balsams"], synonyms: ["labdanum resin"] },
  note_frankincense: { id: "note_frankincense", label: "Frankincense", categoryIds: ["note_cat_smoke_incense", "note_cat_resins_balsams"], synonyms: ["frankincense resin"] },

  // Musks / synthetics
  note_musk: { id: "note_musk", label: "Musk", categoryIds: ["note_cat_musks"], synonyms: ["musk scent"] },
  note_white_musk: { id: "note_white_musk", label: "White Musk", categoryIds: ["note_cat_musks"], synonyms: ["white musk"] },
  note_ambroxan: { id: "note_ambroxan", label: "Ambroxan", categoryIds: ["note_cat_synthetic_aroma_chemicals", "note_cat_musks"], synonyms: ["ambroxan molecule"] },
  note_iso_e_super: { id: "note_iso_e_super", label: "Iso E Super", categoryIds: ["note_cat_synthetic_aroma_chemicals"], synonyms: ["iso e", "iso-e super", "isoe super"] },
  note_cashmeran: { id: "note_cashmeran", label: "Cashmeran", categoryIds: ["note_cat_synthetic_aroma_chemicals"], synonyms: ["cashmeran molecule"] },

  // Leather / suede
  note_leather: { id: "note_leather", label: "Leather", categoryIds: ["note_cat_leather_suede"], synonyms: ["leather accord"] },
  note_suede: { id: "note_suede", label: "Suede", categoryIds: ["note_cat_leather_suede"], synonyms: ["suede leather"] },

  // Aquatic / mineral
  note_marine_salt: { id: "note_marine_salt", label: "Sea Salt", categoryIds: ["note_cat_aquatic_marine", "note_cat_mineral_salty_metallic"], synonyms: ["sea salt", "salt spray"] },
  note_oceanic: { id: "note_oceanic", label: "Oceanic", categoryIds: ["note_cat_aquatic_marine"], synonyms: ["oceanic breeze"] },
  note_calone: { id: "note_calone", label: "Calone (ozonic)", categoryIds: ["note_cat_aquatic_marine"], synonyms: ["calone", "ozonic calone"] },

  // Powdery
  note_orris: { id: "note_orris", label: "Orris", categoryIds: ["note_cat_powdery_iris"], synonyms: ["orris root"] },

  // Animalic
  note_civet: { id: "note_civet", label: "Civet", categoryIds: ["note_cat_animalic"], synonyms: ["civet"] },
  note_castoreum: { id: "note_castoreum", label: "Castoreum", categoryIds: ["note_cat_animalic"], synonyms: ["castoreum"] },
  note_ambergris: { id: "note_ambergris", label: "Ambergris (animalic)", categoryIds: ["note_cat_animalic", "note_cat_amber_resinous"], synonyms: ["ambergris"] },

  // Smoke / incense
  note_incense: { id: "note_incense", label: "Incense", categoryIds: ["note_cat_smoke_incense"], synonyms: ["incense smoke"] },
  note_smoke: { id: "note_smoke", label: "Smoke", categoryIds: ["note_cat_smoke_incense"], synonyms: ["smoked"] },
};

