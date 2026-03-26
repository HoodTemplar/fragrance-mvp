/**
 * Family taxonomy: family groups, primary families, and hybrid families.
 *
 * This is a starter family set aligned with the accord taxonomy above.
 * It enables later enrichment and scoring without forcing the current app to change now.
 */

import type { FamilyGroup, HybridFamily, PrimaryFamily, TaxonomyId } from "./types";

export const FAMILY_GROUPS: Record<TaxonomyId, FamilyGroup> = {
  family_group_fresh_bright: {
    id: "family_group_fresh_bright",
    label: "Fresh / Bright",
    description: "Citrus, aromatic-clean, green-bright, and airy freshness signals.",
    synonyms: ["fresh", "bright"],
  },
  family_group_floral: {
    id: "family_group_floral",
    label: "Floral",
    description: "White florals, rose/jasmine structures, creamy florals, and powdery iris elegance.",
    synonyms: ["florals"],
  },
  family_group_woody: {
    id: "family_group_woody",
    label: "Woody",
    description: "Dry woods, creamy woods, and dark oud/dark woody depth.",
    synonyms: ["woods"],
  },
  family_group_spicy: {
    id: "family_group_spicy",
    label: "Spicy",
    description: "Fresh spicy pepper/ginger and warm spicy cinnamon/amber spice.",
    synonyms: ["spices"],
  },
  family_group_aquatic: {
    id: "family_group_aquatic",
    label: "Aquatic",
    description: "Marine/fresh-air water, mineral/stone, salty briny, and ozonic sea air.",
    synonyms: ["aquatic"],
  },
  family_group_amber_resinous: {
    id: "family_group_amber_resinous",
    label: "Amber / Resinous",
    description: "Amber and resin warmth: benzoin, labdanum, balsamic glow.",
    synonyms: ["amber", "resin"],
  },
  family_group_gourmand_sweet: {
    id: "family_group_gourmand_sweet",
    label: "Gourmand / Sweet",
    description: "Vanilla cream, honeyed sweetness, tonka/caramel dessert materials.",
    synonyms: ["gourmand", "sweet"],
  },
  family_group_musky_skin_clean: {
    id: "family_group_musky_skin_clean",
    label: "Musky / Skin / Clean",
    description: "Clean musks, intimate skin musks, and laundry cotton musks.",
    synonyms: ["musks", "skin close", "clean musk"],
  },
  family_group_powdery_floral: {
    id: "family_group_powdery_floral",
    label: "Powdery / Iris Floral",
    description: "Iris/powder elegance sitting between floral and dry sophistication.",
    synonyms: ["powdery", "iris"],
  },
  family_group_leather_smoke_oud: {
    id: "family_group_leather_smoke_oud",
    label: "Leather / Smoke / Oud",
    description: "Leather smolder, incense smoke, and oud resin dark aura.",
    synonyms: ["leather", "smoke", "oud"],
  },
};

