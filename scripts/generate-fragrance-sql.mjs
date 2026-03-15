/**
 * Reads fragranceCatalog.ts and outputs SQL INSERT statements for Supabase fragrances table.
 * Run from project root: node scripts/generate-fragrance-sql.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.join(__dirname, "../src/data/fragranceCatalog.ts");
const content = fs.readFileSync(catalogPath, "utf8");

// Extract array body (between "= [" and "];" before normalizeCategoryForMatch)
const arrayMatch = content.match(/export const FRAGRANCE_CATALOG[^=]+=\s*\[([\s\S]*?)\n\];/);
if (!arrayMatch) {
  console.error("Could not find FRAGRANCE_CATALOG array");
  process.exit(1);
}

const arrayBody = arrayMatch[1];

// Parse each line that looks like { id: "...", name: "...", ... }
const lineRegex = /\{\s*id:\s*"([^"]*)",\s*name:\s*"((?:[^"\\]|\\.)*)",\s*brand:\s*"((?:[^"\\]|\\.)*)",\s*category:\s*"([^"]*)",\s*occasions:\s*\[([^\]]*)\],\s*budgetTier:\s*"[^"]*",\s*designerNiche:\s*"[^"]*",\s*profileHint:\s*"((?:[^"\\]|\\.)*)",\s*gender:\s*"([^"]*)",\s*styleCluster:\s*"([^"]*)",\s*priceTier:\s*"([^"]*)"(?:\s*,\s*accords:\s*\[([^\]]*)\])?(?:\s*,\s*seasons:\s*\[([^\]]*)\])?(?:\s*,\s*vibe:\s*"((?:[^"\\]|\\.)*)")?(?:\s*,\s*longevity:\s*"([^"]*)")?(?:\s*,\s*projection:\s*"([^"]*)")?\s*\}/g;

function sqlEscape(s) {
  if (s == null || s === undefined) return "null";
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function jsonArray(arr) {
  if (!arr || !arr.length) return "null";
  const parts = arr.map((s) => '"' + String(s).replace(/"/g, '\\"') + '"');
  return "'[" + parts.join(",") + "]'::jsonb";
}

const rows = [];
let m;
const lineRegex2 = /\{\s*id:\s*"([^"]*)",\s*name:\s*"((?:[^"\\]|\\.)*)",\s*brand:\s*"([^"]*)",\s*category:\s*"([^"]*)",\s*occasions:\s*\[([^\]]*)\]/g;
// Simpler: split by "},\n  {" and parse each block
const blocks = arrayBody.split(/\},\s*\n\s*\{/).map((b, i) => (i === 0 ? b : "{" + b));
for (const block of blocks) {
  const idMatch = block.match(/id:\s*"([^"]*)"/);
  const nameMatch = block.match(/name:\s*"((?:[^"\\]|\\.)*)"/);
  const brandMatch = block.match(/brand:\s*"([^"]*)"/);
  const categoryMatch = block.match(/category:\s*"([^"]*)"/);
  const occasionsMatch = block.match(/occasions:\s*\[([^\]]*)\]/);
  const profileMatch = block.match(/profileHint:\s*"((?:[^"\\]|\\.)*)"/);
  const genderMatch = block.match(/gender:\s*"([^"]*)"/);
  const styleMatch = block.match(/styleCluster:\s*"([^"]*)"/);
  const priceMatch = block.match(/priceTier:\s*"([^"]*)"/);
  const accordsMatch = block.match(/accords:\s*\[([^\]]*)\]/);
  const seasonsMatch = block.match(/seasons:\s*\[([^\]]*)\]/);
  const vibeMatch = block.match(/vibe:\s*"((?:[^"\\]|\\.)*)"/);
  const longevityMatch = block.match(/longevity:\s*"([^"]*)"/);
  const projectionMatch = block.match(/projection:\s*"([^"]*)"/);
  if (!idMatch || !nameMatch || !brandMatch) continue;
  const id = idMatch[1];
  const name = (nameMatch[1] || "").replace(/\\"/g, '"');
  const brand = (brandMatch[1] || "").replace(/\\"/g, '"');
  const category = categoryMatch ? categoryMatch[1] : "";
  const occasionsStr = occasionsMatch ? occasionsMatch[1] : "";
  const occasions = occasionsStr ? (occasionsStr.match(/"([^"]*)"/g) || []).map((x) => x.slice(1, -1)) : [];
  const profileHint = profileMatch ? profileMatch[1].replace(/\\"/g, '"') : "";
  const gender = genderMatch ? genderMatch[1] : "unisex";
  const styleCluster = styleMatch ? styleMatch[1] : "";
  const priceTier = priceMatch ? priceMatch[1] : "";
  const accordsStr = accordsMatch ? accordsMatch[1] : "";
  const accords = accordsStr ? accordsStr.match(/"([^"]*)"/g).map((x) => x.slice(1, -1)) : null;
  const seasonsStr = seasonsMatch ? seasonsMatch[1] : "";
  const seasons = seasonsStr ? seasonsStr.match(/"([^"]*)"/g).map((x) => x.slice(1, -1)) : null;
  const vibe = vibeMatch ? vibeMatch[1].replace(/\\"/g, '"') : null;
  const longevity = longevityMatch ? longevityMatch[1] : null;
  const projection = projectionMatch ? projectionMatch[1] : null;
  rows.push({
    id,
    name,
    brand,
    category,
    occasions,
    profileHint,
    gender,
    styleCluster,
    priceTier,
    accords,
    seasons,
    vibe,
    longevity,
    projection,
  });
}

// Build SQL
const brands = [...new Set(rows.map((r) => r.brand))].sort();
let sql = `-- =============================================================================
-- Scent DNA – Seed fragrances from fragranceCatalog.ts
-- Paste this into Supabase SQL Editor and run it.
-- =============================================================================
--
-- Step 1: Insert brands (run this first so brand_id can be looked up).
-- If a brand already exists, the INSERT will fail for that row; you can
-- run the fragrance INSERTs only, or add "ON CONFLICT (name) DO NOTHING"
-- if your brands table has a UNIQUE constraint on name.
--
INSERT INTO public.brands (name)
VALUES
  ${brands.map((b) => sqlEscape(b)).join(",\n  ")}
ON CONFLICT DO NOTHING;

--
-- Step 2: Insert fragrances.
-- Columns: id (uuid), brand_id (from brands), name, brand, gender, notes (jsonb),
-- accords (jsonb), seasons (jsonb), occasions (jsonb), vibe, price_tier, longevity, projection, style_cluster.
-- notes = short descriptor as a one-element JSON array.
--
`;

// If brands table has no unique, ON CONFLICT DO NOTHING will error - remove it and add a note
sql = sql.replace(
  "ON CONFLICT DO NOTHING;",
  "-- ON CONFLICT (name) DO NOTHING;  -- Uncomment if brands(name) is UNIQUE\n;"
);
sql = sql.replace("-- Uncomment if brands(name) is UNIQUE\n;", "ON CONFLICT (name) DO NOTHING;\n");
// Actually we don't know if they have unique. Let me just use simple INSERT for brands and add a comment that they may need to remove duplicates
sql = `-- =============================================================================
-- Scent DNA – Seed fragrances from fragranceCatalog.ts
-- Paste this into Supabase SQL Editor and run it.
-- =============================================================================
--
-- Step 1: Ensure brands exist. (If your brands table has UNIQUE(name), the second
-- block uses ON CONFLICT DO NOTHING. Otherwise run the first block once to insert
-- missing brands, or insert brands manually.)
--
`;

sql += `INSERT INTO public.brands (name)
SELECT unnest(ARRAY[\n  ${brands.map((b) => sqlEscape(b)).join(",\n  ")}\n])
WHERE NOT EXISTS (SELECT 1 FROM public.brands LIMIT 1);

`;
// Simpler: just list INSERT for each brand and let user run once
sql = `-- =============================================================================
-- Scent DNA – Seed fragrances from fragranceCatalog.ts
-- Paste into Supabase SQL Editor and run.
-- =============================================================================
--
-- Step 1: Insert brands. Run this first.
-- If your brands table has a UNIQUE constraint on name, add: ON CONFLICT (name) DO NOTHING;
-- If you get duplicate errors, skip to Step 2 (your brands already exist).
--
INSERT INTO public.brands (name) VALUES
${brands.map((b) => "  (" + sqlEscape(b) + ")").join(",\n")};

--
-- Step 2: Insert fragrances.
-- notes, accords, seasons, occasions = JSON arrays (jsonb). Use null where missing.
--
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
) VALUES
`;

const fragLines = rows.map((r) => {
  const brandId = `(SELECT id FROM public.brands WHERE name = ${sqlEscape(r.brand)} LIMIT 1)`;
  const notesJson = jsonArray([r.profileHint]);
  const accordsJson = r.accords && r.accords.length ? jsonArray(r.accords) : "null";
  const seasonsJson = r.seasons && r.seasons.length ? jsonArray(r.seasons) : "null";
  const occasionsJson = jsonArray(r.occasions);
  const vibeVal = r.vibe != null ? sqlEscape(r.vibe) : "null";
  const longevityVal = r.longevity != null ? sqlEscape(r.longevity) : "null";
  const projectionVal = r.projection != null ? sqlEscape(r.projection) : "null";
  const styleVal = r.styleCluster ? sqlEscape(r.styleCluster) : "null";
  const priceVal = r.priceTier ? sqlEscape(r.priceTier) : "null";
  return `  (gen_random_uuid(), ${brandId}, ${sqlEscape(r.name)}, ${sqlEscape(r.brand)}, ${sqlEscape(r.gender)}, ${notesJson}, ${accordsJson}, ${seasonsJson}, ${occasionsJson}, ${vibeVal}, ${priceVal}, ${longevityVal}, ${projectionVal}, ${styleVal})`;
});

sql += fragLines.join(",\n");
sql += "\n;\n";

console.log(sql);
