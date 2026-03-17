/**
 * Types for AI-powered collection analysis.
 * All AI responses are structured as JSON for reliability.
 */

export interface DetectionItem {
  name: string;
  brand: string;
  confidence: number;
}

export interface DetectFragrancesResult {
  detections: DetectionItem[];
  needsConfirmation: boolean;
}

/** Full analysis result from the AI. New fields are optional for backward compatibility. */
export interface AnalysisPromptResult {
  scentProfile: {
    dominant: string;
    secondary: string;
    accent: string;
    description: string;
  };
  strengths: string[];
  weaknesses: string[];
  missingCategories: string[];
  layeringSuggestions: string[];
  whenToWear: string[];
  /** Who this collection suits (e.g. "The confident professional who likes depth and versatility"). */
  whoThisSuits?: string;
  /** Overall vibe of the collection in one short, evocative paragraph. */
  overallVibe?: string;
  /** How the collection wears: development, longevity, versatility in practice. */
  howItWears?: string;
  /** Best seasons for this collection (e.g. "Spring", "Fall"). */
  bestSeasons?: string[];
  /** Best occasions (e.g. "Office and weekend casual", "Date night"). */
  bestOccasions?: string[];
  /** Why this collection works—one or two expert sentences. */
  whyItWorks?: string;
  /** Similar fragrances or alternatives to explore (short phrases, e.g. "If you like X, try Y"). */
  similarFragrances?: string[];
}
