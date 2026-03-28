-- =============================================================================
-- Migration: Align public.fragrances with app expectations
-- App source: src/lib/fragrancesFromSupabase.ts (select list + rowToCatalog)
--
-- What this does:
--   1) Full-row backup (for recovery; see rollback notes at bottom)
--   2) ADD COLUMN IF NOT EXISTS for any missing app columns
--   3) Convert notes from text → jsonb safely (skips if already jsonb/json)
--   4) Backfill brand, gender, occasions, price_tier, style_cluster, notes
--   5) Optional validation queries at end (run manually)
--
-- Safe to run on: schema from supabase/schema-mvp.sql (minimal fragrances)
-- Idempotent-ish: ADD COLUMN IF NOT EXISTS; backfills use WHERE ... IS NULL
--
-- Do NOT run blindly on production without a Supabase backup / maintenance window.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0) Preconditions (manual check)
-- -----------------------------------------------------------------------------
-- Ensure public.brands exists and every fragrances.brand_id references it.
-- SELECT f.id FROM public.fragrances f
-- LEFT JOIN public.brands b ON b.id = f.brand_id WHERE b.id IS NULL;


-- -----------------------------------------------------------------------------
-- 1) Full-row backup (strongly recommended before ALTER)
-- -----------------------------------------------------------------------------
-- Preserves the exact pre-migration row shape for manual recovery.
-- Guard: if backup already exists, STOP — so a second run does not replace a
-- pre-migration snapshot with already-migrated data. Drop or rename the backup
-- only if you intentionally re-apply this script.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'fragrances__backup_pre_migration'
      AND c.relkind = 'r'
  ) THEN
    RAISE EXCEPTION
      'public.fragrances__backup_pre_migration already exists. Rename/drop it if you need to re-run this migration, or skip section 1.';
  END IF;
END $$;

CREATE TABLE public.fragrances__backup_pre_migration AS
TABLE public.fragrances WITH DATA;

COMMENT ON TABLE public.fragrances__backup_pre_migration IS
  'Snapshot of public.fragrances before align_fragrances_with_app migration. Used for recovery only; safe to DROP after verification.';


-- -----------------------------------------------------------------------------
-- 2) Helper: convert legacy text (or JSON array string) to jsonb for `notes`
-- -----------------------------------------------------------------------------
-- Rules:
--   NULL → NULL
--   '' / whitespace-only → '[]'::jsonb
--   If trimmed value starts with '[' → try ::jsonb; on failure → wrap as single string array
--   Else → treat as plain copy line → jsonb_build_array(trim)

CREATE OR REPLACE FUNCTION public._fragrances_notes_text_to_jsonb(t text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF t IS NULL THEN
    RETURN NULL;
  END IF;
  IF trim(t) = '' THEN
    RETURN '[]'::jsonb;
  END IF;
  IF left(trim(t), 1) = '[' THEN
    BEGIN
      RETURN t::jsonb;
    EXCEPTION
      WHEN invalid_text_representation THEN
        RETURN jsonb_build_array(trim(t));
      WHEN others THEN
        RETURN jsonb_build_array(trim(t));
    END;
  END IF;
  RETURN jsonb_build_array(trim(t));
END;
$$;


-- -----------------------------------------------------------------------------
-- 3) Add missing columns (nullable; no data loss)
-- -----------------------------------------------------------------------------
-- Matches app SELECT:
--   id, brand_id, name, brand, gender, notes, accords, seasons, occasions,
--   vibe, price_tier, longevity, projection, style_cluster

ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS accords jsonb;
ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS seasons jsonb;
ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS occasions jsonb;
ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS vibe text;
ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS price_tier text;
ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS longevity text;
ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS projection text;
ALTER TABLE public.fragrances ADD COLUMN IF NOT EXISTS style_cluster text;


-- -----------------------------------------------------------------------------
-- 4) Convert `notes` to jsonb if it is still text/varchar (safest in-place path)
-- -----------------------------------------------------------------------------
-- If `notes` is already jsonb or json, this block skips conversion.

DO $$
DECLARE
  dt text;
BEGIN
  SELECT c.data_type::text INTO dt
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'fragrances'
    AND c.column_name = 'notes';

  IF dt IS NULL THEN
    RAISE EXCEPTION 'public.fragrances.notes column not found';
  END IF;

  IF dt IN ('text', 'character varying', 'character') THEN
    ALTER TABLE public.fragrances
      ALTER COLUMN notes TYPE jsonb
      USING public._fragrances_notes_text_to_jsonb(notes::text);
    RAISE NOTICE 'notes: converted from % to jsonb', dt;

  ELSIF dt = 'json' THEN
    ALTER TABLE public.fragrances
      ALTER COLUMN notes TYPE jsonb
      USING (notes::jsonb);
    RAISE NOTICE 'notes: converted from json to jsonb';

  ELSIF dt = 'jsonb' THEN
    RAISE NOTICE 'notes: already jsonb — skipped conversion';

  ELSE
    RAISE NOTICE 'notes: unexpected type % — no automatic conversion; review manually', dt;
  END IF;
