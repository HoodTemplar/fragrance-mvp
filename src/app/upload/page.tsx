"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { uploadCollectionPhoto } from "@/lib/storage";
import { createCollectionUpload } from "@/lib/collectionUploads";
import { analyzeCollectionImage, generateCollectionAnalysis } from "@/app/actions/analyze";
import { trackEvent } from "@/lib/events";
import { compressImage } from "@/lib/imageCompression";

const AI_UNAVAILABLE_MESSAGE = "AI analysis temporarily unavailable. Please try again.";
const NOT_AN_IMAGE_MESSAGE = "Please choose an image file (e.g. JPEG, PNG, or WebP).";
const COMPRESSION_FAILED_MESSAGE = "This file couldn't be processed as an image. Please try a different photo (JPEG, PNG, or WebP).";
const STILL_TOO_LARGE_MESSAGE = "Image is still too large after compression. Try a smaller or less detailed photo.";

const STORAGE_DETECTIONS = "scent-dna-upload-detections";
const STORAGE_IMAGE = "scent-dna-upload-image";
const STORAGE_MIME = "scent-dna-upload-mime";
const STORAGE_GENDER_PREF = "scent-dna-upload-gender-preference";
const RESULT_KEY = "scent-dna-collection-result";

/** Allowed image MIME types for upload. */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function isImageFile(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  if (ALLOWED_IMAGE_TYPES.includes(type)) return true;
  const name = (file.name || "").toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/** Max file size before compression (10MB). */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
/** Reject only if still over this after compression (keeps under typical server limits). */
const MAX_SIZE_AFTER_COMPRESSION_BYTES = 4.5 * 1024 * 1024;

const GENDER_OPTIONS = [
  { value: "open", label: "Open — any" },
  { value: "masculine", label: "Masculine" },
  { value: "feminine", label: "Feminine" },
  { value: "unisex", label: "Unisex" },
] as const;

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [genderPreference, setGenderPreference] = useState<string>("open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    if (chosen) {
      if (!isImageFile(chosen)) {
        setError(NOT_AN_IMAGE_MESSAGE);
        setFile(null);
        return;
      }
      if (chosen.size > MAX_FILE_SIZE_BYTES) {
        setError(`Image must be 10MB or smaller. This file is ${(chosen.size / 1024 / 1024).toFixed(1)}MB.`);
        setFile(null);
      } else {
        setFile(chosen);
        setError(null);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !user) return;
    if (!isImageFile(file)) {
      setError(NOT_AN_IMAGE_MESSAGE);
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // Step 1: Compress and resize on the client (longest side 1024px, JPEG ~72%).
      // The server action receives only this compressed payload, not the original file.
      let compressed;
      try {
        compressed = await compressImage(file);
      } catch {
        setError(COMPRESSION_FAILED_MESSAGE);
        setLoading(false);
        return;
      }

      if (compressed.blob.size > MAX_SIZE_AFTER_COMPRESSION_BYTES) {
        setError(STILL_TOO_LARGE_MESSAGE);
        setLoading(false);
        return;
      }

      const { base64, mimeType } = compressed;
      console.log("[upload flow] Client: Step 1 (compressed) — sending image data to server");

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

      // Step 2: storage upload (use compressed image)
      const compressedFile = new File([compressed.blob], (file.name.replace(/\.[^.]+$/, "") || "photo") + ".jpg", { type: "image/jpeg" });
      const path = await uploadCollectionPhoto(supabase, compressedFile);
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
      setError(message || "Something went wrong. Please try another image or try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 md:py-24">
      <p className="text-charcoal/50 text-sm tracking-wide uppercase mb-2">Upload</p>
      <h1 className="font-serif text-3xl text-charcoal mb-4">Your collection</h1>
      <p className="text-charcoal/60 text-sm leading-relaxed mb-10">
        Add a photo of your fragrance bottles (up to 10MB). We’ll analyze your collection and show your score and recommendations.
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
                {error === NOT_AN_IMAGE_MESSAGE
                  ? "Only image files (JPEG, PNG, WebP, GIF) are supported."
                  : error === COMPRESSION_FAILED_MESSAGE || error === STILL_TOO_LARGE_MESSAGE
                  ? "Try a different photo or a smaller file."
                  : error.includes("OPENAI_API_KEY") || error.includes("OpenAI detection")
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
