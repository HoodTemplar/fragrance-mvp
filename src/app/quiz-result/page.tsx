"use client";

/**
 * Quiz result — reveals Scent DNA archetype and profile.
 * Reads from sessionStorage (set by quiz page). Premium, intentional structure.
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
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <p className="text-charcoal/70 mb-4">No result found. Complete the quiz to see your scent profile.</p>
          <Link href="/quiz" className="text-charcoal underline font-medium">
            Take the quiz
          </Link>
        </div>
      </div>
    );
  }

  const archetype = profile.archetype;

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <div className="max-w-xl mx-auto px-4 py-12 md:py-16">
        {/* Small label */}
        <p className="text-cream/50 text-xs tracking-[0.2em] uppercase mb-6">
          Your Scent DNA
        </p>

        {archetype ? (
          <>
            {/* Hero: archetype name */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-6 leading-tight text-cream">
              {archetype.name}
            </h1>
            {/* Character description */}
            <p className="text-cream/80 text-base md:text-lg leading-relaxed mb-12 max-w-lg">
              {archetype.characterDescription}
            </p>

            {/* Your profile at a glance (compact) */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-cream/70 mb-12">
              <span><span className="text-cream/50">Dominant</span> {profile.dominant}</span>
              <span><span className="text-cream/50">Occasion</span> {profile.secondary}</span>
              <span><span className="text-cream/50">Accent</span> {profile.accent}</span>
            </div>

            {/* Sections: families, seasons, occasions */}
            <section className="border-t border-cream/15 pt-8 mb-8">
              <h2 className="text-cream/50 text-xs uppercase tracking-wider mb-3">Your top families</h2>
              <p className="text-cream/90 text-sm leading-relaxed">
                {archetype.fragranceFamilies.join(", ")}
              </p>
            </section>
            <section className="border-t border-cream/15 pt-6 mb-8">
              <h2 className="text-cream/50 text-xs uppercase tracking-wider mb-3">Best seasons</h2>
              <p className="text-cream/90 text-sm leading-relaxed">
                {archetype.seasonsWhereItShines.join(", ")}
              </p>
            </section>
            <section className="border-t border-cream/15 pt-6 mb-12">
              <h2 className="text-cream/50 text-xs uppercase tracking-wider mb-3">Best occasions</h2>
              <p className="text-cream/90 text-sm leading-relaxed">
                {archetype.typicalOccasions.join(", ")}
              </p>
            </section>
          </>
        ) : (
          /* Fallback when no archetype (legacy profile) */
          <>
            <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-4 text-cream">
              Your scent profile
            </h1>
            <p className="text-cream/70 text-sm mb-10">
              Based on your answers — a snapshot of how you wear scent.
            </p>
            <section className="p-6 md:p-8 border border-cream/20 mb-10">
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
          </>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/recommendations?source=quiz"
            className="inline-block px-6 py-3.5 bg-cream text-charcoal text-sm font-medium text-center hover:bg-cream/95 transition-colors rounded-sm"
          >
            See recommendations
          </Link>
          <Link
            href="/"
            className="inline-block px-6 py-3.5 border border-cream/30 text-cream/90 text-sm text-center hover:bg-cream/10 transition-colors rounded-sm"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
