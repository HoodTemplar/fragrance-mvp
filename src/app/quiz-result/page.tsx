"use client";

/**
 * Quiz result — shows the generated scent profile. Reads from sessionStorage (set by quiz page).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ScentProfile } from "@/types";

const QUIZ_RESULT_KEY = "scent-dna-quiz-result";

export default function QuizResultPage() {
  const [profile, setProfile] = useState<ScentProfile | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem(QUIZ_RESULT_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { profile: ScentProfile; recommendations?: unknown };
        setProfile(parsed.profile ?? null);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-charcoal/70 mb-4">No result found. Complete the quiz to see your scent profile.</p>
        <Link href="/quiz" className="text-charcoal underline">
          Take the quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <div className="max-w-xl mx-auto px-4 py-16 md:py-20">
        <p className="text-cream/50 text-xs tracking-[0.2em] uppercase mb-2">
          Your Scent DNA
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-4">
          Your scent profile
        </h1>
        <p className="text-cream/70 text-sm mb-12">
          Based on your answers — a snapshot of how you wear scent.
        </p>

        <section className="p-6 md:p-8 border border-cream/20 mb-10">
          <p className="text-cream/50 text-xs uppercase tracking-wide mb-4">
            Profile
          </p>
          <p className="text-cream/90 text-base leading-relaxed mb-6">
            {profile.description}
          </p>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-cream/50">Dominant</dt>
              <dd className="text-cream font-medium">{profile.dominant}</dd>
            </div>
            <div>
              <dt className="text-cream/50">Occasion</dt>
              <dd className="text-cream font-medium">{profile.secondary}</dd>
            </div>
            <div>
              <dt className="text-cream/50">Accent</dt>
              <dd className="text-cream font-medium">{profile.accent}</dd>
            </div>
          </dl>
        </section>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/recommendations?source=quiz"
            className="inline-block px-6 py-3.5 bg-cream text-charcoal text-sm font-medium text-center hover:bg-cream/90 transition-colors"
          >
            See recommendations
          </Link>
          <Link
            href="/"
            className="inline-block px-6 py-3.5 border border-cream/30 text-cream/90 text-sm text-center hover:bg-cream/10 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
