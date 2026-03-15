-- =============================================================================
-- Scent DNA – MVP database schema
-- Run this in Supabase: SQL Editor → New query → paste all → Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USERS
-- One row per person using the app. Links to Supabase Auth (auth.users).
-- Holds display name and email so you don’t have to read from auth every time.
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid references auth.users (id) on delete cascade primary key,
  email text,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can view own row"
  on public.users for select using (auth.uid() = id);
create policy "Users can update own row"
  on public.users for update using (auth.uid() = id);
create policy "Users can insert own row"
  on public.users for insert with check (auth.uid() = id);

-- Auto-create a users row when someone signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. BRANDS
-- Perfume houses (e.g. Chanel, Hermès). Fragrances belong to a brand.
-- -----------------------------------------------------------------------------
create table if not exists public.brands (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamptz default now()
);

alter table public.brands enable row level security;

-- MVP: anyone can read brands (for dropdowns, search)
create policy "Anyone can read brands"
  on public.brands for select using (true);

-- -----------------------------------------------------------------------------
-- 3. FRAGRANCES
-- Individual perfumes. Each has a brand and category (e.g. Woody, Fresh).
-- Used for recommendations and for tagging what’s in a collection.
-- -----------------------------------------------------------------------------
create table if not exists public.fragrances (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands (id) on delete restrict not null,
  name text not null,
  category text,
  notes text,
  created_at timestamptz default now()
);

alter table public.fragrances enable row level security;

create policy "Anyone can read fragrances"
  on public.fragrances for select using (true);

-- -----------------------------------------------------------------------------
-- 4. COLLECTION_UPLOADS
-- One row per photo the user uploads of their collection.
-- storage_path = path in Supabase Storage (e.g. user_id/123.jpg).
-- -----------------------------------------------------------------------------
create table if not exists public.collection_uploads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users (id) on delete cascade not null,
  storage_path text not null,
  created_at timestamptz default now()
);

alter table public.collection_uploads enable row level security;

create policy "Users can manage own collection_uploads"
  on public.collection_uploads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. COLLECTION_ITEMS
-- One row per bottle (or item) in a collection photo.
-- Links an upload to a fragrance (if we identified it) or a custom label.
-- -----------------------------------------------------------------------------
create table if not exists public.collection_items (
  id uuid default gen_random_uuid() primary key,
  upload_id uuid references public.collection_uploads (id) on delete cascade not null,
  fragrance_id uuid references public.fragrances (id) on delete set null,
  custom_label text,
  quantity int default 1,
  created_at timestamptz default now()
);

alter table public.collection_items enable row level security;

create policy "Users can manage collection_items for own uploads"
  on public.collection_items for all
  using (
    exists (
      select 1 from public.collection_uploads u
      where u.id = upload_id and u.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.collection_uploads u
      where u.id = upload_id and u.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 6. QUIZ_ANSWERS
-- One row per answer in a quiz. session_id groups answers from one quiz run.
-- question_id = e.g. "q1", "q2". answer_value = the option they picked.
-- -----------------------------------------------------------------------------
create table if not exists public.quiz_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users (id) on delete cascade not null,
  session_id uuid not null,
  question_id text not null,
  answer_value text not null,
  created_at timestamptz default now()
);

alter table public.quiz_answers enable row level security;

create policy "Users can manage own quiz_answers"
  on public.quiz_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. ANALYSES
-- One row per “result” (from a collection photo or from a quiz).
-- source = 'collection' or 'quiz'. result_data = full JSON (score, profile, etc.).
-- -----------------------------------------------------------------------------
create table if not exists public.analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users (id) on delete cascade not null,
  source text not null check (source in ('collection', 'quiz')),
  upload_id uuid references public.collection_uploads (id) on delete set null,
  quiz_session_id uuid,
  result_data jsonb not null,
  created_at timestamptz default now()
);

alter table public.analyses enable row level security;

create policy "Users can manage own analyses"
  on public.analyses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. RECOMMENDATIONS
-- One row per recommended fragrance for an analysis.
-- rank_order = 1, 2, 3… so you can show “top 5” in order.
-- -----------------------------------------------------------------------------
create table if not exists public.recommendations (
  id uuid default gen_random_uuid() primary key,
  analysis_id uuid references public.analyses (id) on delete cascade not null,
  fragrance_id uuid references public.fragrances (id) on delete cascade not null,
  reason text,
  rank_order int not null,
  created_at timestamptz default now()
);

alter table public.recommendations enable row level security;

create policy "Users can read recommendations for own analyses"
  on public.recommendations for select
  using (
    exists (
      select 1 from public.analyses a
      where a.id = analysis_id and a.user_id = auth.uid()
    )
  );

create policy "Users can insert recommendations for own analyses"
  on public.recommendations for insert
  with check (
    exists (
      select 1 from public.analyses a
      where a.id = analysis_id and a.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 9. SPONSORED_SLOTS (for future monetization)
-- One row per sponsored recommendation slot. Brands can be added here later.
-- When is_active = true and within starts_at/ends_at, the app can show this
-- as a sponsored card. Not used until you turn on ads.
-- -----------------------------------------------------------------------------
create table if not exists public.sponsored_slots (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands (id) on delete restrict,
  fragrance_id uuid references public.fragrances (id) on delete restrict,
  campaign_name text,
  is_active boolean default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.sponsored_slots enable row level security;

-- MVP: only service role / admin can manage. For now no policy = no access from anon.
-- When you add an admin dashboard, use service role or a dedicated admin policy.

comment on table public.sponsored_slots is 'Sponsored recommendation slots for future monetization. Add brands here when ready.';

-- -----------------------------------------------------------------------------
-- 10. RECOMMENDATION_CLICKS (for future monetization)
-- One row per click on a recommendation card. Used to track sponsored clicks
-- for billing and to measure organic engagement. No ads yet = table ready for later.
-- -----------------------------------------------------------------------------
create table if not exists public.recommendation_clicks (
  id uuid default gen_random_uuid() primary key,
  sponsored_slot_id uuid references public.sponsored_slots (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  page_context text not null,
  clicked_at timestamptz default now()
);

alter table public.recommendation_clicks enable row level security;

-- Allow inserts from the app (e.g. API route with service role or anon + trigger).
-- For MVP we allow anon insert so the track-click API can record without auth.
create policy "Allow insert recommendation_clicks"
  on public.recommendation_clicks for insert
  with check (true);

-- Only admins / service can read (for reporting). No select for anon/users.
comment on table public.recommendation_clicks is 'Tracks clicks on recommendation cards. sponsored_slot_id set = sponsored click for billing.';

-- -----------------------------------------------------------------------------
-- 11. APP_EVENTS (simple event tracking for MVP)
-- One row per tracked event: image_uploaded, quiz_completed, recommendation_viewed,
-- recommendation_clicked, result_shared. payload = optional JSON for context.
-- -----------------------------------------------------------------------------
create table if not exists public.app_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users (id) on delete set null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz default now()
);

alter table public.app_events enable row level security;

create policy "Allow insert app_events"
  on public.app_events for insert
  with check (true);

comment on table public.app_events is 'Simple event tracking: image_uploaded, quiz_completed, recommendation_viewed, recommendation_clicked, result_shared.';
