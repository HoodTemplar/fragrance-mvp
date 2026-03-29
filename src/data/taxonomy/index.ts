/**
 * Taxonomy barrel export.
 *
 * This keeps imports clean and avoids deep relative paths throughout
 * enrichment/scoring code added later.
 */

export * from "./types";
export * from "./normalizeText";

export * from "./noteTaxonomy";
export * from "./noteLayer1Expansion";
export * from "./noteSubcategories";
export * from "./noteClusters";
export * from "./noteAliases";
export * from "./traitTaxonomy";
export * from "./accordCategorySubtypes";
export * from "./accordLayer3Expansion";
export * from "./accordSubtypeRegistry";
export * from "./accordTaxonomy";
export * from "./noteToAccordRules";
export * from "./familyTaxonomy";
export * from "./relationshipsTaxonomy";

