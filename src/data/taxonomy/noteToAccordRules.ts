/**
 * Layer 3: note → accord connectivity.
 *
 * Primary edges come from each accord’s `noteContributors` (inverted in the map below).
 * `EXTRA_NOTE_TO_ACCORD_RULES` adds optional cross-links without duplicating accord rows.
 */

import type { TaxonomyId } from "./types";
import { ACCORDS } from "./accordTaxonomy";
import { resolveCanonicalNoteId } from "./noteAliases";

export type NoteToAccordEdge = { accordId: TaxonomyId; weight: number };

/** Declarative extra edges (merged with contributor-derived edges; max weight wins per accord). */
export const EXTRA_NOTE_TO_ACCORD_RULES: Array<{ noteId: TaxonomyId; accordId: TaxonomyId; weight: number }> = [
  { noteId: "note_milk", accordId: "accord_layer3_woody_creamy_sandalwood", weight: 0.35 },
  { noteId: "note_seaweed", accordId: "accord_aquatic_salty_sea_salt", weight: 0.25 },
  { noteId: "note_seaweed", accordId: "accord_aquatic_mineral_stone", weight: 0.2 },
];

function mergeMaxByAccord(edges: NoteToAccordEdge[]): NoteToAccordEdge[] {
  const byAccord = new Map<TaxonomyId, number>();
  for (const e of edges) {
    const prev = byAccord.get(e.accordId) ?? 0;
    if (e.weight > prev) byAccord.set(e.accordId, e.weight);
  }
  return Array.from(byAccord.entries()).map(([accordId, weight]) => ({ accordId, weight }));
}

/**
 * Full map: canonical note id → contributing accords (weights from taxonomy + extras).
 */
export function buildNoteToAccordRuleMap(): Record<TaxonomyId, NoteToAccordEdge[]> {
  const out: Record<TaxonomyId, NoteToAccordEdge[]> = {};

  for (const accord of Object.values(ACCORDS)) {
    for (const nc of accord.noteContributors) {
      out[nc.noteId] = out[nc.noteId] ?? [];
      out[nc.noteId].push({ accordId: accord.id, weight: nc.weight });
    }
  }

  for (const rule of EXTRA_NOTE_TO_ACCORD_RULES) {
    out[rule.noteId] = out[rule.noteId] ?? [];
    out[rule.noteId].push({ accordId: rule.accordId, weight: rule.weight });
  }

  for (const noteId of Object.keys(out)) {
    out[noteId] = mergeMaxByAccord(out[noteId]!);
  }

  return out;
}

let _cached: Record<TaxonomyId, NoteToAccordEdge[]> | null = null;

export function getNoteToAccordRuleMap(): Record<TaxonomyId, NoteToAccordEdge[]> {
  if (!_cached) _cached = buildNoteToAccordRuleMap();
  return _cached;
}

/**
 * Resolve free-text note lines to weighted accord activations (by canonical note id).
 * Weights multiply note→accord rule weight (caller may normalize).
 */
export function resolveRawNotesToAccordEdges(
  rawNotes: string[],
  noteWeights?: number[]
): Array<{ accordId: TaxonomyId; weight: number; sourceNoteId: TaxonomyId }> {
  const map = getNoteToAccordRuleMap();
  const acc = new Map<TaxonomyId, { w: number; source: TaxonomyId }>();

  rawNotes.forEach((raw, i) => {
    const nid = resolveCanonicalNoteId(raw);
    if (!nid) return;
    const nw = noteWeights?.[i] ?? 1;
    const edges = map[nid];
    if (!edges?.length) return;
    for (const e of edges) {
      const contrib = e.weight * nw;
      const prev = acc.get(e.accordId);
      if (!prev || contrib > prev.w) acc.set(e.accordId, { w: contrib, source: nid });
    }
  });

  return Array.from(acc.entries()).map(([accordId, v]) => ({
    accordId,
    weight: v.w,
    sourceNoteId: v.source,
  }));
}

/**
 * Sums note→accord contributions across all resolved lines (multiple notes can stack into the same accord).
 * Use this for enrichment; {@link resolveRawNotesToAccordEdges} uses max-per-accord for a different use case.
 */
export function accumulateNotesToAccordWeights(
  rawNotes: string[],
  noteWeights?: number[]
): Array<{ accordId: TaxonomyId; weight: number }> {
  const map = getNoteToAccordRuleMap();
  const byAccord = new Map<TaxonomyId, number>();
  rawNotes.forEach((raw, i) => {
    const nid = resolveCanonicalNoteId(raw);
    if (!nid) return;
    const nw = noteWeights?.[i] ?? 1;
    for (const e of map[nid] ?? []) {
      byAccord.set(e.accordId, (byAccord.get(e.accordId) ?? 0) + e.weight * nw);
    }
  });
  return Array.from(byAccord.entries()).map(([accordId, weight]) => ({ accordId, weight }));
}
