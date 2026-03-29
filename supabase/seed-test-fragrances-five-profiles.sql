-- =============================================================================
-- Five high-quality test fragrances (full columns) for recommendation QA
-- Requires: public.brands populated (see seed-fragrances.sql brand list)
-- Table shape: align_fragrances_with_app migration + MVP base columns
--
-- Run after: brands seed + fragrances table has jsonb notes/accords/seasons/occasions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Clean professional fresh — tests: daily/office style_cluster, fresh accords,
--    moderate projection, office/casual occasions, vibe synonyms ("polished"/clean).
-- -----------------------------------------------------------------------------
INSERT INTO public.fragrances (
  id,
  brand_id,
  name,
  brand,
  gender,
  notes,
  accords,
  seasons,
  occasions,
  vibe,
  price_tier,
  longevity,
  projection,
  style_cluster
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.brands WHERE name = 'Prada' LIMIT 1),
  'L''Homme L''Eau (Test QA)',
  'Prada',
  'masculine',
  '["clean iris soap", "soft amber", "neroli lift"]'::jsonb,
  '["neroli", "iris", "amber", "white musk", "powdery", "citrus", "woody", "clean"]'::jsonb,
  '["spring", "summer", "fall"]'::jsonb,
  '["office", "casual", "formal"]'::jsonb,
  'polished',
  'luxury',
  'moderate',
  'moderate',
  'daily-office'
);

-- -----------------------------------------------------------------------------
-- 2) Dark woody seductive night — tests: date-night cluster, evening overlap,
--    oud/woody/spicy accords, vibe "mysterious", longevity/projection vs user prefs.
-- -----------------------------------------------------------------------------
INSERT INTO public.fragrances (
  id,
  brand_id,
  name,
  brand,
  gender,
  notes,
  accords,
  seasons,
  occasions,
  vibe,
  price_tier,
  longevity,
  projection,
  style_cluster
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.brands WHERE name = 'Tom Ford' LIMIT 1),
  'Oud Wood (Test QA)',
  'Tom Ford',
  'masculine',
  '["oud heart", "rosewood", "spiced cardamom"]'::jsonb,
  '["oud", "woody", "spicy", "cardamom", "sandalwood", "vanilla", "amber", "leather", "incense"]'::jsonb,
  '["fall", "winter"]'::jsonb,
  '["date", "evening", "formal"]'::jsonb,
  'mysterious',
  'luxury',
  'long',
  'moderate',
  'date-night'
);

-- -----------------------------------------------------------------------------
-- 3) Sweet gourmand cozy — tests: sweet-gourmand cluster, avoid-sweet penalties,
--    gourmand/vanilla accords, strong projection, warm vibe.
-- -----------------------------------------------------------------------------
INSERT INTO public.fragrances (
  id,
  brand_id,
  name,
  brand,
  gender,
  notes,
  accords,
  seasons,
  occasions,
  vibe,
  price_tier,
  longevity,
  projection,
  style_cluster
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.brands WHERE name = 'Mugler' LIMIT 1),
  'Angel (Test QA)',
  'Mugler',
  'feminine',
  '["patchouli-vanilla signature", "caramelized praline"]'::jsonb,
  '["patchouli", "vanilla", "gourmand", "sweet", "caramel", "chocolate", "oriental", "amber", "honey"]'::jsonb,
  '["fall", "winter"]'::jsonb,
  '["date", "evening", "casual"]'::jsonb,
  'warm',
  'designer',
  'long',
  'strong',
  'sweet-gourmand'
);

-- -----------------------------------------------------------------------------
-- 4) Elegant refined luxury — tests: timeless vibe, cross-season versatility,
--    designer/luxury tier, fresh-clean / vetiver-woody scoring, formal + office.
-- -----------------------------------------------------------------------------
INSERT INTO public.fragrances (
  id,
  brand_id,
  name,
  brand,
  gender,
  notes,
  accords,
  seasons,
  occasions,
  vibe,
  price_tier,
  longevity,
  projection,
  style_cluster
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.brands WHERE name = 'Hermès' LIMIT 1),
  'Terre d''Hermès (Test QA)',
  'Hermès',
  'masculine',
  '["flint mineral", "vetiver root", "bitter orange"]'::jsonb,
  '["citrus", "vetiver", "woody", "mineral", "flint", "pepper", "earthy", "geranium"]'::jsonb,
  '["spring", "summer", "fall", "winter"]'::jsonb,
  '["office", "formal", "date", "casual"]'::jsonb,
  'timeless',
  'luxury',
  'long',
  'moderate',
  'fresh-clean'
);

-- -----------------------------------------------------------------------------
-- 5) Bold niche spicy unique — tests: luxury-niche + niche price_tier, spicy-oriental
--    overlap, high projection, adventurous vibe, diversity vs designer picks.
-- -----------------------------------------------------------------------------
INSERT INTO public.fragrances (
  id,
  brand_id,
  name,
  brand,
  gender,
  notes,
  accords,
  seasons,
  occasions,
  vibe,
  price_tier,
  longevity,
  projection,
  style_cluster
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.brands WHERE name = 'Nishane' LIMIT 1),
  'Hacivat (Test QA)',
  'Nishane',
  'masculine',
  '["pineapple chypre", "oakmoss dry-down", "cedar spine"]'::jsonb,
  '["pineapple", "citrus", "woody", "oakmoss", "patchouli", "spicy", "aromatic", "vetiver", "bergamot"]'::jsonb,
  '["spring", "summer", "fall"]'::jsonb,
  '["office", "casual", "date", "evening"]'::jsonb,
  'adventurous',
  'niche',
  'long',
  'strong',
  'luxury-niche'
);

-- =============================================================================
-- ENGINE QA NOTES (what each row is meant to exercise)
-- =============================================================================
--
-- 1) Prada L'Homme L'Eau (Test QA)
--    - style_cluster daily-office vs user "daily" / professional intent
--    - Rich accords for Jaccard-style scent_family + diversity logic (not sparse)
--    - office + formal occasions vs quiz q2 mapping
--    - "polished" vibe → clean/timeless token paths in buildCatalogVibeText
--
-- 2) Tom Ford Oud Wood (Test QA)
--    - date-night + evening; dark-woody / oriental accord set
--    - Niche-adjacent luxury; tests NICHE/BOLD role scores vs dateTrait
--    - "mysterious" vibe; overlap with user "seductive" / evening quizzes
--
-- 3) Mugler Angel (Test QA)
--    - sweet-gourmand cluster; strong gourmand accords → avoid-sweet / sweetness scoring
--    - Feminine gender vs quiz gender filter
--    - High projection "strong" vs user projection tolerance
--
-- 4) Hermès Terre d'Hermès (Test QA)
--    - All-season array → season scoring + versatile role
--    - "timeless" vibe + fresh-clean cluster → SAFE / VERSATILE candidates
--    - Broad occasions → occasion Jaccard diversity vs narrow picks
--
-- 5) Nishane Hacivat (Test QA)
--    - price_tier niche + luxury-niche style_cluster → NICHE/WILDCARD slots
--    - Pineapple/chypre profile distinct from 1–4 → anti-duplicate / isTooSimilar
--    - "adventurous" vibe + strong projection → BOLD vs SAFE separation
--
-- =============================================================================
