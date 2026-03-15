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
}
