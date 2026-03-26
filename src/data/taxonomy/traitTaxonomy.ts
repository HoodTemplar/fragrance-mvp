/**
 * Perceptual trait taxonomy (bounded 0..1).
 *
 * This is designed for recommendation-quality vector scoring:
 * - accords carry traitDeltas
 * - enriched fragrances accumulate/normalize evidence into trait scores
 *
 * The existing app does not use these traits yet.
 */

import type { PerceptualTrait, PerceptualTraitId } from "./types";

export const PERCEPTUAL_TRAITS: Record<PerceptualTraitId, PerceptualTrait> = {
  trait_cleanliness: {
    id: "trait_cleanliness",
    label: "Cleanliness",
    description: "How clean, crisp, freshly washed, or polished the scent feels.",
    scale: "bounded_0_1",
    synonyms: ["clean", "freshly washed", "polished"],
  },
  trait_freshness: {
    id: "trait_freshness",
    label: "Freshness",
    description: "Bright freshness: citrus/green freshness rather than just cleanliness.",
    scale: "bounded_0_1",
    synonyms: ["fresh", "bright"],
  },
  trait_sweetness: {
    id: "trait_sweetness",
    label: "Sweetness",
    description: "Dessert-like sweetness from vanilla/gourmand/candy materials.",
    scale: "bounded_0_1",
    synonyms: ["sweet", "gourmand sweetness"],
  },
  trait_darkness: {
    id: "trait_darkness",
    label: "Darkness",
    description: "Depth and shadow: smoky/leathery/resinous darkness.",
    scale: "bounded_0_1",
    synonyms: ["dark", "shadowy", "deep"],
  },
  trait_temperature_warmth: {
    id: "trait_temperature_warmth",
    label: "Warmth",
    description: "Warm glow: amber/resins/vanilla warmth.",
    scale: "bounded_0_1",
    synonyms: ["warm", "cozy warmth"],
  },
  trait_temperature_coolness: {
    id: "trait_temperature_coolness",
    label: "Coolness",
    description: "Cool air: ozonic/fresh spices and clean aromatic lift.",
    scale: "bounded_0_1",
    synonyms: ["cool", "crisp air"],
  },
  trait_powderiness: {
    id: "trait_powderiness",
    label: "Powderiness",
    description: "Iris/orris-like powder softness and dry elegance.",
    scale: "bounded_0_1",
    synonyms: ["powdery", "iris powder"],
  },
  trait_smokiness: {
    id: "trait_smokiness",
    label: "Smokiness",
    description: "Smoked woods and incense smoke haze.",
    scale: "bounded_0_1",
    synonyms: ["smoky", "smoke haze"],
  },
  trait_leatheriness: {
    id: "trait_leatheriness",
    label: "Leatheriness",
    description: "Leather suede/aged leather bite and tannic structure.",
    scale: "bounded_0_1",
    synonyms: ["leather", "suede"],
  },
  trait_creaminess: {
    id: "trait_creaminess",
    label: "Creaminess",
    description: "Creamy softness from milky/lactonic or creamy floral woods.",
    scale: "bounded_0_1",
    synonyms: ["creamy", "milky warmth"],
  },
  trait_resinousness: {
    id: "trait_resinousness",
    label: "Resinousness",
    description: "Resin depth: benzoin/labdanum/copal style persistence.",
    scale: "bounded_0_1",
    synonyms: ["resinous", "balsamic depth"],
  },
  trait_musky_clean: {
    id: "trait_musky_clean",
    label: "Musky (Clean)",
    description: "Clean musks: minimal/ozonic musks and polished skin cleanliness.",
    scale: "bounded_0_1",
    synonyms: ["clean musk", "minimal musk"],
  },
  trait_musky_skin: {
    id: "trait_musky_skin",
    label: "Musky (Skin)",
    description: "Skin musks: intimate ambrette-style closeness.",
    scale: "bounded_0_1",
    synonyms: ["skin musk", "intimate musk"],
  },
  trait_musky_laundry: {
    id: "trait_musky_laundry",
    label: "Musky (Laundry)",
    description: "Laundry musks: cotton/linen clean fabric impression.",
    scale: "bounded_0_1",
    synonyms: ["laundry musk", "fresh linen"],
  },
  trait_aquaticness: {
    id: "trait_aquaticness",
    label: "Aquaticness",
    description: "Water/sea air sensation excluding mineral/ozonic nuance.",
    scale: "bounded_0_1",
    synonyms: ["aquatic", "marine"],
  },
  trait_minerality: {
    id: "trait_minerality",
    label: "Minerality",
    description: "Stone/metal/mineral water feel and mineral crispness.",
    scale: "bounded_0_1",
    synonyms: ["mineral", "stone"],
  },
  trait_ozonicness: {
    id: "trait_ozonicness",
    label: "Ozonicness",
    description: "Ozonic air/chemical fresh “clean sea air” character.",
    scale: "bounded_0_1",
    synonyms: ["ozonic", "calone-like"],
  },
  trait_sensuality: {
    id: "trait_sensuality",
    label: "Sensuality",
    description: "Warm inviting sensual aura from creamy florals/amber sweetness.",
    scale: "bounded_0_1",
    synonyms: ["sensual", "inviting warmth"],
  },
  trait_boldness: {
    id: "trait_boldness",
    label: "Boldness",
    description: "Presence and bold mood: stronger impact, not just intensity level.",
    scale: "bounded_0_1",
    synonyms: ["bold", "presence"],
  },
  trait_fresh_airiness: {
    id: "trait_fresh_airiness",
    label: "Airiness",
    description: "Light airy lift, often from airy florals and ozonic freshness.",
    scale: "bounded_0_1",
    synonyms: ["airy", "light lift"],
  },
  trait_complexity: {
    id: "trait_complexity",
    label: "Complexity",
    description: "How multi-faceted and layered the scent impression feels.",
    scale: "bounded_0_1",
    synonyms: ["complex", "layered"],
  },
  trait_mass_appeal: {
    id: "trait_mass_appeal",
    label: "Mass Appeal",
    description: "Crowd-friendly appeal vs challenging collector vibe.",
    scale: "bounded_0_1",
    synonyms: ["mass appeal", "easy-to-like"],
  },
  trait_uniqueness: {
    id: "trait_uniqueness",
    label: "Uniqueness",
    description: "Distinctive/collector feel: uncommon combinations, dark-smoldering, oud/incense, etc.",
    scale: "bounded_0_1",
    synonyms: ["unique", "collector vibe"],
  },
};

