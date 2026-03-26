/**
 * Accord taxonomy: categories + standardized accords.
 *
 * This is a starter set (enough to validate enrichment + scoring wiring),
 * but intentionally designed to be expanded without breaking code.
 */

import type {
  AccordCategory,
  AccordDefinition,
  AccordCategory as AccordCategoryType,
  TaxonomyId,
} from "./types";
import type { AccordDefinition as AccordDef } from "./types";
import type { PerceptualTraitId } from "./types";

// Note: Types are imported for clarity; this file only exports constants.

export const ACCORD_CATEGORIES: Record<TaxonomyId, AccordCategory> = {
  accord_cat_fresh_citrus_aromatic: { id: "accord_cat_fresh_citrus_aromatic", label: "Fresh / Citrus / Aromatic" },
  accord_cat_fresh_spicy: { id: "accord_cat_fresh_spicy", label: "Fresh Spicy" },
  accord_cat_warm_spicy: { id: "accord_cat_warm_spicy", label: "Warm Spicy" },
  accord_cat_aquatic_mineral: { id: "accord_cat_aquatic_mineral", label: "Aquatic / Mineral" },
  accord_cat_aquatic_salty: { id: "accord_cat_aquatic_salty", label: "Aquatic / Salty" },
  accord_cat_aquatic_ozonic: { id: "accord_cat_aquatic_ozonic", label: "Aquatic / Ozonic" },
  accord_cat_floral_airy: { id: "accord_cat_floral_airy", label: "Floral / Airy" },
  accord_cat_floral_creamy: { id: "accord_cat_floral_creamy", label: "Floral / Creamy" },
  accord_cat_woody_dry: { id: "accord_cat_woody_dry", label: "Woody / Dry" },
  accord_cat_woody_creamy: { id: "accord_cat_woody_creamy", label: "Woody / Creamy" },
  accord_cat_woody_dark: { id: "accord_cat_woody_dark", label: "Woody / Dark" },
  accord_cat_amber_resinous: { id: "accord_cat_amber_resinous", label: "Amber / Resinous" },
  accord_cat_gourmand_sweet: { id: "accord_cat_gourmand_sweet", label: "Gourmand / Sweet" },
  accord_cat_sugary_sweet: { id: "accord_cat_sugary_sweet", label: "Sugary Sweet" },
  accord_cat_musky_clean: { id: "accord_cat_musky_clean", label: "Musky / Clean" },
  accord_cat_musky_skin: { id: "accord_cat_musky_skin", label: "Musky / Skin" },
  accord_cat_musky_laundry: { id: "accord_cat_musky_laundry", label: "Musky / Laundry" },
  accord_cat_powdery_iris: { id: "accord_cat_powdery_iris", label: "Powdery / Iris" },
  accord_cat_leather_smoky: { id: "accord_cat_leather_smoky", label: "Leather / Smoky" },
  accord_cat_smoke_incense: { id: "accord_cat_smoke_incense", label: "Smoke / Incense" },
  accord_cat_oud_resin_smoke: { id: "accord_cat_oud_resin_smoke", label: "Oud / Resin / Smoke" },
};

/**
 * Starter standardized accord set.
 * Each accord includes:
 * - plain English definition
 * - canonical synonyms
 * - noteContributors (from standardized notes)
 * - traitDeltas (perceptual vector deltas)
 * - familyMappings (primary + hybrid families for assignment later)
 *
 * The family IDs referenced here must exist in `familyTaxonomy.ts`.
 */
