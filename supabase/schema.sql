-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- This creates tables for profiles and saved results.

-- Optional: extend auth.users with a public profile (name, avatar, etc.)
create table if not exists public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS so users only see their own row
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Table for saved collection/quiz results
create table if not exists public.saved_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users (id) on delete cascade not null,
  type text not null check (type in ('collection', 'quiz')),
  data jsonb not null,
  created_at timestamptz default now()
);

alter table public.saved_results enable row level security;

create policy "Users can view own saved results"
  on public.saved_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved results"
  on public.saved_results for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved results"
  on public.saved_results for delete
  using (auth.uid() = user_id);

-- Optional: table to link uploads to users (storage path, created_at)
create table if not exists public.uploads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users (id) on delete cascade not null,
  storage_path text not null,
  created_at timestamptz default now()
);

alter table public.uploads enable row level security;

create policy "Users can view own uploads"
  on public.uploads for select
  using (auth.uid() = user_id);

create policy "Users can insert own uploads"
  on public.uploads for insert
  with check (auth.uid() = user_id);

-- Storage: allow authenticated users to upload to their own folder in fragrance-photos
-- (Create the bucket "fragrance-photos" in Dashboard → Storage first, then run this.)
insert into storage.buckets (id, name, public)
values ('fragrance-photos', 'fragrance-photos', false)
on conflict (id) do nothing;

create policy "Users can upload own fragrance photos"
  on storage.objects for insert
  with check (
    bucket_id = 'fragrance-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own fragrance photos"
  on storage.objects for select
  using (
    bucket_id = 'fragrance-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own fragrance photos"
  on storage.objects for delete
  using (
    bucket_id = 'fragrance-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
