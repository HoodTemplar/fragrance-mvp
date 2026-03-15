"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { uploadCollectionPhoto } from "@/lib/storage";
import { createCollectionUpload } from "@/lib/collectionUploads";
import { analyzeCollectionImage, generateCollectionAnalysis } from "@/app/actions/analyze";
import { trackEvent } from "@/lib/events";

const AI_UNAVAILABLE_MESSAGE = "AI analysis temporarily unavailable. Please try again.";

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

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      if (!base64) reject(new Error("Failed to read file"));
      else resolve({ base64, mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [genderPreference, setGenderPreference] = useState<string>("open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    if (chosen) setFile(chosen);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !user) return;
    setLoading(true);
    setError(null);

    try {
      const { base64, mimeType } = await fileToBase64(file);
      console.log("[upload flow] Client: file read as base64, length:", base64.length);

      // Step 1: OpenAI detection (do not destructure until we know result is valid)
      const analysisResult = await analyzeCollectionImage(base64, mimeType);
      if (analysisResult?.error || !analysisResult) {
        setError(analysisResult?.error ?? AI_UNAVAILABLE_MESSAGE);
        setLoading(false);
        return;
      }
      const detections = Array.isArray(analysisResult.detections) ? analysisResult.detections : [];
      const needsConfirmation = Boolean(analysisResult.needsConfirmation);
      console.log("[upload flow] Client: Step 1 (OpenAI detection) — done, detections:", detections.length, "needsConfirmation:", needsConfirmation);

      if (needsConfirmation && detections.length > 0) {
        sessionStorage.setItem(STORAGE_DETECTIONS, JSON.stringify(detections));
        sessionStorage.setItem(STORAGE_IMAGE, base64);
        sessionStorage.setItem(STORAGE_MIME, mimeType);
        sessionStorage.setItem(STORAGE_GENDER_PREF, genderPreference);
        console.log("[upload flow] Client: redirecting to confirmation page");
        router.push("/upload/confirm");
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // Step 2: storage upload
      const path = await uploadCollectionPhoto(supabase, file);
      console.log("[upload flow] Client: Step 2 (storage upload) — done, path:", path);

      // Step 3: collection_uploads insert
      const uploadRecord = await createCollectionUpload(supabase, path);
      console.log("[upload flow] Client: Step 3 (collection_uploads insert) — done, id:", uploadRecord.id);

      trackEvent("image_uploaded", { uploadId: uploadRecord.id });

      // Step 4: analysis generation (pass gender preference for recommendations)
      const result = await generateCollectionAnalysis(detections, { genderPreference });
      if (!result) {
        setError(AI_UNAVAILABLE_MESSAGE);
        setLoading(false);
        return;
      }
      console.log("[upload flow] Client: Step 4 (analysis generation) — done");

      // Step 5: result save & redirect
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
      console.log("[upload flow] Client: Step 5 (result save / redirect) — saving to sessionStorage, redirecting to results-loading");
      router.push(`/results-loading?upload_id=${uploadRecord.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("[upload flow] Client: failure —", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 md:py-24">
      <p className="text-charcoal/50 text-sm tracking-wide uppercase mb-2">Upload</p>
      <h1 className="font-serif text-3xl text-charcoal mb-4">Your collection</h1>
      <p className="text-charcoal/60 text-sm leading-relaxed mb-10">
        Add a photo of your fragrance bottles. We’ll analyze your collection and show your score and recommendations.
        {!user && " Sign in to upload and save to your account."}
      </p>

      {!user ? (
        <p className="py-4 text-sm text-charcoal/70 border border-charcoal/10 px-4">
          Please sign in (top right) to upload and analyze your collection.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-sm text-charcoal/70 block mb-2">Fragrance preference</span>
            <select
              value={genderPreference}
              onChange={(e) => setGenderPreference(e.target.value)}
              className="block w-full py-2.5 px-3 border border-charcoal/20 bg-cream text-charcoal text-sm focus:outline-none focus:border-charcoal/50"
            >
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="text-xs text-charcoal/50 mt-1 block">Used to tailor recommendations.</span>
          </label>
          <label className="block">
            <span className="text-sm text-charcoal/70 block mb-2">Choose a photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm text-charcoal/70 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-charcoal file:text-cream file:text-sm"
            />
          </label>
          {file && <p className="text-sm text-charcoal/50">Selected: {file.name}</p>}
          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm">
              <p className="font-medium text-red-800 mb-1">Error</p>
              <p className="text-red-700 mb-2">{error}</p>
              <p className="text-red-600 text-xs">
                {error.includes("OPENAI_API_KEY") || error.includes("OpenAI detection")
                  ? "Step that failed: 1 — AI detection (reading bottles from photo)."
                  : error.includes("Storage upload")
                    ? "Step that failed: 2 — Saving photo to storage."
                    : error.includes("collection_uploads")
                      ? "Step that failed: 3 — Saving upload record to database."
                      : error.includes("OpenAI analysis")
                        ? "Step that failed: 4 — Generating analysis text."
                        : "Check the browser console (F12 → Console) for the full log."}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-3.5 bg-charcoal text-cream text-sm font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-charcoal/90 transition-colors"
          >
            {loading ? "Analyzing…" : "Analyze collection"}
          </button>
        </form>
      )}
    </div>
  );
}
