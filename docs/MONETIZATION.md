# Monetization structure (ready for later)

The app is **structured** for sponsored recommendations and click tracking. **No ads are turned on yet.** When you’re ready to work with brands, you don’t need to rebuild—you add data and optionally flip where recommendations come from.

---

## What’s in place

### 1. Two kinds of recommendation cards

- **Organic** — Normal recommendation from the engine (gap-filling, quiz, etc.). No badge, no tracking.
- **Sponsored** — Same card UI, but shows a **“Sponsored”** badge and records a click when the user clicks the card (so you can charge per click or report to brands later).

The UI doesn’t distinguish them except for the badge and the fact that sponsored cards are clickable for tracking.

### 2. “Sponsored” badge

- Every recommendation card is rendered by **`RecommendationCard`** (`src/components/RecommendationCard.tsx`).
- If `recommendation.isSponsored === true`, the card shows the word **“Sponsored”** next to the fragrance name.
- Badge is plain text, small, so it’s clear but not loud.

### 3. Place to track clicks

- **Database:** Table **`recommendation_clicks`** stores each click:
  - `sponsored_slot_id` — Set when the click was on a sponsored card (so you can attribute it to a brand/slot).
  - `user_id` — Set if the user was logged in (optional).
  - `page_context` — Where the click happened (e.g. `collection_results` or `recommendations_page`).
  - `clicked_at` — Time of the click.

- **API:** **`POST /api/recommendations/track-click`**  
  Body: `{ sponsorSlotId?: string, pageContext: string }`.  
  The API inserts one row into `recommendation_clicks`. If `sponsorSlotId` is sent, it’s stored in `sponsored_slot_id`.

- **Front-end:** When a user clicks a **sponsored** card that has a `sponsorSlotId`, the app calls this API. Organic cards don’t send anything (you can extend that later if you want).

So: **sponsored cards → optional sponsor slot id → API → `recommendation_clicks`**. You can add reporting or billing on top of that without changing the app structure.

### 4. Database tables for brands (not used yet)

- **`sponsored_slots`**  
  One row per sponsored placement you sell:
  - Links to a **brand** and a **fragrance** (your existing `brands` and `fragrances` tables).
  - Optional `campaign_name`, `starts_at`, `ends_at`, `is_active`.
  - When you “turn on” ads, you’ll pick active slots from this table and inject them into the recommendation list (e.g. replace one organic slot with a sponsored one and pass that row’s `id` as `sponsorSlotId`).

- **`recommendation_clicks`**  
  Described above. Ready to receive clicks; no need to change the schema when you enable ads.

---

## Data flow in plain English

1. **Today (no ads)**  
   All recommendations are organic. Some mock or engine output still has `isSponsored: true` for one card so you can see the “Sponsored” badge; that card has no `sponsorSlotId`, so clicks don’t get attributed to a slot (you could still send `pageContext` for analytics if you want).

2. **When you add brands later**  
   - Insert a row into **`sponsored_slots`** (brand, fragrance, dates, etc.).
   - When building the list of “5 recommendations,” you replace one (or more) positions with a sponsored slot: same `RecommendedFragrance` shape, but `isSponsored: true` and `sponsorSlotId` = that row’s `id`.
   - The same **RecommendationCard** shows the “Sponsored” badge and, on click, calls the track-click API with that `sponsorSlotId`. No app rebuild needed.

3. **Billing or reporting**  
   Query **`recommendation_clicks`** where `sponsored_slot_id` is not null, group by `sponsored_slot_id` (and maybe date), and you have per-slot click counts.

---

## Where things live in the codebase

| What | Where |
|------|--------|
| Type for a recommendation (organic vs sponsored, optional slot id) | `src/types/index.ts` — `RecommendedFragrance` has `isSponsored?` and `sponsorSlotId?`. |
| Single card UI + badge + click handler | `src/components/RecommendationCard.tsx` |
| Track-click API | `src/app/api/recommendations/track-click/route.ts` |
| Tables for slots and clicks | `supabase/schema-mvp.sql` — `sponsored_slots`, `recommendation_clicks` |
| Where cards are used | Collection results: `CollectionResultsContent.tsx`. Recommendations page: `src/app/recommendations/page.tsx`. |

---

## Turning on ads later (no rebuild)

1. Run the schema in Supabase so **`sponsored_slots`** and **`recommendation_clicks`** exist (if you haven’t already).
2. Add brands/fragrances to **`brands`** and **`fragrances`** as needed.
3. Insert rows into **`sponsored_slots`** for each deal (brand, fragrance, campaign, dates).
4. In the code that **builds** the list of 5 recommendations (e.g. in the recommendation engine or a server action that merges organic + sponsored), replace one or more items with a sponsored slot: set `isSponsored: true` and `sponsorSlotId` to the `sponsored_slots.id` for that placement.
5. Clicks on those cards will already be recorded in **`recommendation_clicks`** with that `sponsored_slot_id`; you can then report or bill on that.

No new components or new API routes are required—just data and the logic that fills the recommendation list.
