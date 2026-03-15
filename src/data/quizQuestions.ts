/**
 * Scent DNA quiz — 10 questions. Premium copy.
 * Covers: scent family, fresh/sweet/woody/spicy, occasion, budget, designer vs niche.
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "Which scent family speaks to you most?",
    options: [
      { value: "fresh", label: "Fresh — citrus, green, aquatic" },
      { value: "sweet", label: "Sweet — gourmand, vanilla, amber" },
      { value: "woody", label: "Woody — sandalwood, cedar, vetiver" },
      { value: "spicy", label: "Spicy — pepper, incense, oud" },
    ],
  },
  {
    id: "q2",
    question: "When do you reach for fragrance most?",
    options: [
      { value: "daily", label: "Daily — office, errands, everyday" },
      { value: "nightlife", label: "Nightlife — evenings out, parties" },
      { value: "date", label: "Date night — intimate, memorable" },
      { value: "all", label: "All of the above" },
    ],
  },
  {
    id: "q3",
    question: "How do you like your scent to feel?",
    options: [
      { value: "light", label: "Light and transparent" },
      { value: "warm", label: "Warm and enveloping" },
      { value: "bold", label: "Bold and statement-making" },
      { value: "balanced", label: "Balanced — noticeable but not loud" },
    ],
  },
  {
    id: "q4",
    question: "What’s your budget for a new bottle?",
    options: [
      { value: "budget", label: "Under $60" },
      { value: "mid", label: "$60 – $150" },
      { value: "luxe", label: "$150 – $300" },
      { value: "niche", label: "$300+ — I invest in niche" },
    ],
  },
  {
    id: "q5",
    question: "Designer or niche?",
    options: [
      { value: "designer", label: "Designer — established houses, wide appeal" },
      { value: "niche", label: "Niche — artisanal, distinctive" },
      { value: "both", label: "Both — I choose by scent, not label" },
    ],
  },
  {
    id: "q6",
    question: "How do you feel about sweet notes?",
    options: [
      { value: "love", label: "I love them — vanilla, tonka, caramel" },
      { value: "subtle", label: "Only when subtle and refined" },
      { value: "avoid", label: "I prefer dry or fresh over sweet" },
    ],
  },
  {
    id: "q7",
    question: "One signature or a rotation?",
    options: [
      { value: "signature", label: "One signature — my scent" },
      { value: "rotation", label: "A small rotation by mood" },
      { value: "collection", label: "A collection — I like variety" },
    ],
  },
  {
    id: "q8",
    question: "Where do you want your scent to take you?",
    options: [
      { value: "clean", label: "Clean, polished, put-together" },
      { value: "seductive", label: "Seductive, memorable" },
      { value: "adventurous", label: "Adventurous, unexpected" },
      { value: "timeless", label: "Timeless, classic" },
    ],
  },
  {
    id: "q9",
    question: "How long should it last?",
    options: [
      { value: "short", label: "A few hours — I like to reapply" },
      { value: "day", label: "All day — set and forget" },
      { value: "trail", label: "Long-lasting — I want a trail" },
    ],
  },
  {
    id: "q10",
    question: "What best describes your fragrance journey?",
    options: [
      { value: "beginner", label: "Just beginning — finding my way" },
      { value: "curious", label: "Curious — I know what I like and want more" },
      { value: "enthusiast", label: "Enthusiast — I live and breathe scent" },
    ],
  },
];
