"use client";

/**
 * Shown after a collection photo is uploaded and saved. Shows an “analyzing”
 * experience then redirects to results (MVP: placeholder analysis).
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const REDIRECT_DELAY_MS = 3200;
const STEPS = [
  "Photo received",
  "Analyzing your collection",
  "Building your scent profile",
];

export default function ResultsLoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uploadId = searchParams.get("upload_id");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const stepInterval = REDIRECT_DELAY_MS / STEPS.length;
    const stepTimer = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, stepInterval);
    return () => clearInterval(stepTimer);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/results?source=upload");
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen bg-charcoal text-cream flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <p className="text-cream/50 text-xs tracking-[0.2em] uppercase mb-6">
          Analysis in progress
        </p>
        <h1 className="font-serif text-2xl md:text-3xl font-light tracking-tight mb-12 text-center">
          Analyzing your collection
        </h1>

        <ul className="space-y-5 mb-14">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${
                i <= step ? "opacity-100" : "opacity-40"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                  i < step
                    ? "border-cream bg-cream text-charcoal"
                    : i === step
                      ? "border-cream text-cream"
                      : "border-cream/30 text-cream/50"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className="text-cream/90">{label}</span>
            </li>
          ))}
        </ul>

        <div className="h-px bg-cream/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-cream/30 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${((step + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-cream/40 text-xs text-center mt-6">
          This usually takes a few seconds
        </p>
      </div>
    </div>
  );
}