export const PRIMARY_FAMILIES: Record<TaxonomyId, PrimaryFamily> = {
  // Fresh & Bright
  family_fresh_citrus: {
    id: "family_fresh_citrus",
    label: "Fresh Citrus",
    groupId: "family_group_fresh_bright",
    synonyms: ["citrus bright"],
    editorialIntent: "Best aligned with bright peel/zest energy.",
  },
  family_fresh_green_aromatic: {
    id: "family_fresh_green_aromatic",
    label: "Green Aromatic Fresh",
    groupId: "family_group_fresh_bright",
    synonyms: ["herbal green brightness"],
  },
  family_fresh_aromatic_clean: {
    id: "family_fresh_aromatic_clean",
    label: "Aromatic Clean Air",
    groupId: "family_group_fresh_bright",
    synonyms: ["clean aromatic", "clean air"],
  },

  // Aquatic
  family_fresh_aquatic_salty: {
    id: "family_fresh_aquatic_salty",
    label: "Salty Aquatic",
    groupId: "family_group_aquatic",
    synonyms: ["briny fresh"],
  },
  family_aquatic_ozonic_mineral: {
    id: "family_aquatic_ozonic_mineral",
    label: "Ozonic / Mineral Aquatic",
    groupId: "family_group_aquatic",
    synonyms: ["calone sea air", "mineral aquatic"],
  },

  // Floral / powder / creamy
  family_floral_airy_white: {
    id: "family_floral_airy_white",
    label: "Airy White Floral",
    groupId: "family_group_floral",
    synonyms: ["white petals airy"],
  },
  family_floral_creamy: {
    id: "family_floral_creamy",
    label: "Creamy Floral",
    groupId: "family_group_floral",
    synonyms: ["creamy tuberose/rose"],
  },
  family_floral_powdery_iris: {
    id: "family_floral_powdery_iris",
    label: "Powdery Iris Floral",
    groupId: "family_group_powdery_floral",
    synonyms: ["powdery iris"],
  },

  // Woody
  family_woody_dry: {
    id: "family_woody_dry",
    label: "Dry Woody",
    groupId: "family_group_woody",
    synonyms: ["dry woods"],
  },
  family_woody_creamy: {
    id: "family_woody_creamy",
    label: "Creamy Woody",
    groupId: "family_group_woody",
    synonyms: ["creamy woods"],
  },
  family_woody_dark_oud: {
    id: "family_woody_dark_oud",
    label: "Dark Oud Woody",
    groupId: "family_group_woody",
    synonyms: ["dark oud"],
  },

  // Spicy
  family_spicy_fresh_pepper: {
    id: "family_spicy_fresh_pepper",
    label: "Fresh Spicy Pepper",
    groupId: "family_group_spicy",
    synonyms: ["peppery fresh spicy"],
  },
  family_spicy_warm_resinous: {
    id: "family_spicy_warm_resinous",
    label: "Warm Spicy Resinous",
    groupId: "family_group_spicy",
    synonyms: ["cinnamon clove warmth"],
  },

  // Amber / resins / gourmand
  family_amber_resinous: {
    id: "family_amber_resinous",
    label: "Amber / Resinous",
    groupId: "family_group_amber_resinous",
    synonyms: ["amber resin"],
  },
  family_gourmand_sweet: {
    id: "family_gourmand_sweet",
    label: "Gourmand Sweet (Vanilla Cream)",
    groupId: "family_group_gourmand_sweet",
    synonyms: ["vanilla cream gourmand"],
  },

  // Musks
  family_musky_clean: {
    id: "family_musky_clean",
    label: "Clean Musk",
    groupId: "family_group_musky_skin_clean",
    synonyms: ["clean minimal musk"],
  },
  family_musky_skin_intimate: {
    id: "family_musky_skin_intimate",
    label: "Skin Musk (Intimate)",
    groupId: "family_group_musky_skin_clean",
    synonyms: ["skin close musk"],
  },
  family_musky_laundry: {
    id: "family_musky_laundry",
    label: "Laundry Musk (Cotton)",
    groupId: "family_group_musky_skin_clean",
    synonyms: ["laundry cotton musk"],
  },

  // Leather / smoke
  family_leather_smoky: {
    id: "family_leather_smoky",
    label: "Leather Smoked",
    groupId: "family_group_leather_smoke_oud",
    synonyms: ["leather smoky"],
  },
  family_smoke_incense: {
    id: "family_smoke_incense",
    label: "Smoke / Incense",
    groupId: "family_group_leather_smoke_oud",
    synonyms: ["incense smoke"],
  },
  family_oud_smoke_resin: {
    id: "family_oud_smoke_resin",
    label: "Oud / Resin Smoke",
    groupId: "family_group_leather_smoke_oud",
    synonyms: ["oud resin smoke"],
  },
};

