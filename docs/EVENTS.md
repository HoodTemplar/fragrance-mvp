# Event tracking (MVP)

Events are stored in Supabase in the **`app_events`** table. Each row has:

- **user_id** — Set if the user was logged in; null for anonymous.
- **event_type** — One of the five types below.
- **payload** — Optional JSON (e.g. context, ids, method).
- **created_at** — When the event was recorded.

---

## What each event means (plain English)

### 1. **image_uploaded**

**When it’s recorded:** Right after the user’s photo is saved to storage and a row is created in `collection_uploads`.

**What it means:** The user successfully uploaded a fragrance shelf photo. They may be about to get analysis (or go to the confirmation step first).

**Payload:** `{ uploadId: string }` — the id of the `collection_uploads` row.

**Where it’s fired:** Upload page (after createCollectionUpload in the main flow), and confirm page (after createCollectionUpload when saving the photo from the confirm flow).

---

### 2. **quiz_completed**

**When it’s recorded:** Right after the quiz is submitted successfully and the app is about to send the user to the quiz result page.

**What it means:** The user finished all quiz questions and their answers were processed. A scent profile (and recommendations) were generated.

**Payload:** `{ sessionId: string }` — the quiz session id for that run.

**Where it’s fired:** Quiz page, after `submitQuiz()` succeeds.

---

### 3. **recommendation_viewed**

**When it’s recorded:** Once when a screen that shows recommendations is shown (results page with the “Recommended next purchases” block, or the dedicated recommendations page).

**What it means:** The user saw at least one recommendation list—either on the collection results page or on the “Picks for you” page.

**Payload:** `{ context: "collection_results" | "recommendations_page" }` — which screen it was.

**Where it’s fired:** `CollectionResultsContent` (when it has recommendations), and recommendations page (when the page has loaded and source is set).

---

### 4. **recommendation_clicked**

**When it’s recorded:** When the user clicks a recommendation card (any of the 5 fragrance picks).

**What it means:** The user showed interest in a specific recommendation (e.g. to look it up or buy it). Used for engagement and, for sponsored cards, for billing.

**Payload:** `{ recommendationId, name, brand, isSponsored, pageContext }` — which card and where it was shown.

**Where it’s fired:** `RecommendationCard` on click. Sponsored clicks are also sent to `recommendation_clicks` for monetization.

---

### 5. **result_shared**

**When it’s recorded:** When the user successfully shares the results—either via the device’s share sheet or by copying the link.

**What it means:** The user chose to share their Scent DNA results (e.g. with a friend or on social). Useful for measuring viral or referral behavior.

**Payload:** `{ method: "native_share" | "copy" }` — how they shared (share dialog vs copy link).

**Where it’s fired:** `ShareResults` component after a successful `navigator.share()` or `navigator.clipboard.writeText()`.

---

## How it’s implemented

- **Client:** `trackEvent(eventType, payload)` in `src/lib/events.ts` sends a POST to `/api/events`.
- **API:** `POST /api/events` checks `eventType`, then inserts one row into `app_events` with optional `user_id` from auth and the given `payload`.
- **Database:** Table `app_events` (see `supabase/schema-mvp.sql`). RLS allows insert for everyone; only backend/admin should read.

To add a new event type later: add the type to `ALLOWED_EVENT_TYPES` in the API route and to `AppEventType` in `src/lib/events.ts`, then call `trackEvent(...)` from the right place.
