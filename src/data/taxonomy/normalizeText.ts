/**
 * Centralized normalization rules for taxonomy matching.
 *
 * This is NOT used by the current recommendation engine yet.
 * It exists so enrichment code and synonym mapping can be deterministic.
 */

export function normalizeTaxonomyText(input: string): string {
  return (input ?? "")
    .toLowerCase()
    // Normalize common punctuation to spaces.
    .replace(/[’'"]/g, "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes note/accord/family ids for display-less keys.
 * (We still recommend stable ids created by the taxonomy author.)
 */
export function toTaxonomyIdKey(input: string): string {
  return normalizeTaxonomyText(input).replace(/\s+/g, "_");
}

