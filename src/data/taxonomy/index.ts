/**
 * Taxonomy barrel export.
 *
 * This keeps imports clean and avoids deep relative paths throughout
 * enrichment/scoring code added later.
 */

export * from "./types";
export * from "./normalizeText";

export * from "./noteTaxonomy";
export * from "./traitTaxonomy";
export * from "./accordTaxonomy";
export * from "./familyTaxonomy";
export * from "./relationshipsTaxonomy";

