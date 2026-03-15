"use client";

/**
 * Shown when AI confidence is low. User confirms or edits the detected list, then we generate analysis.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { uploadCollectionPhoto } from "@/lib/storage";
import { createCollectionUpload } from "@/lib/collectionUploads";
import { generateCollectionAnalysis } from "@/app/actions/analyze";
import { trackEvent } from "@/lib/events";

const AI_UNAVAILABLE_MESSAGE = "AI analysis temporarily unavailable. Please try again.";
import type { DetectionItem } from "@/lib/ai/types";

const STORAGE_DETECTIONS = "scent-dna-upload-detections";
const STORAGE_IMAGE = "scent-dna-upload-image";
const STORAGE_MIME = "scent-dna-upload-mime";
const STORAGE_GENDER_PREF = "scent-dna-upload-gender-preference";
const RESULT_KEY = "scent-dna-collection-result";

const GENDER_OPTIONS = [
  { value: "open", label: "Open — any" },
  { value: "masculine", label: "Masculine" },
  { value: "feminine", label: "Feminine" },
  { value: "unisex", label: "Unisex" },
] as const;

export default function UploadConfirmPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [genderPreference, setGenderPreference] = useState<string>("open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_DETECTIONS);
      const img = sessionStorage.getItem(STORAGE_IMAGE);
      const mime = sessionStorage.getItem(STORAGE_MIME);
      const pref = sessionStorage.getItem(STORAGE_GENDER_PREF);
      if (raw) setDetections(JSON.parse(raw));
      if (img) setImageBase64(img);
      if (mime) setMimeType(mime);
      if (pref && ["open", "masculine", "feminine", "unisex"].includes(pref)) setGenderPreference(pref);
    } catch {
      setDetections([]);
    }
  }, []);

  function removeDetection(index: number) {
    setDetections((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      console.log("[upload flow] Confirm page: Step 4 (analysis generation) — calling generateCollectionAnalysis");
      const result = await generateCollectionAnalysis(detections, { genderPreference });
      if (!result) {
        setError(AI_UNAVAILABLE_MESSAGE);
        setLoading(false);
        return;
      }
      console.log("[upload flow] Confirm page: Step 4 — done");
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
      sessionStorage.removeItem(STORAGE_DETECTIONS);
      sessionStorage.removeItem(STORAGE_IMAGE);
      sessionStorage.removeItem(STORAGE_MIME);
      sessionStorage.removeItem(STORAGE_GENDER_PREF);

      if (user && imageBase64) {
        console.log("[upload flow] Confirm page: uploading photo to storage and saving record");
        const supabase = createClient();
        const blob = await (await fetch(`data:${mimeType};base64,${imageBase64}`)).blob();
        const file = new File([blob], "collection.jpg", { type: mimeType });
        const path = await uploadCollectionPhoto(supabase, file);
        if (path) {
          const uploadRecord = await createCollectionUpload(supabase, path);
          trackEvent("image_uploaded", { uploadId: uploadRecord.id });
        }
      }

      console.log("[upload flow] Confirm page: Step 5 — redirecting to results");
      router.push("/results?source=upload");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("[upload flow] Confirm page: failure —", message);
      setError(message);
      setLoading(false);
    }
  }

  if (detections.length === 0 && !loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-charcoal/70 mb-4">No detections to confirm. Start from the upload page.</p>
        <Link href="/upload" className="text-charcoal underline">Upload a photo</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 md:py-16">
      <p className="text-charcoal/50 text-sm tracking-wide uppercase mb-2">Confirm</p>
      <h1 className="font-serif text-2xl text-charcoal mb-2">We found these bottles</h1>
      <p className="text-charcoal/60 text-sm mb-6">
        Some readings were uncertain. Remove any that are wrong, then confirm to generate your analysis.
      </p>

      <label className="block mb-6">
        <span className="text-sm text-charcoal/70 block mb-2">Fragrance preference (for recommendations)</span>
        <select
          value={genderPreference}
          onChange={(e) => setGenderPreference(e.target.value)}
          className="block w-full py-2.5 px-3 border border-charcoal/20 bg-white text-charcoal text-sm focus:outline-none focus:border-charcoal/50"
        >
          {GENDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <ul className="space-y-3 mb-8">
        {detections.map((d, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-4 p-3 border border-charcoal/10 bg-white"
          >
            <div>
              <p className="font-medium text-charcoal text-sm">{d.brand} — {d.name}</p>
              <p className="text-xs text-charcoal/50">Confidence: {Math.round(d.confidence * 100)}%</p>
            </div>
            <button
              type="button"
              onClick={() => removeDetection(i)}
              className="text-xs text-charcoal/50 hover:text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm mb-6">
          <p className="font-medium text-red-800 mb-1">Error</p>
          <p className="text-red-700 mb-2">{error}</p>
          <p className="text-red-600 text-xs">Step that failed: 4 — Generating analysis text from your confirmed list.</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 py-3 bg-charcoal text-cream text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Generating analysis…" : "Confirm and analyze"}
        </button>
        <Link
          href="/upload"
          className="px-4 py-3 border border-charcoal/20 text-charcoal text-sm"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