export const ACCORDS: Record<TaxonomyId, AccordDefinition> = {
  // Fresh / Citrus / Aromatic
  accord_fresh_citrus_bright: {
    id: "accord_fresh_citrus_bright",
    categoryId: "accord_cat_fresh_citrus_aromatic",
    label: "Bright Citrus",
    synonyms: ["bright citrus", "citrus sparkle", "fresh citrus"],
    definition: "Crisp bright citrus sparkle—energetic zest and peel brightness.",
    noteContributors: [
      { noteId: "note_bergamot", weight: 0.25 },
      { noteId: "note_lemon", weight: 0.25 },
      { noteId: "note_orange", weight: 0.20 },
      { noteId: "note_neroli", weight: 0.15 },
      { noteId: "note_citrus_peel", weight: 0.15 },
    ],
    traitDeltas: {
      trait_freshness: 0.95,
      trait_temperature_coolness: 0.35,
      trait_cleanliness: 0.45,
      trait_mass_appeal: 0.45,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_fresh_citrus", weight: 0.95 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_fresh_citrus", weight: 0.90 }],
    },
  },

  accord_fresh_citrus_zesty: {
    id: "accord_fresh_citrus_zesty",
    categoryId: "accord_cat_fresh_citrus_aromatic",
    label: "Zesty Citrus",
    synonyms: ["citrus zest", "zesty peel", "citrus top notes"],
    definition: "Zest/peel-forward citrus brightness with a sharper top lift.",
    noteContributors: [
      { noteId: "note_cedrat", weight: 0.30 },
      { noteId: "note_citrus_peel", weight: 0.35 },
      { noteId: "note_neroli", weight: 0.15 },
      { noteId: "note_lemon", weight: 0.20 },
    ],
    traitDeltas: {
      trait_freshness: 0.90,
      trait_temperature_coolness: 0.45,
      trait_cleanliness: 0.35,
      trait_boldness: 0.25,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_fresh_citrus", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_fresh_citrus", weight: 0.80 }],
    },
  },

  accord_green_aromatic_fresh: {
    id: "accord_green_aromatic_fresh",
    categoryId: "accord_cat_fresh_citrus_aromatic",
    label: "Green Aromatic Fresh",
    synonyms: ["herbal green", "aromatic green", "green brightness"],
    definition: "Green herbal brightness—leafy aromatic lift with an aromatic-clean character.",
    noteContributors: [
      { noteId: "note_sage", weight: 0.25 },
      { noteId: "note_lavender", weight: 0.20 },
      { noteId: "note_eucalyptus", weight: 0.20 },
      { noteId: "note_oakmoss", weight: 0.20 },
      { noteId: "note_citrus_peel", weight: 0.15 },
    ],
    traitDeltas: {
      trait_freshness: 0.80,
      trait_cleanliness: 0.55,
      trait_temperature_coolness: 0.50,
      trait_complexity: 0.35,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_fresh_green_aromatic", weight: 0.95 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_fresh_green_aromatic", weight: 0.85 }],
    },
  },

  accord_aromatic_clean_aerated: {
    id: "accord_aromatic_clean_aerated",
    categoryId: "accord_cat_fresh_citrus_aromatic",
    label: "Aromatic Clean Air",
    synonyms: ["clean aromatic", "aerated aromatic", "fresh air aromatic"],
    definition: "Aromatic clean-air impression—barbershop-clean clarity with airy lift.",
    noteContributors: [
      { noteId: "note_lavender", weight: 0.25 },
      { noteId: "note_rosemary", weight: 0.20 },
      { noteId: "note_ambroxan", weight: 0.20 },
      { noteId: "note_white_musk", weight: 0.20 },
      { noteId: "note_citrus_peel", weight: 0.15 },
    ],
    traitDeltas: {
      trait_cleanliness: 0.92,
      trait_freshness: 0.45,
      trait_temperature_coolness: 0.65,
      trait_musky_clean: 0.80,
      trait_mass_appeal: 0.55,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_fresh_aromatic_clean", weight: 0.90 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_fresh_aromatic_clean_musky", weight: 0.80 }],
    },
  },

  accord_fresh_tea_leafy: {
    id: "accord_fresh_tea_leafy",
    categoryId: "accord_cat_fresh_citrus_aromatic",
    label: "Fresh Tea Leafy",
    synonyms: ["tea leafy", "aromatic tea", "tea clean"],
    definition: "Tea-leaf aromatic impression—dry-leaf calm with polished freshness.",
    noteContributors: [
      { noteId: "note_black_tea", weight: 0.35 },
      { noteId: "note_green_tea", weight: 0.25 },
      { noteId: "note_lavender", weight: 0.15 },
      { noteId: "note_ambroxan", weight: 0.10 },
      { noteId: "note_white_musk", weight: 0.15 },
    ],
    traitDeltas: {
      trait_cleanliness: 0.70,
      trait_freshness: 0.45,
      trait_temperature_coolness: 0.50,
      trait_complexity: 0.25,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_fresh_aromatic_clean", weight: 0.60 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_fresh_aromatic_clean_musky", weight: 0.55 }],
    },
  },

  // Fresh Spicy
  accord_fresh_spicy_pepper: {
    id: "accord_fresh_spicy_pepper",
    categoryId: "accord_cat_fresh_spicy",
    label: "Fresh Pepper Spice",
    synonyms: ["peppery fresh", "fresh spicy pepper"],
    definition: "Bright pepper bite with a cool crisp edge—spice that feels modern and lifted.",
    noteContributors: [
      { noteId: "note_black_pepper", weight: 0.45 },
      { noteId: "note_ginger", weight: 0.20 },
      { noteId: "note_lemon", weight: 0.15 },
      { noteId: "note_citrus_peel", weight: 0.20 },
    ],
    traitDeltas: {
      trait_freshness: 0.55,
      trait_temperature_coolness: 0.65,
      trait_boldness: 0.45,
      trait_darkness: 0.10,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_spicy_fresh_pepper", weight: 0.90 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_fresh_spicy", weight: 0.80 }],
    },
  },

  accord_fresh_spicy_ginger: {
    id: "accord_fresh_spicy_ginger",
    categoryId: "accord_cat_fresh_spicy",
    label: "Fresh Ginger Lift",
    synonyms: ["ginger lift", "fresh spicy ginger"],
    definition: "Ginger heat with lift and brightness—lively spice without heavy resin warmth.",
    noteContributors: [
      { noteId: "note_ginger", weight: 0.45 },
      { noteId: "note_citrus_peel", weight: 0.25 },
      { noteId: "note_sage", weight: 0.10 },
      { noteId: "note_black_pepper", weight: 0.20 },
    ],
    traitDeltas: {
      trait_freshness: 0.60,
      trait_temperature_coolness: 0.50,
      trait_boldness: 0.35,
      trait_darkness: 0.10,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_spicy_fresh_pepper", weight: 0.70 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_fresh_spicy", weight: 0.60 }],
    },
  },

  // Warm Spicy
  accord_warm_spicy_cinnamon_clove: {
    id: "accord_warm_spicy_cinnamon_clove",
    categoryId: "accord_cat_warm_spicy",
    label: "Warm Cinnamon Clove",
    synonyms: ["cinnamon clove warmth", "cozy spice"],
    definition: "Cozy spice warmth from cinnamon/clove—deepens amber-like comfort.",
    noteContributors: [
      { noteId: "note_cinnamon", weight: 0.35 },
      { noteId: "note_clove", weight: 0.25 },
      { noteId: "note_cardamom", weight: 0.15 },
      { noteId: "note_amber", weight: 0.25 },
    ],
    traitDeltas: {
      trait_temperature_warmth: 0.90,
      trait_sweetness: 0.30,
      trait_darkness: 0.35,
      trait_boldness: 0.30,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_spicy_warm_resinous", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_warm_spicy", weight: 0.75 }],
    },
  },

  accord_warm_spicy_amber_spice: {
    id: "accord_warm_spicy_amber_spice",
    categoryId: "accord_cat_warm_spicy",
    label: "Amber Spiced Warmth",
    synonyms: ["amber spice", "warm resin spice"],
    definition: "Amber resin carried warmth with spice—sweet-warm depth rather than airy pepper heat.",
    noteContributors: [
      { noteId: "note_amber", weight: 0.35 },
      { noteId: "note_benzoin", weight: 0.25 },
      { noteId: "note_cinnamon", weight: 0.15 },
      { noteId: "note_clove", weight: 0.15 },
      { noteId: "note_vanilla", weight: 0.10 },
    ],
    traitDeltas: {
      trait_temperature_warmth: 0.95,
      trait_sweetness: 0.40,
      trait_darkness: 0.45,
      trait_resinousness: 0.70,
    } as Partial<Record<PerceptualTraitId, number>>,
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_spicy_warm_resinous", weight: 0.75 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_warm_spicy", weight: 0.70 }],
    },
  },

  // Florals: airy
  accord_floral_airy_white_petals: {
    id: "accord_floral_airy_white_petals",
    categoryId: "accord_cat_floral_airy",
    label: "Airy White Petals",
    synonyms: ["airy white florals", "white petals airy"],
    definition: "Delicate white floral airiness—light petal glow and a floating feel.",
    noteContributors: [
      { noteId: "note_jasmine", weight: 0.25 },
      { noteId: "note_lily_of_the_valley", weight: 0.20 },
      { noteId: "note_rose", weight: 0.15 },
      { noteId: "note_orange_blossom", weight: 0.25 },
      { noteId: "note_white_musk", weight: 0.15 },
    ],
    traitDeltas: {
      trait_fresh_airiness: 0.90,
      trait_cleanliness: 0.50,
      trait_powderiness: 0.20,
      trait_sensuality: 0.25,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_floral_airy_white", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_floral_airy_musky_clean", weight: 0.70 }],
    },
  },

  accord_floral_airy_orange_blossom: {
    id: "accord_floral_airy_orange_blossom",
    categoryId: "accord_cat_floral_airy",
    label: "Airy Orange Blossom",
    synonyms: ["orange blossom airy", "neroli blossom airy"],
    definition: "Orange blossom glow—bright floral air with gentle softness.",
    noteContributors: [
      { noteId: "note_orange_blossom", weight: 0.40 },
      { noteId: "note_neroli", weight: 0.20 },
      { noteId: "note_jasmine", weight: 0.20 },
      { noteId: "note_white_musk", weight: 0.20 },
    ],
    traitDeltas: {
      trait_fresh_airiness: 0.85,
      trait_cleanliness: 0.45,
      trait_temperature_coolness: 0.25,
      trait_sensuality: 0.25,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_floral_airy_white", weight: 0.70 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_floral_airy_musky_clean", weight: 0.65 }],
    },
  },

  // Florals: creamy
  accord_floral_creamy_tuberose: {
    id: "accord_floral_creamy_tuberose",
    categoryId: "accord_cat_floral_creamy",
    label: "Creamy Tuberose",
    synonyms: ["creamy tuberose", "rich floral cream"],
    definition: "Creamy tuberose richness—floral feels intimate, thick, and warm-soft.",
    noteContributors: [
      { noteId: "note_tuberose", weight: 0.45 },
      { noteId: "note_vanilla", weight: 0.20 },
      { noteId: "note_jasmine", weight: 0.15 },
      { noteId: "note_amber", weight: 0.20 },
    ],
    traitDeltas: {
      trait_creaminess: 0.95,
      trait_temperature_warmth: 0.70,
      trait_sweetness: 0.40,
      trait_sensuality: 0.75,
      trait_boldness: 0.30,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_floral_creamy", weight: 0.88 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_floral_creamy_vanilla_amber", weight: 0.75 }],
    },
  },

  accord_floral_creamy_rose_vanilla: {
    id: "accord_floral_creamy_rose_vanilla",
    categoryId: "accord_cat_floral_creamy",
    label: "Creamy Rose + Vanilla",
    synonyms: ["rose vanilla creamy", "romantic floral cream"],
    definition: "Rose softness with vanilla warmth—romantic smooth creamy floral.",
    noteContributors: [
      { noteId: "note_rose", weight: 0.35 },
      { noteId: "note_vanilla", weight: 0.35 },
      { noteId: "note_amber", weight: 0.15 },
      { noteId: "note_white_musk", weight: 0.15 },
    ],
    traitDeltas: {
      trait_creaminess: 0.80,
      trait_temperature_warmth: 0.65,
      trait_sweetness: 0.45,
      trait_sensuality: 0.55,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_floral_creamy", weight: 0.70 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_floral_creamy_vanilla_amber", weight: 0.70 }],
    },
  },

  // Woody
  accord_wood_dry_cedar: {
    id: "accord_wood_dry_cedar",
    categoryId: "accord_cat_woody_dry",
    label: "Dry Cedar",
    synonyms: ["dry cedar", "cedar wood dry"],
    definition: "Dry cedar structure—cool crisp wood depth without creamy sweetness.",
    noteContributors: [
      { noteId: "note_cedar", weight: 0.50 },
      { noteId: "note_sandalwood", weight: 0.20 },
      { noteId: "note_oakmoss", weight: 0.30 },
    ],
    traitDeltas: {
      trait_cleanliness: 0.20,
      trait_darkness: 0.25,
      trait_temperature_coolness: 0.30,
      trait_powderiness: 0.05,
      trait_complexity: 0.35,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_woody_dry", weight: 0.90 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_woody_dry_cedar_vetiver", weight: 0.75 }],
    },
  },

  accord_wood_dry_vetiver: {
    id: "accord_wood_dry_vetiver",
    categoryId: "accord_cat_woody_dry",
    label: "Dry Vetiver",
    synonyms: ["vetiver dry", "dry woody vetiver"],
    definition: "Vetiver dryness—cool-green grounded woody structure.",
    noteContributors: [
      { noteId: "note_vetiver", weight: 0.65 },
      { noteId: "note_oakmoss", weight: 0.20 },
      { noteId: "note_cedar", weight: 0.15 },
    ],
    traitDeltas: {
      trait_darkness: 0.20,
      trait_temperature_coolness: 0.40,
      trait_complexity: 0.35,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_woody_dry", weight: 0.90 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_woody_dry_cedar_vetiver", weight: 0.80 }],
    },
  },

  accord_wood_dark_oud_leather: {
    id: "accord_wood_dark_oud_leather",
    categoryId: "accord_cat_woody_dark",
    label: "Dark Oud + Leather",
    synonyms: ["oud leather dark woods", "smoldering oud leather"],
    definition: "Dark oud/leather smolder—shadowy depth with leathery bite.",
    noteContributors: [
      { noteId: "note_oud", weight: 0.35 },
      { noteId: "note_leather", weight: 0.35 },
      { noteId: "note_frankincense", weight: 0.15 },
      { noteId: "note_vanilla", weight: 0.15 },
    ],
    traitDeltas: {
      trait_darkness: 0.95,
      trait_smokiness: 0.45,
      trait_leatheriness: 0.90,
      trait_resinousness: 0.55,
      trait_temperature_warmth: 0.50,
      trait_uniqueness: 0.70,
      trait_boldness: 0.65,
    } as Partial<Record<PerceptualTraitId, number>>,
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_woody_dark_oud", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_woody_dark_oud_leather", weight: 0.85 }],
    },
  },

  // Amber / Resinous
  accord_amber_resinous: {
    id: "accord_amber_resinous",
    categoryId: "accord_cat_amber_resinous",
    label: "Amber / Resinous",
    synonyms: ["amber resinous", "amber glow", "resin warmth"],
    definition: "Resinous amber warmth—balsamic depth with smooth glowing sweetness.",
    noteContributors: [
      { noteId: "note_amber", weight: 0.45 },
      { noteId: "note_benzoin", weight: 0.25 },
      { noteId: "note_labdanum", weight: 0.30 },
    ],
    traitDeltas: {
      trait_temperature_warmth: 0.90,
      trait_resinousness: 0.85,
      trait_sweetness: 0.35,
      trait_darkness: 0.45,
      trait_boldness: 0.20,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_amber_resinous", weight: 0.80 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_amber_resinous", weight: 0.70 }],
    },
  },

  // Gourmand / Sweet
  accord_gourmand_vanilla_cream: {
    id: "accord_gourmand_vanilla_cream",
    categoryId: "accord_cat_gourmand_sweet",
    label: "Vanilla Cream (Gourmand)",
    synonyms: ["vanilla cream", "vanilla gourmand", "dessert vanilla"],
    definition: "Vanilla cream gourmand—smooth dessert-like warmth with creamy roundness.",
    noteContributors: [
      { noteId: "note_vanilla", weight: 0.45 },
      { noteId: "note_tonka", weight: 0.25 },
      { noteId: "note_caramel", weight: 0.20 },
      { noteId: "note_honey", weight: 0.10 },
    ],
    traitDeltas: {
      trait_sweetness: 0.90,
      trait_creaminess: 0.65,
      trait_temperature_warmth: 0.80,
      trait_sensuality: 0.35,
      trait_mass_appeal: 0.70,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_gourmand_sweet", weight: 0.90 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_gourmand_vanilla_cream", weight: 0.85 }],
    },
  },

  // Musks
  accord_musky_clean_minimal: {
    id: "accord_musky_clean_minimal",
    categoryId: "accord_cat_musky_clean",
    label: "Clean Musk (Minimal)",
    synonyms: ["clean musk", "minimal musk", "washed clean"],
    definition: "Clean minimal musk—skin-close with a polished, airy cleanliness impression.",
    noteContributors: [
      { noteId: "note_white_musk", weight: 0.55 },
      { noteId: "note_iso_e_super", weight: 0.20 },
      { noteId: "note_ambroxan", weight: 0.15 },
      { noteId: "note_oakmoss", weight: 0.10 },
    ],
    traitDeltas: {
      trait_musky_clean: 0.95,
      trait_cleanliness: 0.85,
      trait_temperature_coolness: 0.35,
      trait_sweetness: 0.05,
      trait_mass_appeal: 0.65,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_musky_clean", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_clean_musk", weight: 0.75 }],
    },
  },

  accord_musky_skin_intimate: {
    id: "accord_musky_skin_intimate",
    categoryId: "accord_cat_musky_skin",
    label: "Skin Musk (Intimate)",
    synonyms: ["skin musk", "intimate musk", "ambrette-like closeness"],
    definition: "Skin musk intimacy—very close, warm softness with private sensual closeness.",
    noteContributors: [
      { noteId: "note_musk", weight: 0.35 },
      { noteId: "note_white_musk", weight: 0.20 },
      { noteId: "note_cashmeran", weight: 0.25 },
      { noteId: "note_vanilla", weight: 0.20 },
    ],
    traitDeltas: {
      trait_musky_skin: 0.95,
      trait_sensuality: 0.70,
      trait_temperature_warmth: 0.55,
      trait_sweetness: 0.10,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_musky_skin_intimate", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_musky_skin_clean", weight: 0.75 }],
    },
  },

  accord_musky_laundry_cotton: {
    id: "accord_musky_laundry_cotton",
    categoryId: "accord_cat_musky_laundry",
    label: "Laundry Musk (Cotton)",
    synonyms: ["laundry musk", "cotton clean"],
    definition: "Laundry musk—clean fabric impression and fresh cotton softness.",
    noteContributors: [
      { noteId: "note_white_musk", weight: 0.45 },
      { noteId: "note_iso_e_super", weight: 0.25 },
      { noteId: "note_citrus_peel", weight: 0.15 },
      { noteId: "note_lavender", weight: 0.15 },
    ],
    traitDeltas: {
      trait_musky_laundry: 0.95,
      trait_cleanliness: 0.90,
      trait_freshness: 0.35,
      trait_temperature_coolness: 0.35,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_musky_laundry", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_laundry_musk", weight: 0.75 }],
    },
  },

  // Aquatic
  accord_aquatic_mineral_stone: {
    id: "accord_aquatic_mineral_stone",
    categoryId: "accord_cat_aquatic_mineral",
    label: "Mineral Aquatic (Stone Water)",
    synonyms: ["mineral aquatic", "stone water", "fresh mineral sea"],
    definition: "Mineral aquatic—cold stone water feel with clean aquatic freshness.",
    noteContributors: [
      { noteId: "note_oceanic", weight: 0.35 },
      { noteId: "note_marine_salt", weight: 0.25 },
      { noteId: "note_calone", weight: 0.20 },
      { noteId: "note_amber", weight: 0.20 },
    ],
    traitDeltas: {
      trait_aquaticness: 0.70,
      trait_minerality: 0.85,
      trait_ozonicness: 0.20,
      trait_temperature_coolness: 0.60,
      trait_cleanliness: 0.35,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_aquatic_ozonic_mineral", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_aquatic_mineral", weight: 0.80 }],
    },
  },

  accord_aquatic_salty_sea_salt: {
    id: "accord_aquatic_salty_sea_salt",
    categoryId: "accord_cat_aquatic_salty",
    label: "Salty Aquatic (Sea Salt)",
    synonyms: ["sea salt aquatic", "salty ocean air", "briny freshness"],
    definition: "Salty aquatic—sea spray and salt-dry brightness.",
    noteContributors: [
      { noteId: "note_marine_salt", weight: 0.65 },
      { noteId: "note_oceanic", weight: 0.25 },
      { noteId: "note_calone", weight: 0.10 },
    ],
    traitDeltas: {
      trait_aquaticness: 0.85,
      trait_minerality: 0.55,
      trait_cleanliness: 0.30,
      trait_temperature_coolness: 0.55,
      trait_boldness: 0.20,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_fresh_aquatic_salty", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_salty_aquatic", weight: 0.80 }],
    },
  },

  accord_aquatic_ozonic_calone: {
    id: "accord_aquatic_ozonic_calone",
    categoryId: "accord_cat_aquatic_ozonic",
    label: "Ozonic Aquatic (Calone)",
    synonyms: ["ozonic aquatic", "calone-like", "clean sea air"],
    definition: "Ozonic aquatic—chemical fresh “clean sea air” with bright lift.",
    noteContributors: [
      { noteId: "note_calone", weight: 0.55 },
      { noteId: "note_oceanic", weight: 0.25 },
      { noteId: "note_marine_salt", weight: 0.20 },
    ],
    traitDeltas: {
      trait_ozonicness: 0.95,
      trait_aquaticness: 0.75,
      trait_minerality: 0.35,
      trait_temperature_coolness: 0.70,
      trait_cleanliness: 0.70,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_aquatic_ozonic_mineral", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_ozonic_aquatic", weight: 0.80 }],
    },
  },

  // Powdery / Iris
  accord_powdery_iris_soft: {
    id: "accord_powdery_iris_soft",
    categoryId: "accord_cat_powdery_iris",
    label: "Powdery Iris (Soft)",
    synonyms: ["iris powder", "powdery iris", "orris powder"],
    definition: "Iris powder softness—dry elegant elegance with elegant dry-luxury feel.",
    noteContributors: [
      { noteId: "note_iris", weight: 0.80 },
      { noteId: "note_white_musk", weight: 0.10 },
      { noteId: "note_oakmoss", weight: 0.10 },
    ],
    traitDeltas: {
      trait_powderiness: 0.95,
      trait_cleanliness: 0.30,
      trait_darkness: 0.15,
      trait_mass_appeal: 0.25,
      trait_complexity: 0.40,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_floral_powdery_iris", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_floral_powdery_iris", weight: 0.70 }],
    },
  },

  // Leather / Smoke / Incense / Oud
  accord_leather_smoky_aged: {
    id: "accord_leather_smoky_aged",
    categoryId: "accord_cat_leather_smoky",
    label: "Aged Leather + Smoke",
    synonyms: ["aged leather", "leather smoky", "smoldering leather"],
    definition: "Aged leather with smoky shadow—rugged, smoldering, atmospheric leather depth.",
    noteContributors: [
      { noteId: "note_leather", weight: 0.45 },
      { noteId: "note_smoke", weight: 0.30 },
      { noteId: "note_frankincense", weight: 0.25 },
    ],
    traitDeltas: {
      trait_leatheriness: 0.95,
      trait_smokiness: 0.70,
      trait_darkness: 0.85,
      trait_temperature_warmth: 0.35,
      trait_uniqueness: 0.55,
      trait_boldness: 0.55,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_leather_smoky", weight: 0.90 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_leather_smoky", weight: 0.85 }],
    },
  },

  accord_smoke_incense_frankincense: {
    id: "accord_smoke_incense_frankincense",
    categoryId: "accord_cat_smoke_incense",
    label: "Smoke / Incense (Frankincense)",
    synonyms: ["incense smoke", "frankincense haze", "incense resin smoke"],
    definition: "Incense smoke atmosphere—resinous smoke, airy-dark incense aura.",
    noteContributors: [
      { noteId: "note_frankincense", weight: 0.55 },
      { noteId: "note_incense", weight: 0.25 },
      { noteId: "note_smoke", weight: 0.20 },
    ],
    traitDeltas: {
      trait_smokiness: 0.85,
      trait_resinousness: 0.65,
      trait_darkness: 0.75,
      trait_uniqueness: 0.60,
      trait_boldness: 0.45,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_smoke_incense", weight: 0.85 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_oud_resin_smoke_dark", weight: 0.60 }],
    },
  },

  accord_oud_resin_smoke_dark: {
    id: "accord_oud_resin_smoke_dark",
    categoryId: "accord_cat_oud_resin_smoke",
    label: "Oud Resin Smoke (Dark)",
    synonyms: ["oud smoke resin", "dark oud atmosphere"],
    definition: "Oud + resin + smoke dark aura—collector-level dark smolder with persistence.",
    noteContributors: [
      { noteId: "note_oud", weight: 0.40 },
      { noteId: "note_frankincense", weight: 0.20 },
      { noteId: "note_smoke", weight: 0.20 },
      { noteId: "note_benzoin", weight: 0.20 },
    ],
    traitDeltas: {
      trait_darkness: 0.98,
      trait_smokiness: 0.90,
      trait_resinousness: 0.80,
      trait_uniqueness: 0.90,
      trait_boldness: 0.80,
    },
    familyMappings: {
      primaryFamilyMappings: [{ primaryFamilyId: "family_oud_smoke_resin", weight: 0.90 }],
      hybridFamilyMappings: [{ hybridFamilyId: "hybrid_family_oud_resin_smoke_dark", weight: 0.90 }],
    },
  },
};

