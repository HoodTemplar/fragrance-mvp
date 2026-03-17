/**
 * Scent DNA archetypes — 8 character-led identities for quiz results.
 * Used to make the result feel like a discovery, not a category.
 */

export interface ScentArchetype {
  id: string;
  name: string;
  characterDescription: string;
  fragranceFamilies: string[];
  typicalOccasions: string[];
  seasonsWhereItShines: string[];
  recommendationStyle: string;
}

export const SCENT_ARCHETYPES: ScentArchetype[] = [
  {
    id: "coastal_philosopher",
    name: "The Coastal Philosopher",
    characterDescription:
      "You're the one who's up before the city—by the water, with a book or just the horizon. Salt and citrus in the air, clarity in the head. You don't chase intensity; you find it in simplicity. Your scent should feel like that first breath of morning: clean, open, quietly confident.",
    fragranceFamilies: ["Fresh", "Citrus", "Aquatic", "Green Aromatics"],
    typicalOccasions: ["Morning rituals", "Travel", "Quiet work", "Weekend by the water"],
    seasonsWhereItShines: ["Spring", "Summer"],
    recommendationStyle:
      "Clean, intellectual, understated. Prioritise citrus, aquatics, and green notes. Favour refined freshness over loud or sugary.",
  },
  {
    id: "velvet_alchemist",
    name: "The Velvet Alchemist",
    characterDescription:
      "You turn ordinary evenings into something magnetic. Amber, vanilla, a hint of spice—nothing sharp, everything warm. You don't announce yourself; you pull people in. Your scent should feel like candlelight and low voices: intimate, memorable, impossible to place and impossible to forget.",
    fragranceFamilies: ["Amber", "Oriental", "Gourmand", "Warm Spice"],
    typicalOccasions: ["Late dinners", "Dates", "Intimate gatherings", "Cold-weather nights"],
    seasonsWhereItShines: ["Fall", "Winter"],
    recommendationStyle:
      "Warm, sensual, memorable. Prioritise amber, vanilla, tonka, soft spices. Balance cozy with alluring.",
  },
  {
    id: "silver_minimalist",
    name: "The Silver Minimalist",
    characterDescription:
      "You believe the best scent is the one that feels like you—only more so. No costume, no performance. Musks, skin, a touch of iris or soft wood. Your fragrance is a private layer: barely there to others, deeply present for you. Less is more, and you mean it.",
    fragranceFamilies: ["Musk", "Skin Scents", "Soft Florals", "Clean Woods"],
    typicalOccasions: ["Everyday life", "The office", "Close encounters", "When subtlety matters"],
    seasonsWhereItShines: ["Any"],
    recommendationStyle:
      "Intimate projection, second skin. Emphasise musks, iris, soft woods, clean ambers. Avoid loud or sweet.",
  },
  {
    id: "shadow_poet",
    name: "The Shadow Poet",
    characterDescription:
      "You find beauty in depth and half-light. Incense, oud, smoke, old wood. Your scent doesn't ask for attention; it occupies the air. You're the one in the corner who says little and leaves a strong impression. Your fragrance should feel like the last hour of the night: dark, lingering, full of unsaid things.",
    fragranceFamilies: ["Oud", "Incense", "Smoky Woods", "Dark Oriental"],
    typicalOccasions: ["Evening", "Late nights", "Creative work", "Rainy days"],
    seasonsWhereItShines: ["Fall", "Winter"],
    recommendationStyle:
      "Deep, literary, unapologetically dark. Prioritise oud, incense, smoke, dark woods. Balance challenging with wearable.",
  },
  {
    id: "modern_aristocrat",
    name: "The Modern Aristocrat",
    characterDescription:
      "You have the kind of confidence that doesn't need to prove anything. Classic structure—woody, chypre, a touch of leather or polished floral—but never stuffy. Your scent says I belong here without raising your voice. Timeless, not trendy.",
    fragranceFamilies: ["Woody", "Chypre", "Classic Fougère", "Refined Florals"],
    typicalOccasions: ["Professional settings", "Important meetings", "Special occasions"],
    seasonsWhereItShines: ["All seasons"],
    recommendationStyle:
      "Iconic houses and modern classics. Emphasise structure, quality, longevity. Avoid novelty for its own sake.",
  },
  {
    id: "sunlit_nomad",
    name: "The Sunlit Nomad",
    characterDescription:
      "You're built for motion. Bright greens, citrus, open roads, new cities. Your scent should feel like a bag packed and a door left open—free, adaptable, a bit untamed. You don't cling to one mood; you match it. Your fragrance is the thread that ties it all together: fresh, hopeful, impossible to pin down.",
    fragranceFamilies: ["Green Aromatics", "Citrus", "Fresh Woods", "Aromatic"],
    typicalOccasions: ["Travel", "Weekends", "Exploration", "Outdoor plans"],
    seasonsWhereItShines: ["Spring", "Summer"],
    recommendationStyle:
      "Bright, versatile, discovery-led. Prioritise greens, citrus, aromatics. Favour easy to wear anywhere.",
  },
  {
    id: "night_architect",
    name: "The Night Architect",
    characterDescription:
      "You design the room around you. Leather, bold woods, clear lines—no blur, no apology. Your scent is a statement: structural, intriguing, built to be remembered. You're the one people ask What are you wearing? not because it's sweet, but because it's different. You don't follow the map; you redraw it.",
    fragranceFamilies: ["Leather", "Bold Woody", "Aromatic", "Unconventional Blends"],
    typicalOccasions: ["Nightlife", "Creative settings", "Evenings out", "When you want to own the room"],
    seasonsWhereItShines: ["All seasons"],
    recommendationStyle:
      "Niche and distinctive. Prioritise conversation starters, unusual accords, structural compositions. Avoid safe, generic options.",
  },
  {
    id: "quiet_collector",
    name: "The Quiet Collector",
    characterDescription:
      "You don't believe in masculine or feminine—you believe in interesting. Your shelf is a private gallery: a fresh citrus next to a smoky oud, a soft floral beside something sharp. You're open to discovery, to the bottle that doesn't fit the box. Your scent identity isn't one note; it's the thread of curiosity that runs through every choice.",
    fragranceFamilies: ["Unisex", "Eclectic — Fresh to Woody to Gourmand"],
    typicalOccasions: ["Any — everyday, work, dates, travel", "You choose by mood and moment"],
    seasonsWhereItShines: ["All seasons"],
    recommendationStyle:
      "Diverse and exploratory. Mix genres, genders, and price points. Include one reliable staple and one bold discovery.",
  },
];

export function getArchetypeById(id: string): ScentArchetype | undefined {
  return SCENT_ARCHETYPES.find((a) => a.id === id);
}
