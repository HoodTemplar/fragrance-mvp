# Scent DNA

A web app that lets users upload a photo of their fragrance collection or take a quiz, then see a collection score, scent profile, strengths, weaknesses, and personalized recommendations.

---

## What You Need Before Starting

1. **Node.js** – The app runs on Node. If you don’t have it:
   - Go to [https://nodejs.org](https://nodejs.org)
   - Download the “LTS” version and install it (default options are fine).

2. **A terminal** – On Mac: open “Terminal” from Applications → Utilities. On Windows: use “Command Prompt” or “PowerShell.”

---

## Step 1: Install Dependencies

Open your terminal, go to the project folder, and run the install command.

**What to do:**

1. In the terminal, type:
   ```bash
   cd "/Users/t/Desktop/Fragrance MVP"
   ```
   Press Enter. (This moves you into the project folder.)

2. Then type:
   ```bash
   npm install
   ```
   Press Enter. Wait until it finishes (it may take a minute). When you see something like “added 200 packages,” you’re done.

---

## Step 2: Run the App on Your Computer

**What to do:**

1. In the same terminal (still in the project folder), type:
   ```bash
   npm run dev
   ```
   Press Enter.

2. When you see something like “Ready in 2s” and a line that says “Local: http://localhost:3000”, the app is running.

3. Open your web browser (Chrome, Safari, etc.) and go to:
   ```text
   http://localhost:3000
   ```
   You should see the Scent DNA home page.

**To stop the app:** In the terminal, press `Ctrl + C` (or `Cmd + C` on Mac).

---

## What Each Page Does

| Page            | URL                 | What it’s for |
|-----------------|---------------------|----------------|
| Home            | `/`                 | Branding and two buttons: “Upload collection” and “Take the quiz”. |
| Upload          | `/upload`           | User picks a photo of their fragrance collection. MVP: we don’t analyze the image yet; we send them to Results with fake data. |
| Results         | `/results`          | Shows collection score, scent profile, strengths, weaknesses, missing categories, 5 recommended fragrances, layering ideas, and when to wear. All data is mock for MVP. |
| Quiz            | `/quiz`             | 12 questions about scent preferences. At the end, user goes to Recommendations. |
| Recommendations | `/recommendations`  | Shows personalized fragrance picks. If they came from the quiz, we show quiz-based mock recommendations; otherwise collection-based. |
| Profile         | `/profile`          | Placeholder for “saved results.” MVP shows sample saved items; later this will use real sign-in and Supabase. |
| Admin           | `/admin`            | Placeholder for future admin (e.g. sponsored recommendations). Not in the main nav; you can open it by typing `/admin` in the address bar. |

---

## Folder Structure (Simple Overview)

- **`src/app/`** – One folder per page. The name of the folder is the URL path.
  - `page.tsx` inside a folder = that route’s main content (e.g. `src/app/upload/page.tsx` = Upload page).
- **`src/components/`** – Reusable pieces (e.g. the top navigation bar `Nav.tsx`).
- **`src/lib/`** – Shared code: mock data and the Supabase client (for when you add a database).
- **`src/types/`** – TypeScript types used across the app (results, quiz, etc.).
- **`src/data/`** – Static data (e.g. quiz questions).

Every important file has a short comment at the top explaining what it does in plain English.

---

## Mock Data (MVP)

Right now the app does **not** call any real AI or database. All results are fake data so you can click through the full flow:

- **Collection results** – Defined in `src/lib/mockData.ts` as `MOCK_COLLECTION_RESULT`.
- **Quiz recommendations** – Defined in `src/lib/mockData.ts` as `MOCK_QUIZ_RESULT`.
- **Sponsored recommendations** – One of the 5 collection recommendations is marked “Sponsored” in the mock data. The list of sponsored IDs is in `SPONSORED_IDS` in the same file. When you add an admin and database, you’ll store “sponsored” in the DB and toggle it from the admin page.

---

## Deploying to Vercel

When you’re ready to put the app on the internet:

1. Push your project to **GitHub** (create a repo and upload this folder).
2. Go to [https://vercel.com](https://vercel.com) and sign in (GitHub login is easiest).
3. Click “Add New” → “Project” and import your GitHub repo.
4. Leave the default settings (Vercel will detect Next.js). Click “Deploy.”
5. When it’s done, Vercel gives you a URL like `your-project.vercel.app`. That’s your live app.

You don’t need to run `npm run build` yourself for this; Vercel runs it when you deploy.

---

## Adding Supabase Later (Database & Auth)

When you want real user accounts and saved results:

1. Create a project at [https://supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
3. In your project folder, copy the example env file and add your values:
   - Copy `.env.example` to a new file named `.env.local`.
   - Put in:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon public key
4. The app already has a Supabase client in `src/lib/supabase.ts`. It only connects if those two variables are set; until then the app runs without Supabase.

Never commit `.env.local` or put real keys in GitHub. The `.gitignore` already excludes `.env.local`.

---

## Quick Reference: Commands

| What you want to do     | Command          |
|-------------------------|------------------|
| Install dependencies    | `npm install`    |
| Run the app locally     | `npm run dev`    |
| Stop the app            | `Ctrl + C`       |
| Build for production    | `npm run build`  |
| Run production build   | `npm start`      |
| Run the linter          | `npm run lint`   |

---

## Summary

- **Run locally:** `cd` into the project → `npm install` → `npm run dev` → open **http://localhost:3000**.
- **Click through:** Home → Upload (choose any image) → Results; or Home → Quiz → Recommendations.
- **Mock data:** All results and recommendations come from `src/lib/mockData.ts`.
- **Admin:** Open **http://localhost:3000/admin** for the placeholder admin page.
- **Deploy:** Connect the repo to Vercel and deploy; add Supabase and `.env.local` when you’re ready for real data and auth.

If something doesn’t work, check that you’re in the correct folder when you run `npm install` and `npm run dev`, and that Node.js is installed (`node -v` in the terminal should show a version number).
