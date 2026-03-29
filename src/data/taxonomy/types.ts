/**
 * Shared taxonomy types used by the note/accord/family/trait data modules.
 *
 * This module is intentionally dependency-free so it can be imported from:
 * - `src/data/taxonomy/*` data files (static taxonomy)
 * - later enrichment/scoring code in `src/lib/recommendations/*`
 *
 * NOTE: This taxonomy is not wired into the existing recommendation engine yet.
 */

export type TaxonomyId = string;

export interface LabeledEntity {
  id: TaxonomyId;
  label: string;
  description?: string;
  synonyms?: string[];
}

export interface NoteCategory extends LabeledEntity {}

/**
 * Finer grouping under a macro {@link NoteCategory} (e.g. "bitter citrus" under Citrus).
 * Used for enrichment and future scoring; optional on each {@link StandardizedNote}.
 */
export interface NoteSubcategory extends LabeledEntity {
  /** Parent macro category id (e.g. note_cat_citrus). */
  parentCategoryId: TaxonomyId;
}

/**
 * Cross-cutting groupings of notes for similarity / clustering (e.g. "white floral bouquet").
 * A note may belong to multiple clusters; weights are optional for soft membership.
 */
export interface NoteCluster extends LabeledEntity {
  /** Canonical note members; optional weights sum arbitrarily (normalize downstream). */
  memberNotes: Array<{ noteId: TaxonomyId; weight?: number }>;
  /** Optional: macro categories this cluster is most associated with. */
  relatedCategoryIds?: TaxonomyId[];
}

export interface StandardizedNote extends LabeledEntity {
  categoryIds: TaxonomyId[];
  /** Optional finer classification (Layer 1). */
  subcategoryIds?: TaxonomyId[];
  /** Optional cluster memberships for soft grouping (Layer 1). */
  clusterIds?: TaxonomyId[];
}

export interface AccordCategory extends LabeledEntity {}

/**
 * Finer facet under a macro {@link AccordCategory} (e.g. "dry woody" vs "creamy woody").
 * Layer 3 — optional on each {@link AccordDefinition}.
 */
export interface AccordCategorySubtype extends LabeledEntity {
  parentCategoryId: TaxonomyId;
}

export type PerceptualTraitId =
  | "trait_cleanliness"
  | "trait_freshness"
  | "trait_sweetness"
  | "trait_darkness"
  | "trait_temperature_warmth"
  | "trait_temperature_coolness"
  | "trait_powderiness"
  | "trait_smokiness"
  | "trait_leatheriness"
  | "trait_creaminess"
  | "trait_resinousness"
  | "trait_musky_clean"
  | "trait_musky_skin"
  | "trait_musky_laundry"
  | "trait_aquaticness"
  | "trait_minerality"
  | "trait_ozonicness"
  | "trait_sensuality"
  | "trait_boldness"
  | "trait_fresh_airiness"
  | "trait_complexity"
  | "trait_mass_appeal"
  | "trait_uniqueness";

export interface PerceptualTrait extends LabeledEntity {
  /**
   * How this trait should be interpreted by scoring.
   * Most are bounded 0..1. Keep it explicit so scoring code doesn’t guess.
   */
  scale: "bounded_0_1";
}

export interface AccordDefinition extends LabeledEntity {
  categoryId: TaxonomyId;
  /** Optional Layer 3 facet (creamy vs dry woody, edible vs airy sweet, etc.). */
  subtypeId?: TaxonomyId;

  /**
   * Plain-English perception summary of the accord.
   * This should be stable and consistent; later you can reuse it for explanations.
   */
  definition: string;

  /**
   * Canonical note evidence used by enrichment code.
   * (In v1 your `accords` are not notes, so this will be used once note enrichment exists.)
   */
  noteContributors: Array<{ noteId: TaxonomyId; weight: number }>;

  /** Trait deltas for recommendation-quality vector scoring. */
  traitDeltas: Partial<Record<PerceptualTraitId, number>>;

  /**
   * How this accord maps into family intents.
   * Both primary and hybrid are supported.
   */
  familyMappings: {
    primaryFamilyMappings: Array<{ primaryFamilyId: TaxonomyId; weight: number }>;
    hybridFamilyMappings: Array<{ hybridFamilyId: TaxonomyId; weight: number }>;
  };
}

export interface FamilyGroup extends LabeledEntity {}

export interface PrimaryFamily extends LabeledEntity {
  groupId: TaxonomyId;
  subFamilyIds?: TaxonomyId[];
  /**
   * Optional editorial hint for explanation templates.
   * Example: "Most aligned with clean citrus brightness."
   */
  editorialIntent?: string;
}

export interface HybridFamily extends LabeledEntity {
  /**
   * Which primary families this hybrid represents.
   * Used for assignment confidence and later scoring.
   */
  primaryFamilyIds: TaxonomyId[];

  /**
   * Human-readable editorial definition.
   * Example: "Fresh citrus brightness fused with clean musks for an airy signature."
   */
  definition: string;
}