END $$;


-- -----------------------------------------------------------------------------
-- 5) If accords / seasons / occasions were ever created as text, coerce to jsonb
--    (Skip error if column does not exist or is already jsonb.)
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  dt text;
BEGIN
  SELECT c.data_type::text INTO dt
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'fragrances'
    AND c.column_name = 'accords';

  IF dt IN ('text', 'character varying', 'character') THEN
    ALTER TABLE public.fragrances
      ALTER COLUMN accords TYPE jsonb
      USING (
        CASE
          WHEN accords IS NULL THEN NULL
          WHEN trim(accords::text) = '' THEN NULL
          WHEN left(trim(accords::text), 1) = '[' THEN accords::jsonb
          ELSE jsonb_build_array(trim(accords::text))
        END
      );
  END IF;
END $$;

DO $$
DECLARE
  dt text;
BEGIN
  SELECT c.data_type::text INTO dt
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'fragrances'
    AND c.column_name = 'seasons';

  IF dt IN ('text', 'character varying', 'character') THEN
    ALTER TABLE public.fragrances
      ALTER COLUMN seasons TYPE jsonb
      USING (
        CASE
          WHEN seasons IS NULL THEN NULL
          WHEN trim(seasons::text) = '' THEN NULL
          WHEN left(trim(seasons::text), 1) = '[' THEN seasons::jsonb
          ELSE jsonb_build_array(trim(seasons::text))
        END
      );
  END IF;
END $$;

DO $$
DECLARE
  dt text;
BEGIN
  SELECT c.data_type::text INTO dt
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'fragrances'
    AND c.column_name = 'occasions';

  IF dt IN ('text', 'character varying', 'character') THEN
    ALTER TABLE public.fragrances
      ALTER COLUMN occasions TYPE jsonb
      USING (
        CASE
          WHEN occasions IS NULL THEN NULL
          WHEN trim(occasions::text) = '' THEN NULL
          WHEN left(trim(occasions::text), 1) = '[' THEN occasions::jsonb
          ELSE jsonb_build_array(trim(occasions::text))
        END
      );
  END IF;
END $$;


-- -----------------------------------------------------------------------------
-- 6) Backfill: brand from public.brands
-- -----------------------------------------------------------------------------

UPDATE public.fragrances f
SET brand = b.name
FROM public.brands b
WHERE f.brand_id = b.id
  AND (f.brand IS NULL OR trim(f.brand) = '');


-- -----------------------------------------------------------------------------
-- 7) Backfill: gender (app defaults to unisex when missing/invalid)
-- -----------------------------------------------------------------------------

UPDATE public.fragrances
SET gender = 'unisex'
WHERE gender IS NULL OR trim(gender) = '';


-- -----------------------------------------------------------------------------
-- 8) Backfill: occasions — explicit default the app mirrors when empty
--     (parseJsonArray empty → ["casual"] in rowToCatalog)
-- -----------------------------------------------------------------------------

UPDATE public.fragrances
SET occasions = '["casual"]'::jsonb
WHERE occasions IS NULL
   OR occasions = 'null'::jsonb
   OR occasions = '[]'::jsonb;


-- -----------------------------------------------------------------------------
-- 9) Backfill: price_tier and style_cluster defaults (match TS fallbacks)
-- -----------------------------------------------------------------------------

UPDATE public.fragrances
SET price_tier = 'designer'
WHERE price_tier IS NULL OR trim(price_tier) = '';

UPDATE public.fragrances
SET style_cluster = 'daily-office'
WHERE style_cluster IS NULL OR trim(style_cluster) = '';


-- -----------------------------------------------------------------------------
-- 10) Backfill: notes from legacy `category` when notes is empty
--      (App does not SELECT category; deriveCategory uses notes + accords.)
--      Only runs if `category` column exists (schema-mvp includes it).
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fragrances'
      AND column_name = 'category'
  ) THEN
    UPDATE public.fragrances f
    SET notes = jsonb_build_array(coalesce(nullif(trim(f.category), ''), 'General'))
    WHERE (
        f.notes IS NULL
        OR f.notes = '[]'::jsonb
        OR (jsonb_typeof(f.notes) = 'array' AND jsonb_array_length(f.notes) = 0)
      )
      AND f.category IS NOT NULL
      AND nullif(trim(f.category), '') IS NOT NULL;
  END IF;
END $$;


-- -----------------------------------------------------------------------------
-- 11) Drop helper (avoid leaving public API surface)
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public._fragrances_notes_text_to_jsonb(text);


-- -----------------------------------------------------------------------------
-- 12) Comments on columns (documentation in DB)
-- -----------------------------------------------------------------------------

