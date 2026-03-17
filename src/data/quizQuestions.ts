/**
 * Scent DNA quiz — 9 questions. Cinematic, consultation-style.
 * Each question captures hidden preference signals for the recommendation engine.
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "Where does your energy feel most at home?",
    options: [
      { value: "paris_coffee", label: "A small, undiscovered coffee shop in Paris — espresso and warm pastries in the air" },
      { value: "soho_gallery", label: "A modern art gallery in SoHo — quiet sophistication and clean lines" },
      { value: "mediterranean", label: "A bright Mediterranean beach morning — salt air and citrus nearby" },
      { value: "rooftop_night", label: "A rooftop bar overlooking the city at night — music and glowing lights" },
      { value: "rainy_bookstore", label: "A quiet bookstore on a rainy afternoon — wood shelves and old paper" },
    ],
  },
  {
    id: "q2",
    question: "Which description feels closest to how you present yourself?",
    options: [
      { value: "clean_minimal", label: "Clean, minimal, and refined" },
      { value: "classic_polished", label: "Classic and polished" },
      { value: "bold_fashion", label: "Bold and fashion-forward" },
      { value: "creative_unconventional", label: "Creative and unconventional" },
      { value: "relaxed_effortless", label: "Relaxed and effortless" },
    ],
  },
  {
    id: "q3",
    question: "When someone notices your fragrance, what reaction would you love most?",
    options: [
      { value: "impression_clean", label: "\"They smell incredibly clean and put together.\"" },
      { value: "impression_intriguing", label: "\"That scent is intriguing.\"" },
      { value: "impression_attractive", label: "\"That smells incredibly attractive.\"" },
      { value: "impression_expensive", label: "\"That smells expensive.\"" },
      { value: "impression_fresh", label: "\"That smells fresh and uplifting.\"" },
    ],
  },
  {
    id: "q4",
    question: "How noticeable should your fragrance be?",
    options: [
      { value: "presence_aura", label: "Barely noticeable — like a personal aura" },
      { value: "presence_subtle", label: "Subtle but present" },
      { value: "presence_memorable", label: "Noticeable and memorable" },
      { value: "presence_bold", label: "Bold and unmistakable" },
    ],
  },
  {
    id: "q5",
    question: "Where do you most imagine wearing your ideal fragrance?",
    options: [
      { value: "context_everyday", label: "Everyday life" },
      { value: "context_professional", label: "Professional settings" },
      { value: "context_dates", label: "Dates and evenings" },
      { value: "context_special", label: "Special occasions" },
      { value: "context_nightlife", label: "Nightlife and social events" },
    ],
  },
  {
    id: "q6",
    question: "Which weather feels most natural to you?",
    options: [
      { value: "climate_summer", label: "Hot, sunny weather" },
      { value: "climate_spring", label: "Breezy spring weather" },
      { value: "climate_autumn", label: "Crisp autumn weather" },
      { value: "climate_winter", label: "Cold winter nights" },
      { value: "climate_all", label: "A mix of everything" },
    ],
  },
  {
    id: "q7",
    question: "What ruins a fragrance for you?",
    options: [
      { value: "turnoff_sweet", label: "Too sweet" },
      { value: "turnoff_powdery", label: "Too powdery" },
      { value: "turnoff_heavy", label: "Too heavy" },
      { value: "turnoff_sharp", label: "Too sharp" },
      { value: "turnoff_loud", label: "Too loud" },
    ],
  },
  {
    id: "q8",
    question: "Which scent style sounds most appealing?",
    options: [
      { value: "scent_citrus_woods", label: "Bright citrus and woods" },
      { value: "scent_musk_floral", label: "Clean musks and soft florals" },
      { value: "scent_amber_spice", label: "Warm amber and spice" },
      { value: "scent_smoky_incense", label: "Smoky woods and incense" },
      { value: "scent_vanilla_warmth", label: "Creamy vanilla and warmth" },
      { value: "scent_green_fresh", label: "Fresh green aromatics" },
    ],
  },
  {
    id: "q9",
    question: "Which fragrance style direction feels closest to you?",
    options: [
      { value: "gender_masculine", label: "Traditionally masculine leaning" },
      { value: "gender_feminine", label: "Traditionally feminine leaning" },
      { value: "gender_unisex", label: "Modern unisex balance" },
      { value: "gender_open", label: "Open to anything interesting" },
    ],
  },
];
