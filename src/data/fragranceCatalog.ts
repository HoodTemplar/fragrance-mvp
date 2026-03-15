/**
 * Curated fragrance catalog for rule-based recommendations.
 * Each fragrance has category, occasions, and budget so we can match gaps and quiz preferences.
 */

export type BudgetTier = "budget" | "mid" | "luxe" | "niche";
export type OccasionTag = "office" | "casual" | "date" | "formal" | "summer" | "evening";

export interface CatalogFragrance {
  id: string;
  name: string;
  brand: string;
  category: string;
  occasions: OccasionTag[];
  budgetTier: BudgetTier;
  designerNiche: "designer" | "niche";
  /** Short descriptor for layering / matching (e.g. "citrus top", "woody base") */
  profileHint: string;
}

export const FRAGRANCE_CATALOG: CatalogFragrance[] = [
  { id: "bleu", name: "Bleu de Chanel", brand: "Chanel", category: "Fresh Woody", occasions: ["office", "casual", "date"], budgetTier: "luxe", designerNiche: "designer", profileHint: "versatile citrus-woody" },
  { id: "terre", name: "Terre d'Hermès", brand: "Hermès", category: "Woody Citrus", occasions: ["office", "casual", "date"], budgetTier: "luxe", designerNiche: "designer", profileHint: "earthy vetiver-citrus" },
  { id: "acqua", name: "Acqua di Gio", brand: "Giorgio Armani", category: "Fresh Aquatic", occasions: ["office", "casual", "summer"], budgetTier: "mid", designerNiche: "designer", profileHint: "fresh aquatic" },
  { id: "santal33", name: "Santal 33", brand: "Le Labo", category: "Woody", occasions: ["casual", "date", "evening"], budgetTier: "niche", designerNiche: "niche", profileHint: "sandalwood-leather" },
  { id: "ombre", name: "Ombre Leather", brand: "Tom Ford", category: "Leather", occasions: ["date", "formal", "evening"], budgetTier: "luxe", designerNiche: "designer", profileHint: "leather" },
  { id: "another13", name: "Another 13", brand: "Le Labo", category: "Skin Scent", occasions: ["office", "casual"], budgetTier: "niche", designerNiche: "niche", profileHint: "minimal musk" },
  { id: "woodsage", name: "Wood Sage & Sea Salt", brand: "Jo Malone", category: "Fresh Woody", occasions: ["casual", "summer"], budgetTier: "mid", designerNiche: "designer", profileHint: "fresh woody aquatic" },
  { id: "gypsy", name: "Gypsy Water", brand: "Byredo", category: "Fresh Woody", occasions: ["casual", "date"], budgetTier: "niche", designerNiche: "niche", profileHint: "pine-vanilla" },
  { id: "sauvage", name: "Sauvage", brand: "Dior", category: "Fresh Spicy", occasions: ["office", "casual", "evening"], budgetTier: "mid", designerNiche: "designer", profileHint: "amber-woody fresh" },
  { id: "bdc", name: "Bleu de Chanel Parfum", brand: "Chanel", category: "Woody", occasions: ["office", "date", "formal"], budgetTier: "luxe", designerNiche: "designer", profileHint: "deep woody" },
  { id: "luna", name: "Luna Rossa Ocean", brand: "Prada", category: "Fresh Aquatic", occasions: ["office", "casual", "summer"], budgetTier: "mid", designerNiche: "designer", profileHint: "marine fresh" },
  { id: "y", name: "Y", brand: "Yves Saint Laurent", category: "Fresh Woody", occasions: ["office", "casual", "date"], budgetTier: "mid", designerNiche: "designer", profileHint: "fresh fougère" },
  { id: "noir", name: "Noir Extreme", brand: "Tom Ford", category: "Amber", occasions: ["date", "formal", "evening"], budgetTier: "luxe", designerNiche: "designer", profileHint: "warm vanilla-amber" },
  { id: "oudwood", name: "Oud Wood", brand: "Tom Ford", category: "Woody", occasions: ["date", "formal", "evening"], budgetTier: "luxe", designerNiche: "designer", profileHint: "oud-woody" },
  { id: "neroli", name: "Neroli Portofino", brand: "Tom Ford", category: "Fresh Citrus", occasions: ["casual", "summer"], budgetTier: "luxe", designerNiche: "designer", profileHint: "citrus" },
  { id: "greenley", name: "Greenley", brand: "Parfums de Marly", category: "Green", occasions: ["office", "casual", "summer"], budgetTier: "niche", designerNiche: "niche", profileHint: "green apple-woody" },
  { id: "layton", name: "Layton", brand: "Parfums de Marly", category: "Woody", occasions: ["casual", "date", "evening"], budgetTier: "niche", designerNiche: "niche", profileHint: "lavender-vanilla-wood" },
  { id: "cedrat", name: "Cedrat Enivrant", brand: "Atelier Cologne", category: "Fresh Citrus", occasions: ["office", "casual", "summer"], budgetTier: "mid", designerNiche: "niche", profileHint: "citrus" },
  { id: "hacivat", name: "Hacivat", brand: "Nishane", category: "Woody Citrus", occasions: ["office", "casual", "date"], budgetTier: "niche", designerNiche: "niche", profileHint: "pineapple-woody" },
  { id: "angel", name: "Angel", brand: "Mugler", category: "Oriental", occasions: ["date", "evening"], budgetTier: "mid", designerNiche: "designer", profileHint: "patchouli-vanilla" },
  { id: "one", name: "One Million", brand: "Paco Rabanne", category: "Amber", occasions: ["casual", "evening"], budgetTier: "budget", designerNiche: "designer", profileHint: "sweet amber" },
  { id: "invictus", name: "Invictus", brand: "Paco Rabanne", category: "Fresh", occasions: ["casual", "summer"], budgetTier: "budget", designerNiche: "designer", profileHint: "fresh sweet" },
  { id: "lightblue", name: "Light Blue", brand: "Dolce & Gabbana", category: "Fresh", occasions: ["office", "casual", "summer"], budgetTier: "mid", designerNiche: "designer", profileHint: "fresh fruity" },
  { id: "prada", name: "L'Homme Prada", brand: "Prada", category: "Fresh Woody", occasions: ["office", "formal"], budgetTier: "luxe", designerNiche: "designer", profileHint: "iris-amber" },
  { id: "dylan", name: "Dylan Blue", brand: "Versace", category: "Fresh Aquatic", occasions: ["office", "casual", "summer"], budgetTier: "budget", designerNiche: "designer", profileHint: "fresh aquatic" },
  { id: "eros", name: "Eros", brand: "Versace", category: "Fresh", occasions: ["casual", "date", "evening"], budgetTier: "mid", designerNiche: "designer", profileHint: "mint-vanilla" },
];

/** Normalize category for matching (e.g. "Fresh / Aquatic" -> "Fresh Aquatic") */
export function normalizeCategoryForMatch(category: string): string {
  return category.replace(/\s*[\/\-]\s*/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Check if catalog category matches a gap/missing category (e.g. "Fresh Woody" fills "Fresh / Aquatic") */
export function categoryMatchesGap(catalogCategory: string, missingCategories: string[]): boolean {
  const cat = normalizeCategoryForMatch(catalogCategory);
  const catWords = cat.split(/\s+/).filter(Boolean);
  return missingCategories.some((gap) => {
    const g = normalizeCategoryForMatch(gap);
    const gapWords = g.split(/\s+/).filter(Boolean);
    return catWords.some((w) => gapWords.includes(w) || gapWords.some((gw) => cat.includes(gw) || g.includes(w)));
  });
}