COMMENT ON COLUMN public.fragrances.brand IS 'Denormalized brand label; app uses for display and scoring.';
COMMENT ON COLUMN public.fragrances.gender IS 'masculine | feminine | unisex';
COMMENT ON COLUMN public.fragrances.notes IS 'JSON array of short note strings; drives derived category in app.';
COMMENT ON COLUMN public.fragrances.accords IS 'JSON array of accord tokens.';
COMMENT ON COLUMN public.fragrances.seasons IS 'JSON array of season tags.';
COMMENT ON COLUMN public.fragrances.occasions IS 'JSON array: office, casual, date, formal, summer, evening';
COMMENT ON COLUMN public.fragrances.price_tier IS 'budget | designer | luxury | niche | ultra-niche';
COMMENT ON COLUMN public.fragrances.style_cluster IS 'fresh-clean | sweet-gourmand | dark-woody | spicy-oriental | luxury-niche | daily-office | date-night';


-- =============================================================================
-- VALIDATION QUERIES (run after migration; expect 0 rows on “problem” checks)
-- =============================================================================
--
-- V1 — App column presence & types
-- ----------------------------
-- SELECT column_name, data_type, udt_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'fragrances'
-- ORDER BY ordinal_position;
--
-- Expect: notes, accords, seasons, occasions → jsonb (udt_name jsonb)
--
-- V2 — Rows missing brand text after backfill
-- ----------------------------
-- SELECT id, name, brand_id, brand FROM public.fragrances
-- WHERE brand IS NULL OR trim(brand) = '';
--
-- V3 — Invalid gender (optional tightening later)
-- ----------------------------
-- SELECT id, name, gender FROM public.fragrances
-- WHERE gender IS NOT NULL
--   AND lower(trim(gender)) NOT IN ('masculine','feminine','unisex');
--
-- V4 — notes must be JSON array or null
-- ----------------------------
-- SELECT id, name, notes FROM public.fragrances
-- WHERE notes IS NOT NULL AND jsonb_typeof(notes) <> 'array';
--
-- V5 — accords/seasons/occasions: if set, must be arrays
-- ----------------------------
-- SELECT id, name, accords FROM public.fragrances
-- WHERE accords IS NOT NULL AND jsonb_typeof(accords) <> 'array';
--
-- SELECT id, name, seasons FROM public.fragrances
-- WHERE seasons IS NOT NULL AND jsonb_typeof(seasons) <> 'array';
--
-- SELECT id, name, occasions FROM public.fragrances
-- WHERE occasions IS NOT NULL AND jsonb_typeof(occasions) <> 'array';
--
-- V6 — Spot-check PostgREST shape (what the JS client receives)
-- ----------------------------
-- SELECT id, brand_id, name, brand, gender, notes, accords, seasons, occasions,
--        vibe, price_tier, longevity, projection, style_cluster
-- FROM public.fragrances
-- LIMIT 5;
--
-- =============================================================================
-- CAUTIOUS ROLLBACK STRATEGY
-- =============================================================================
--
-- This migration is additive + type change on `notes` (and possibly accords/
-- seasons/occasions). Full automatic rollback is not trivial if you already
-- inserted new rows post-migration.
--
-- Option A — Point-in-time recovery (best for production)
--   Use Supabase Dashboard → Database → Backups / PITR if available.
--
-- Option B — Restore from public.fragrances__backup_pre_migration
--   Only safe if:
--     - No new fragrances were added after migration, OR
--     - You merge new rows manually.
--   Steps (DESTRUCTIVE to current table contents):
--     1) Disconnect app / block traffic.
--     2) Save a copy of current table if you need to merge:
--        CREATE TABLE public.fragrances__failed_migration AS TABLE public.fragrances;
--     3) Truncate and restore column-compatible insert:
--        -- You must match OLD column list from backup. Example for MVP shape:
--        TRUNCATE public.fragrances RESTART IDENTITY CASCADE;  -- CASCADE only if FKs allow
--        INSERT INTO public.fragrances (id, brand_id, name, category, notes, created_at)
--        SELECT id, brand_id, name, category,
--               notes,  -- if backup has text notes; if backup captured post-jsonb, cast notes::text
--               created_at
--        FROM public.fragrances__backup_pre_migration;
--     4) If `notes` in backup was already jsonb (re-run), use appropriate cast.
--
--   WARNING: TRUNCATE CASCADE may remove dependent rows in public.recommendations
--   or public.collection_items. Prefer restoring via Supabase backup or:
--     DELETE FROM public.fragrances WHERE ... ;
--     INSERT ... SELECT ... FROM backup;
--
-- Option C — Roll forward instead of back
--   Fix bad rows with SQL updates; keep migrated schema (recommended).
--
-- After successful verification, you may:
--   DROP TABLE IF EXISTS public.fragrances__backup_pre_migration;
--
-- =============================================================================
