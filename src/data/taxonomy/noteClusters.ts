/**
 * Note clusters (Layer 1): cross-cutting similarity groups for enrichment / future scoring.
 * Membership here is authoritative; optional `clusterIds` on {@link StandardizedNote} mirrors it for fast lookup.
 */

import type { NoteCluster, TaxonomyId } from "./types";

export const NOTE_CLUSTERS: Record<TaxonomyId, NoteCluster> = {
  note_cluster_citrus_sparkle: {
    id: "note_cluster_citrus_sparkle",
    label: "Citrus sparkle / top lift",
    description: "Bright, effervescent citrus tops shared across many fresh compositions.",
    memberNotes: [
      { noteId: "note_bergamot", weight: 1 },
      { noteId: "note_lemon", weight: 0.9 },
      { noteId: "note_neroli", weight: 0.85 },
      { noteId: "note_yuzu", weight: 0.9 },
      { noteId: "note_grapefruit", weight: 0.8 },
    ],
    relatedCategoryIds: ["note_cat_citrus"],
  },
  note_cluster_bitter_citrus: {
    id: "note_cluster_bitter_citrus",
    label: "Bitter / aromatic citrus",
    memberNotes: [
      { noteId: "note_bigarade", weight: 1 },
      { noteId: "note_grapefruit", weight: 0.6 },
      { noteId: "note_cedrat", weight: 0.7 },
    ],
    relatedCategoryIds: ["note_cat_citrus"],
  },
  note_cluster_white_floral_bouquet: {
    id: "note_cluster_white_floral_bouquet",
    label: "White floral bouquet",
    description: "Heady white florals often used together in heart notes.",
    memberNotes: [
      { noteId: "note_tuberose", weight: 1 },
      { noteId: "note_gardenia", weight: 0.95 },
      { noteId: "note_jasmine", weight: 0.9 },
      { noteId: "note_orange_blossom", weight: 0.85 },
      { noteId: "note_ylang_ylang", weight: 0.9 },
    ],
    relatedCategoryIds: ["note_cat_floral", "note_cat_white_florals"],
  },
  note_cluster_resinous_incense_base: {
    id: "note_cluster_resinous_incense_base",
    label: "Resinous incense base",
    memberNotes: [
      { noteId: "note_frankincense", weight: 1 },
      { noteId: "note_myrrh", weight: 0.95 },
      { noteId: "note_labdanum", weight: 0.85 },
      { noteId: "note_benzoin", weight: 0.8 },
      { noteId: "note_incense", weight: 0.9 },
    ],
    relatedCategoryIds: ["note_cat_resins_balsams", "note_cat_smoke_incense"],
  },
  note_cluster_lactonic_gourmand: {
    id: "note_cluster_lactonic_gourmand",
    label: "Lactonic gourmand",
    memberNotes: [
      { noteId: "note_milk", weight: 1 },
      { noteId: "note_rice", weight: 0.85 },
      { noteId: "note_coconut", weight: 0.75 },
      { noteId: "note_tonka", weight: 0.5 },
    ],
    relatedCategoryIds: ["note_cat_gourmand_sweet"],
  },
  note_cluster_dry_woody_forest: {
    id: "note_cluster_dry_woody_forest",
    label: "Dry woody forest floor",
    memberNotes: [
      { noteId: "note_cedar", weight: 1 },
      { noteId: "note_vetiver", weight: 0.95 },
      { noteId: "note_oak_wood", weight: 0.8 },
      { noteId: "note_oakmoss", weight: 0.85 },
      { noteId: "note_birch", weight: 0.75 },
    ],
    relatedCategoryIds: ["note_cat_woods"],
  },
  note_cluster_spice_warm_kitchen: {
    id: "note_cluster_spice_warm_kitchen",
    label: "Warm kitchen spices",
    memberNotes: [
      { noteId: "note_cinnamon", weight: 1 },
      { noteId: "note_clove", weight: 0.95 },
      { noteId: "note_nutmeg", weight: 0.9 },
      { noteId: "note_cardamom", weight: 0.6 },
    ],
    relatedCategoryIds: ["note_cat_spices"],
  },
  note_cluster_aquatic_saline_mineral: {
    id: "note_cluster_aquatic_saline_mineral",
    label: "Saline / mineral aquatic",
    memberNotes: [
      { noteId: "note_marine_salt", weight: 1 },
      { noteId: "note_oceanic", weight: 0.85 },
      { noteId: "note_calone", weight: 0.8 },
      { noteId: "note_seaweed", weight: 0.7 },
    ],
    relatedCategoryIds: ["note_cat_aquatic_marine", "note_cat_mineral_salty_metallic"],
  },
  note_cluster_musk_clean_laundry: {
    id: "note_cluster_musk_clean_laundry",
    label: "Clean / laundry musk",
    memberNotes: [
      { noteId: "note_white_musk", weight: 1 },
      { noteId: "note_ambroxan", weight: 0.85 },
      { noteId: "note_musk", weight: 0.6 },
    ],
    relatedCategoryIds: ["note_cat_musks", "note_cat_synthetic_aroma_chemicals"],
  },
  note_cluster_smoke_leather_tobacco: {
    id: "note_cluster_smoke_leather_tobacco",
    label: "Smoke, leather, tobacco",
    memberNotes: [
      { noteId: "note_leather", weight: 1 },
      { noteId: "note_suede", weight: 0.85 },
      { noteId: "note_smoke", weight: 0.9 },
      { noteId: "note_tobacco", weight: 0.95 },
      { noteId: "note_birch", weight: 0.7 },
    ],
    relatedCategoryIds: ["note_cat_leather_suede", "note_cat_smoke_incense"],
  },
  note_cluster_green_stemmy: {
    id: "note_cluster_green_stemmy",
    label: "Green stem / leaf",
    memberNotes: [
      { noteId: "note_galbanum", weight: 1 },
      { noteId: "note_violet_leaf", weight: 0.9 },
      { noteId: "note_tomato_leaf", weight: 0.85 },
      { noteId: "note_mint", weight: 0.7 },
    ],
    relatedCategoryIds: ["note_cat_green_aromatic"],
  },
  note_cluster_earth_patchouli: {
    id: "note_cluster_earth_patchouli",
    label: "Earthy patchouli / humus",
    memberNotes: [
      { noteId: "note_patchouli", weight: 1 },
      { noteId: "note_vetiver", weight: 0.65 },
      { noteId: "note_oakmoss", weight: 0.55 },
    ],
    relatedCategoryIds: ["note_cat_earth_soil", "note_cat_green_aromatic"],
  },
};
