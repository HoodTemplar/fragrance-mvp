# How to connect Scent DNA to Supabase

This guide tells you exactly what to click and what to copy so your app can use Supabase for login, database, and photo storage.

---

## What you need

- A Supabase account (free at [supabase.com](https://supabase.com)).
- This project open in your editor.

---

## Step 1: Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **“New project”**.
3. Choose your organization (or create one).
4. Fill in:
   - **Name:** e.g. `scent-dna`
   - **Database password:** choose a strong password and **save it somewhere safe** (you need it for the database).
   - **Region:** pick one close to you.
5. Click **“Create new project”** and wait until it says the project is ready (a minute or two).

---

## Step 2: Get your URL and anon key (for the app)

1. In the Supabase dashboard, open your project.
2. In the left sidebar, click **“Project Settings”** (gear icon at the bottom).
3. Click **“API”** in the left menu under Project Settings.
4. On the API page you’ll see:
   - **Project URL** — something like `https://abcdefghijklmnop.supabase.co`
   - **Project API keys** — a section with “anon” and “service_role” keys.

5. Copy these two values:
   - **Project URL**  
   - **anon public** key (the long string under “anon” — this is safe to use in the browser).

---

## Step 3: Paste them into your project

1. In your project folder, find the file named **`.env.example`**.
2. **Copy** the whole file (all of it).
3. Create a **new** file in the **same folder** as `.env.example` (the project root, where `package.json` is).
4. Name this new file exactly: **`.env.local`**
5. **Paste** the contents of `.env.example` into `.env.local`.
6. In **`.env.local`**, fill in the values:
   - After `NEXT_PUBLIC_SUPABASE_URL=` paste your **Project URL** (no quotes needed).
   - After `NEXT_PUBLIC_SUPABASE_ANON_KEY=` paste your **anon public** key (no quotes needed).

Example (your values will be different):

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

7. Save the file.  
   Do **not** commit `.env.local` to Git (it’s already in `.gitignore`).

---

## Step 4: Turn on Email auth (for sign up / log in)

1. In the Supabase dashboard, go to **Authentication** → **Providers** (in the left sidebar).
2. Click **“Email”**.
3. Make sure **“Enable Email provider”** is **ON**.
4. (Optional) If you want users to confirm their email before signing in, turn **“Confirm email”** ON. For testing you can leave it OFF so sign-up works immediately.
5. Click **“Save”**.

---

## Step 5: Create the database tables and storage

1. In the left sidebar, click **“SQL Editor”**.
2. Click **“New query”**.
3. Open the file **`supabase/schema.sql`** from this project in your editor.
4. **Copy** the entire contents of `supabase/schema.sql`.
5. **Paste** into the Supabase SQL Editor.
6. Click **“Run”** (or press Ctrl/Cmd + Enter).
7. You should see “Success. No rows returned” or similar. That creates:
   - `profiles` table  
   - `saved_results` table  
   - `uploads` table  
   - The **fragrance-photos** storage bucket and policies so users can only access their own photos.

If you get an error about the storage bucket, you can create it manually:

1. Go to **Storage** in the left sidebar.
2. Click **“New bucket”**.
3. Name: **`fragrance-photos`**
4. Leave “Public bucket” **off** (private is fine; the app uses the user’s session to read).
5. Click **“Create bucket”**.
6. Then in **SQL Editor**, run only the storage policy part of `schema.sql` (the part that starts with `create policy "Users can upload own fragrance photos"`), or ask for help with the exact SQL for your Supabase version.

---

## Step 6: Run the app and test

1. In the project folder, in the terminal, run:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.
3. Try **Sign up** (top right) with an email and password.
4. Try **Upload** → choose a photo → **Analyze collection** (photo is stored in Supabase if you’re logged in).
5. Go to **Results** or **Recommendations** and click **“Save to profile”**.
6. Open **Profile** — you should see your saved result from the database.

---

## Where each value comes from (quick reference)

| What you need              | Where to get it in Supabase                          |
|---------------------------|------------------------------------------------------|
| Project URL               | Project Settings → API → Project URL                  |
| Anon key                  | Project Settings → API → Project API keys → anon public |

| What you paste it into    |
|---------------------------|
| `.env.local` → `NEXT_PUBLIC_SUPABASE_URL` |
| `.env.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

---

## If something doesn’t work

- **“Missing NEXT_PUBLIC_SUPABASE_URL…”**  
  You’re not in the project root, or `.env.local` is missing or has the wrong variable names. Check that the file is named exactly `.env.local` and is next to `package.json`.

- **Sign up / log in errors**  
  In Supabase: Authentication → Providers → Email → make sure the Email provider is enabled.

- **Upload fails**  
  Make sure you ran the full `supabase/schema.sql` (including the storage bucket and policies), or created the **fragrance-photos** bucket and policies as in Step 5.

- **Save to profile doesn’t show on Profile**  
  Make sure you’re logged in and that the `saved_results` table was created (run `supabase/schema.sql`).

After changing `.env.local`, restart the dev server (`Ctrl+C`, then `npm run dev` again).
