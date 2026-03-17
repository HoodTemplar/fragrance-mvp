/**
 * Scent DNA quiz — 9 questions. Cinematic, scene-based.
 * Each option has a unique card theme and optional subtitle for visual distinction.
 */

export type ThemeHint = "dark" | "fresh" | "warm" | "neutral";

/** Unique visual theme for each answer card (gradient, glow, feel). */
export type CardThemeKey =
  | "dark_mysterious"
  | "fresh_clean"
  | "warm_spicy"
  | "nightlife"
  | "beach_sun"
  | "warm_cozy"
  | "neutral_classic"
  | "fresh_airy"
  | "bold_dark"
  | "soft_cream";

export interface QuizQuestion {
  id: string;
  sceneHeadline: string;
  question: string;
  options: {
    value: string;
    label: string;
    themeHint?: ThemeHint;
    /** Unique card look (gradient, glow). Defaults from themeHint if omitted. */
    cardTheme?: CardThemeKey;
    /** Optional short line under the title. */
    subtitle?: string;
  }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    sceneHeadline: "You step into one of these worlds…",
    question: "Where does your energy feel most at home?",
    options: [
      { value: "paris_coffee", label: "A hidden café in Paris", subtitle: "Espresso and warm pastries in the air", themeHint: "warm", cardTheme: "warm_cozy" },
      { value: "soho_gallery", label: "A modern art gallery in SoHo", subtitle: "Quiet sophistication and clean lines", themeHint: "fresh", cardTheme: "fresh_clean" },
      { value: "mediterranean", label: "A sunlit beach in Tulum", subtitle: "Salt air and citrus nearby", themeHint: "fresh", cardTheme: "beach_sun" },
      { value: "rooftop_night", label: "A rooftop party in Marrakech", subtitle: "Music and glowing lights", themeHint: "dark", cardTheme: "nightlife" },
      { value: "rainy_bookstore", label: "A quiet bookstore on a rainy afternoon", subtitle: "Wood shelves and old paper", themeHint: "warm", cardTheme: "warm_cozy" },
    ],
  },
  {
    id: "q2",
    sceneHeadline: "How do you show up in the room?",
    question: "Which description feels closest to how you present yourself?",
    options: [
      { value: "clean_minimal", label: "Clean, minimal, and refined", themeHint: "fresh", cardTheme: "fresh_airy" },
      { value: "classic_polished", label: "Classic and polished", themeHint: "neutral", cardTheme: "neutral_classic" },
      { value: "bold_fashion", label: "Bold and fashion-forward", themeHint: "dark", cardTheme: "bold_dark" },
      { value: "creative_unconventional", label: "Creative and unconventional", themeHint: "dark", cardTheme: "dark_mysterious" },
      { value: "relaxed_effortless", label: "Relaxed and effortless", themeHint: "warm", cardTheme: "soft_cream" },
    ],
  },
  {
    id: "q3",
    sceneHeadline: "When someone leans in and notices your scent…",
    question: "What reaction would you love most?",
    options: [
      { value: "impression_clean", label: "“They smell incredibly clean and put together.”", themeHint: "fresh", cardTheme: "fresh_clean" },
      { value: "impression_intriguing", label: "“That scent is intriguing.”", themeHint: "dark", cardTheme: "dark_mysterious" },
      { value: "impression_attractive", label: "“That smells incredibly attractive.”", themeHint: "warm", cardTheme: "warm_spicy" },
      { value: "impression_expensive", label: "“That smells expensive.”", themeHint: "neutral", cardTheme: "neutral_classic" },
      { value: "impression_fresh", label: "“That smells fresh and uplifting.”", themeHint: "fresh", cardTheme: "fresh_airy" },
    ],
  },
  {
    id: "q4",
    sceneHeadline: "How close do you want your scent to stay?",
    question: "How noticeable should your fragrance be?",
    options: [
      { value: "presence_aura", label: "Barely noticeable", subtitle: "Like a personal aura", themeHint: "fresh", cardTheme: "fresh_airy" },
      { value: "presence_subtle", label: "Subtle but present", themeHint: "neutral", cardTheme: "soft_cream" },
      { value: "presence_memorable", label: "Noticeable and memorable", themeHint: "warm", cardTheme: "warm_spicy" },
      { value: "presence_bold", label: "Bold and unmistakable", themeHint: "dark", cardTheme: "bold_dark" },
    ],
  },
  {
    id: "q5",
    sceneHeadline: "Where do you imagine wearing it first?",
    question: "Where do you most imagine wearing your ideal fragrance?",
    options: [
      { value: "context_everyday", label: "Everyday life", themeHint: "neutral", cardTheme: "soft_cream" },
      { value: "context_professional", label: "Professional settings", themeHint: "fresh", cardTheme: "fresh_clean" },
      { value: "context_dates", label: "Dates and evenings", themeHint: "warm", cardTheme: "warm_spicy" },
      { value: "context_special", label: "Special occasions", themeHint: "neutral", cardTheme: "neutral_classic" },
      { value: "context_nightlife", label: "Nightlife and social events", themeHint: "dark", cardTheme: "nightlife" },
    ],
  },
  {
    id: "q6",
    sceneHeadline: "Which weather feels most like you?",
    question: "Which weather feels most natural to you?",
    options: [
      { value: "climate_summer", label: "Hot, sunny weather", themeHint: "fresh", cardTheme: "beach_sun" },
      { value: "climate_spring", label: "Breezy spring weather", themeHint: "fresh", cardTheme: "fresh_airy" },
      { value: "climate_autumn", label: "Crisp autumn weather", themeHint: "warm", cardTheme: "warm_cozy" },
      { value: "climate_winter", label: "Cold winter nights", themeHint: "dark", cardTheme: "dark_mysterious" },
      { value: "climate_all", label: "A mix of everything", themeHint: "neutral", cardTheme: "neutral_classic" },
    ],
  },
  {
    id: "q7",
    sceneHeadline: "What turns you off?",
    question: "What ruins a fragrance for you?",
    options: [
      { value: "turnoff_sweet", label: "Too sweet", themeHint: "fresh", cardTheme: "fresh_clean" },
      { value: "turnoff_powdery", label: "Too powdery", themeHint: "neutral", cardTheme: "soft_cream" },
      { value: "turnoff_heavy", label: "Too heavy", themeHint: "fresh", cardTheme: "fresh_airy" },
      { value: "turnoff_sharp", label: "Too sharp", themeHint: "warm", cardTheme: "warm_cozy" },
      { value: "turnoff_loud", label: "Too loud", themeHint: "neutral", cardTheme: "neutral_classic" },
    ],
  },
  {
    id: "q8",
    sceneHeadline: "Which scent direction calls to you?",
    question: "Which scent style sounds most appealing?",
    options: [
      { value: "scent_citrus_woods", label: "Bright citrus and woods", themeHint: "fresh", cardTheme: "beach_sun" },
      { value: "scent_musk_floral", label: "Clean musks and soft florals", themeHint: "fresh", cardTheme: "fresh_airy" },
      { value: "scent_amber_spice", label: "Warm amber and spice", themeHint: "warm", cardTheme: "warm_spicy" },
      { value: "scent_smoky_incense", label: "Smoky woods and incense", themeHint: "dark", cardTheme: "dark_mysterious" },
      { value: "scent_vanilla_warmth", label: "Creamy vanilla and warmth", themeHint: "warm", cardTheme: "warm_cozy" },
      { value: "scent_green_fresh", label: "Fresh green aromatics", themeHint: "fresh", cardTheme: "fresh_clean" },
    ],
  },
  {
    id: "q9",
    sceneHeadline: "How do you like to wear scent?",
    question: "Which fragrance style direction feels closest to you?",
    options: [
      { value: "gender_masculine", label: "Traditionally masculine leaning", themeHint: "neutral", cardTheme: "neutral_classic" },
      { value: "gender_feminine", label: "Traditionally feminine leaning", themeHint: "neutral", cardTheme: "soft_cream" },
      { value: "gender_unisex", label: "Modern unisex balance", themeHint: "neutral", cardTheme: "fresh_clean" },
      { value: "gender_open", label: "Open to anything interesting", themeHint: "neutral", cardTheme: "bold_dark" },
    ],
  },
];
