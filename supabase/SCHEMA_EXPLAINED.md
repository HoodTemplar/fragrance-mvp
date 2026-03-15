# MVP schema – what each table is for

Plain-English explanation of the Scent DNA database tables.

---

## 1. **users**

**What it is:** One row per person using the app.

**Why:** Supabase Auth already has sign-in (auth.users). This table holds **app-specific** info (e.g. display name, email copy) so you don’t have to hit Auth every time. Each row is tied to one Auth user by `id`.

**Main columns:** `id` (same as Auth user), `email`, `display_name`, `created_at`.

---

## 2. **brands**

**What it is:** Perfume houses (e.g. Chanel, Hermès, Byredo).

**Why:** Fragrances belong to a brand. You use this for dropdowns, search, and showing “Brand – Name” on recommendations.

**Main columns:** `id`, `name`, `created_at`.

---

## 3. **fragrances**

**What it is:** Individual perfumes.

**Why:** This is your catalog: each perfume has a brand, a name, a category (e.g. Woody, Fresh), and optional notes. Used for recommendations and for tagging what’s in a user’s collection.

**Main columns:** `id`, `brand_id` (links to brands), `name`, `category`, `notes`, `created_at`.

---

## 4. **collection_uploads**

**What it is:** One row per photo a user uploads of their collection.

**Why:** When someone uploads a photo, you store the file in Storage and create a row here with the Storage path. Later you can link “items” or “analyses” to this upload.

**Main columns:** `id`, `user_id`, `storage_path`, `created_at`.

---

## 5. **collection_items**

**What it is:** One row per bottle (or item) in a collection photo.

**Why:** After you analyze a photo, you might identify bottles. Each identified (or guessed) bottle is a row: linked to the upload, and optionally to a `fragrance` (if matched) or just a `custom_label` if unknown.

**Main columns:** `id`, `upload_id`, `fragrance_id` (optional), `custom_label` (optional), `quantity`, `created_at`.

---

## 6. **quiz_answers**

**What it is:** One row per answer the user gives in the scent quiz.

**Why:** You need to store “user X answered question q3 with ‘woody’.” `session_id` groups all answers from one quiz run so you can tell which answers belong together.

**Main columns:** `id`, `user_id`, `session_id`, `question_id` (e.g. "q1"), `answer_value`, `created_at`.

---

## 7. **analyses**

**What it is:** One row per “result” you show the user (from a collection photo or from the quiz).

**Why:** When you analyze a collection or a quiz, you get a score, scent profile, strengths, etc. You store that whole result as JSON in `result_data`. `source` says whether it came from a `collection` upload or the `quiz`. Optional `upload_id` or `quiz_session_id` links back to the source.

**Main columns:** `id`, `user_id`, `source` ('collection' | 'quiz'), `upload_id`, `quiz_session_id`, `result_data` (JSON), `created_at`.

---

## 8. **recommendations**

**What it is:** One row per fragrance you recommend for a given analysis.

**Why:** Each analysis can have several recommendations. Each row is “for this analysis, recommend this fragrance, for this reason, at this rank.” `rank_order` (1, 2, 3…) lets you show “top 5” in order.

**Main columns:** `id`, `analysis_id`, `fragrance_id`, `reason`, `rank_order`, `created_at`.

---

## How they connect

- **users** – central; everything that’s “per user” points here (or to `auth.users` via `users.id`).
- **brands** → **fragrances** (each fragrance has one brand).
- **collection_uploads** → **users**; **collection_items** → **collection_uploads** and optionally **fragrances**.
- **quiz_answers** → **users** (and grouped by `session_id`).
- **analyses** → **users**, and optionally **collection_uploads** or a quiz session.
- **recommendations** → **analyses** and **fragrances**.

Run the SQL in `schema-mvp.sql` in the Supabase SQL Editor to create all tables and policies.
