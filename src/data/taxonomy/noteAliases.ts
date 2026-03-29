/**
 * Note alias resolution (Layer 1): normalized surface strings → canonical note id.
 *
 * Builds a deterministic index from:
 * - every note `label` and `synonyms`
 * - every note category `label` and `synonyms` (maps to category id, not note id — see below)
 * - every subcategory and cluster labels/synonyms (optional routing)
 *
 * First canonical win wins (stable ordering via Object.values insertion order).
 */

import type { TaxonomyId } from "./types";
import { normalizeTaxonomyText } from "./normalizeText";
import { NOTES, NOTE_CATEGORIES } from "./noteTaxonomy";
import { NOTE_SUBCATEGORIES } from "./noteSubcategories";
import { NOTE_CLUSTERS } from "./noteClusters";

/** Ontology version string for machine-readable exports / caching. */
export const NOTE_ONTOLOGY_LAYER_VERSION = "layer1-notes-2026.03";

export type AliasKind = "note" | "category" | "subcategory" | "cluster";

export type AliasResolution =
  | { kind: "note"; id: TaxonomyId }
  | { kind: "category"; id: TaxonomyId }
  | { kind: "subcategory"; id: TaxonomyId }
  | { kind: "cluster"; id: TaxonomyId };

function addKeys(
  map: Map<string, AliasResolution>,
  keys: string[],
  resolution: AliasResolution,
  minLen = 2
) {
  for (const raw of keys) {
    const k = normalizeTaxonomyText(raw);
    if (k.length < minLen) continue;
    if (!map.has(k)) map.set(k, resolution);
  }
}

/**
 * Full alias map: normalized key → resolution.
 * Category/subcategory/cluster entries help routing user text to taxonomy ids even when
 * the string is not a specific note (e.g. "white florals" → category).
 */
export function buildNoteOntologyAliasMap(): Map<string, AliasResolution> {
  const map = new Map<string, AliasResolution>();

  for (const note of Object.values(NOTES)) {
    addKeys(map, [note.label, ...(note.synonyms ?? [])], { kind: "note", id: note.id });
  }

  for (const cat of Object.values(NOTE_CATEGORIES)) {
    addKeys(map, [cat.label, ...(cat.synonyms ?? [])], { kind: "category", id: cat.id }, 3);
  }

  for (const sub of Object.values(NOTE_SUBCATEGORIES)) {
    addKeys(map, [sub.label, ...(sub.synonyms ?? [])], { kind: "subcategory", id: sub.id }, 3);
  }

  for (const cl of Object.values(NOTE_CLUSTERS)) {
    addKeys(map, [cl.label, ...(cl.synonyms ?? [])], { kind: "cluster", id: cl.id }, 3);
  }

  return map;
}

let _cachedMap: Map<string, AliasResolution> | null = null;

export function getNoteOntologyAliasMap(): Map<string, AliasResolution> {
  if (!_cachedMap) _cachedMap = buildNoteOntologyAliasMap();
  return _cachedMap;
}

/**
 * Resolve a user or catalog string to a canonical **note** id, or null.
 * Category / subcategory / cluster-only phrases return null here — use {@link resolveOntologyAlias}.
 */
export function resolveCanonicalNoteId(raw: string): TaxonomyId | null {
  const k = normalizeTaxonomyText(raw);
  if (!k) return null;
  const m = getNoteOntologyAliasMap();
  const direct = m.get(k);
  if (direct?.kind === "note") return direct.id;
  let bestId: TaxonomyId | null = null;
  let bestLen = -1;
  m.forEach((res, key) => {
    if (res.kind === "note" && (k.includes(key) || key.includes(k))) {
      const len = key.length;
      if (bestLen < 0 || len > bestLen) {
        bestLen = len;
        bestId = res.id;
      }
    }
  });
  return bestId;
}

/**
 * Same as resolveCanonicalNoteId but returns full resolution for UI / debugging.
 */
export function resolveOntologyAlias(raw: string): AliasResolution | null {
  const k = normalizeTaxonomyText(raw);
  if (!k) return null;
  const m = getNoteOntologyAliasMap();
  return m.get(k) ?? null;
}
