/**
 * Load fragrance catalog from Supabase for the recommendation engine.
 * Used as the primary data source; fragranceCatalog.ts is the fallback if this fails.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  CatalogFragrance,
  BudgetTier,
  OccasionTag,
  PriceTier,
  StyleCluster,
} from "@/data/fragranceCatalog";

const OCCASION_TAGS: OccasionTag[] = [
  "office",
  "casual",
  "date",
  "formal",
  "summer",
  "evening",
];
const STYLE_CLUSTERS: StyleCluster[] = [
  "fresh-clean",
  "sweet-gourmand",
  "dark-woody",
  "spicy-oriental",
  "luxury-niche",
  "daily-office",
  "date-night",
];

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((x) => String(x ?? ""));
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map((x) => String(x ?? "")) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function toOccasions(arr: string[]): OccasionTag[] {
  return arr.filter((s): s is OccasionTag =>
    OCCASION_TAGS.includes(s as OccasionTag)
  );
}

function priceTierToBudgetTier(pt: string | null): BudgetTier {
  if (!pt) return "mid";
  const t = pt.toLowerCase();
  if (t === "budget") return "budget";
  if (t === "designer" || t === "luxury") return "luxe";
  if (t === "niche" || t === "ultra-niche") return "niche";
  return "mid";
}

function toStyleCluster(s: string | null): StyleCluster {
  if (!s) return "daily-office";
  const t = s.toLowerCase();
  if (STYLE_CLUSTERS.includes(t as StyleCluster)) return t as StyleCluster;
  return "daily-office";
}

function toPriceTier(s: string | null): PriceTier {
  if (!s) return "designer";
  const t = s.toLowerCase();
  if (["budget", "designer", "luxury", "niche", "ultra-niche"].includes(t))
    return t as PriceTier;
  return "designer";
}

function deriveCategory(notes: string[], accords: string[]): string {
  const text = [...notes, ...accords].join(" ").toLowerCase();
  if (/fresh|aquatic|marine|citrus|green/.test(text)) return "Fresh";
  if (/wood|sandal|cedar|vetiver|oud/.test(text)) return "Woody";
  if (/floral|rose|flower/.test(text)) return "Floral";
  if (/vanilla|amber|gourmand|sweet|tonka/.test(text)) return "Amber";
  if (/spice|oriental|oud|leather|incense/.test(text)) return "Oriental";
  return "General";
}

/** Row shape from Supabase fragrances table (id, brand_id, name, brand, gender, notes, accords, seasons, occasions, vibe, price_tier, longevity, projection, style_cluster). */
interface FragranceRow {
  id: string;
  brand_id?: string;
  name: string;
  brand?: string | null;
  gender?: string | null;
  notes?: unknown;
  accords?: unknown;
  seasons?: unknown;
  occasions?: unknown;
  vibe?: string | null;
  price_tier?: string | null;
  longevity?: string | null;
  projection?: string | null;
  style_cluster?: string | null;
}

function rowToCatalog(row: FragranceRow): CatalogFragrance {
  const notes = parseJsonArray(row.notes);
  const accords = parseJsonArray(row.accords);
  const occasionsRaw = parseJsonArray(row.occasions);
  const occasions = toOccasions(occasionsRaw.length > 0 ? occasionsRaw : ["casual"]);
  const profileHint = notes[0] ?? "";
  const priceTier = toPriceTier(row.price_tier ?? null);
  const budgetTier = priceTierToBudgetTier(row.price_tier ?? null);
  const designerNiche =
    priceTier === "niche" || priceTier === "ultra-niche" ? "niche" : "designer";
  const gender =
    row.gender === "masculine" || row.gender === "feminine" || row.gender === "unisex"
      ? row.gender
      : "unisex";

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    brand: String(row.brand ?? ""),
    category: deriveCategory(notes, accords),
    occasions,
    budgetTier,
    designerNiche,
    profileHint,
    gender,
    styleCluster: toStyleCluster(row.style_cluster ?? null),
    priceTier,
    accords: accords.length > 0 ? accords : undefined,
    seasons:
      parseJsonArray(row.seasons).length > 0 ? parseJsonArray(row.seasons) : undefined,
    vibe: row.vibe ?? undefined,
    longevity: row.longevity ?? undefined,
    projection: row.projection ?? undefined,
  };
}

/**
 * Fetches all fragrances from Supabase and maps them to CatalogFragrance[].
 * Returns null on any error so the caller can fall back to the local catalog.
 */
export async function getFragranceCatalogFromSupabase(): Promise<CatalogFragrance[] | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("fragrances")
      .select("id, brand_id, name, brand, gender, notes, accords, seasons, occasions, vibe, price_tier, longevity, projection, style_cluster");

    if (error) {
      console.error("[fragrances] Supabase query failed:", error.message);
      return null;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const catalog = data.map((row) => rowToCatalog(row as FragranceRow));
    return catalog;
  } catch (e) {
    console.error("[fragrances] Failed to load from Supabase:", e instanceof Error ? e.message : e);
    return null;
  }
}