export const HYBRID_FAMILIES: Record<TaxonomyId, HybridFamily> = {
  hybrid_family_fresh_citrus: {
    id: "hybrid_family_fresh_citrus",
    label: "Fresh Citrus",
    primaryFamilyIds: ["family_fresh_citrus", "family_fresh_aromatic_clean"],
    synonyms: ["citrus bright"],
    definition: "Bright citrus energy blended with clean aromatic lift (airy, lift, sparkle).",
  },

  hybrid_family_fresh_green_aromatic: {
    id: "hybrid_family_fresh_green_aromatic",
    label: "Green Aromatic Fresh",
    primaryFamilyIds: ["family_fresh_green_aromatic", "family_fresh_aromatic_clean"],
    definition: "Leafy green freshness with an aromatic clean-air edge.",
  },

  hybrid_family_fresh_aromatic_clean_musky: {
    id: "hybrid_family_fresh_aromatic_clean_musky",
    label: "Clean Aromatic + Musks",
    primaryFamilyIds: ["family_fresh_aromatic_clean", "family_musky_clean"],
    definition: "Clean-air aromatics fused with a polished clean-musky skin feel.",
  },

  hybrid_family_fresh_spicy: {
    id: "hybrid_family_fresh_spicy",
    label: "Fresh Spicy",
    primaryFamilyIds: ["family_spicy_fresh_pepper", "family_fresh_citrus"],
    definition: "Fresh pepper/ginger spice lifted by bright citrus clarity.",
  },

  hybrid_family_warm_spicy: {
    id: "hybrid_family_warm_spicy",
    label: "Warm Spicy",
    primaryFamilyIds: ["family_spicy_warm_resinous", "family_amber_resinous"],
    definition: "Warm spice carried by amber/resin glow—cozy, deep, and memorable.",
  },

  hybrid_family_floral_airy_musky_clean: {
    id: "hybrid_family_floral_airy_musky_clean",
    label: "Airy Floral + Clean Musks",
    primaryFamilyIds: ["family_floral_airy_white", "family_musky_clean"],
    definition: "White airy florals blended with clean musks for an effortless modern signature.",
  },

  hybrid_family_floral_creamy_vanilla_amber: {
    id: "hybrid_family_floral_creamy_vanilla_amber",
    label: "Creamy Floral + Vanilla Amber",
    primaryFamilyIds: ["family_floral_creamy", "family_gourmand_sweet", "family_amber_resinous"],
    definition: "Creamy floral lushness fused with vanilla/amber warmth.",
  },

  hybrid_family_woody_dry_cedar_vetiver: {
    id: "hybrid_family_woody_dry_cedar_vetiver",
    label: "Dry Cedar + Vetiver",
    primaryFamilyIds: ["family_woody_dry"],
    definition: "Dry woody structure with cedar/vetiver crispness.",
  },

  hybrid_family_woody_dark_oud_leather: {
    id: "hybrid_family_woody_dark_oud_leather",
    label: "Dark Oud + Leather",
    primaryFamilyIds: ["family_woody_dark_oud", "family_leather_smoky"],
    definition: "Dark oud smolder fused with leathery bite.",
  },

  hybrid_family_gourmand_vanilla_cream: {
    id: "hybrid_family_gourmand_vanilla_cream",
    label: "Gourmand Vanilla Cream",
    primaryFamilyIds: ["family_gourmand_sweet"],
    definition: "Vanilla cream gourmand with dessert-smooth warmth.",
  },

  hybrid_family_clean_musk: {
    id: "hybrid_family_clean_musk",
    label: "Clean Musk",
    primaryFamilyIds: ["family_musky_clean", "family_fresh_aromatic_clean"],
    definition: "Minimal clean musks paired with aromatic clean-air lift.",
  },

  hybrid_family_musky_skin_clean: {
    id: "hybrid_family_musky_skin_clean",
    label: "Skin Musk + Clean Warmth",
    primaryFamilyIds: ["family_musky_skin_intimate", "family_musky_clean"],
    definition: "Intimate skin musks with controlled warmth (close, not cloying).",
  },

  hybrid_family_laundry_musk: {
    id: "hybrid_family_laundry_musk",
    label: "Laundry Musk",
    primaryFamilyIds: ["family_musky_laundry", "family_fresh_green_aromatic"],
    definition: "Laundry cotton freshness fused with green aromatics.",
  },

  hybrid_family_aquatic_mineral: {
    id: "hybrid_family_aquatic_mineral",
    label: "Mineral Aquatic",
    primaryFamilyIds: ["family_aquatic_ozonic_mineral", "family_fresh_aromatic_clean"],
    definition: "Mineral/stone water feel blended with clean-air lift.",
  },

  hybrid_family_salty_aquatic: {
    id: "hybrid_family_salty_aquatic",
    label: "Salty Aquatic",
    primaryFamilyIds: ["family_fresh_aquatic_salty", "family_aquatic_ozonic_mineral"],
    definition: "Sea-salt briny freshness with mineral and ozonic edges.",
  },

  hybrid_family_ozonic_aquatic: {
    id: "hybrid_family_ozonic_aquatic",
    label: "Ozonic Aquatic",
    primaryFamilyIds: ["family_aquatic_ozonic_mineral"],
    definition: "Calone/ozonic clean sea air signature.",
  },

  hybrid_family_amber_resinous: {
    id: "hybrid_family_amber_resinous",
    label: "Amber Resinous",
    primaryFamilyIds: ["family_amber_resinous"],
    definition: "Resinous amber warmth and balsamic glow.",
  },

  hybrid_family_floral_powdery_iris: {
    id: "hybrid_family_floral_powdery_iris",
    label: "Powdery Iris Elegance",
    primaryFamilyIds: ["family_floral_powdery_iris", "family_floral_airy_white"],
    definition: "Powdery iris elegance with airy floral restraint.",
  },

  hybrid_family_leather_smoky: {
    id: "hybrid_family_leather_smoky",
    label: "Leather Smoky",
    primaryFamilyIds: ["family_leather_smoky", "family_smoke_incense"],
    definition: "Leathery smoke and smoldering aged leather atmosphere.",
  },

  hybrid_family_oud_resin_smoke_dark: {
    id: "hybrid_family_oud_resin_smoke_dark",
    label: "Oud Resin Smoke (Dark)",
    primaryFamilyIds: ["family_oud_smoke_resin", "family_leather_smoky"],
    definition: "Dark oud-resin smoke aura with bold persistence.",
  },
};

