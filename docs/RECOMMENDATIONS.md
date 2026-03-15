# Recommendation logic (MVP)

Recommendations use **simple rules first**, then **AI only to polish the copy** so results are specific and not generic.

## Inputs

- **Detected fragrances** — from collection photo (name, brand). Can be empty (quiz-only).
- **Missing categories** — e.g. "Fresh / Aquatic", "Oriental / Spicy".
- **Strengths / weaknesses** — from collection analysis.
- **Quiz answers** (optional) — q1 = scent family, q2 = occasion, q4 = budget, q5 = designer/niche.

## Outputs

- **5 fragrances** — from a curated catalog, chosen by rules.
- **2–3 layering suggestions** — e.g. "Layer X with Y for …".
- **When to wear** — short lines per occasion (office, date night, summer, etc.).

## Rule-based engine

**File:** `src/lib/recommendations/engine.ts`

1. **Catalog** — `src/data/fragranceCatalog.ts` lists real fragrances with category, occasions, budget tier, designer/niche.
2. **Exclude owned** — never recommend something already in the user’s collection (match by name + brand).
3. **Score candidates** — prefer fragrances that:
   - Fill a **missing category** (e.g. Fresh Aquatic when they lack fresh).
   - Match **quiz family** (q1: fresh, woody, sweet, spicy).
   - Match **occasion** (q2: daily → office-friendly, date → date-friendly).
   - Match **budget** (q4) and **designer/niche** (q5).
4. **Pick 5** — take top-scoring, add a short **reason** per pick (for AI polish).
5. **Layering** — 2–3 suggestions using detected bottles + recommended picks (e.g. “your bottle X + recommended Y”).
6. **When to wear** — from what they have + gaps (e.g. “Office: use your fresh options”; “Summer: add one recommended aquatic”).

## AI polish

**File:** `src/lib/recommendations/polish.ts`

- **Input:** engine output (5 picks with reasons, layering bullets, when-to-wear bullets).
- **One AI call:** “Rewrite these in polished, specific, non-generic copy. Same structure.”
- **Output:** same 5 fragrances with a short **note** each, polished layering sentences, polished when-to-wear lines.
- **Fallback:** if the API key is missing or the call fails, the app uses the raw reasons and bullets (no crash).

## Where it’s used

- **Collection flow** — after analysis, `generateCollectionAnalysis()` runs the engine with detections + analysis gaps/strengths/weaknesses, then polish. Result is shown on the results page and in sessionStorage for the recommendations page.
- **Quiz flow** — `submitQuiz()` calls `getRecommendationsForQuiz(answers)`, which runs the engine with empty detections and quiz answers only, then polish. Stored in sessionStorage; recommendations page reads it when `?source=quiz`.

## Extending later

- **Catalog:** add fragrances in `src/data/fragranceCatalog.ts` (category, occasions, budgetTier, designerNiche).
- **Rules:** adjust scoring and reasons in `src/lib/recommendations/engine.ts`.
- **Copy:** change the polish prompt in `src/lib/recommendations/polish.ts`.
