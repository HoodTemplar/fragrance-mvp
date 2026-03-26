"use client";

/**
 * Quiz result — cinematic character reveal with identity graphic.
 * Large centered title, custom gradient/orb graphic per archetype, smooth transition to recommendations CTA.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import IdentityGraphic from "@/components/IdentityGraphic";
import type { ScentProfile } from "@/types";
import type { EngineReadyPreferences } from "@/lib/quizToEngineMap";
import { deriveScentDnaFromQuiz } from "@/lib/scentDnaFromQuiz";

const QUIZ_RESULT_KEY = "scent-dna-quiz-result";

export default function QuizResultPage() {
  const [profile, setProfile] = useState<ScentProfile | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string> | null>(null);
  const [quizPreferences, setQuizPreferences] = useState<EngineReadyPreferences | null>(null);

  useEffect(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-transition");
    try {
      const raw =
        typeof window !== "undefined"
          ? sessionStorage.getItem(QUIZ_RESULT_KEY)
          : null;
      if (raw) {
        const parsed = JSON.parse(raw) as {
          profile: ScentProfile;
          recommendations?: unknown;
          quizAnswers?: Record<string, string>;
          quizPreferences?: EngineReadyPreferences;
        };
        setProfile(parsed.profile ?? null);
        setQuizAnswers(parsed.quizAnswers ?? null);
        setQuizPreferences(parsed.quizPreferences ?? null);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <p className="text-cream/70 mb-4">
            No result found. Complete the quiz to see your scent profile.
          </p>
          <Link
            href="/quiz"
            className="text-gold font-medium hover:underline"
          >
            Take the quiz
          </Link>
        </div>
      </div>
    );
  }

  const archetype = profile.archetype;
  const scentDna = deriveScentDnaFromQuiz(profile, quizAnswers, quizPreferences);

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <div className="max-w-2xl mx-auto px-4 py-16 md:py-24">
        {/* Small label */}
        <p className="text-cream/50 text-xs tracking-[0.25em] uppercase mb-8 animate-fade-in text-center md:text-left">
          Scent identity
        </p>

        {archetype ? (
          <>
            {/* Cinematic reveal: graphic behind + identity header + description */}
            <div className="relative min-h-[320px] md:min-h-[380px] flex flex-col items-center justify-center text-center mb-16 animate-slide-up">
              <IdentityGraphic archetypeId={archetype.id} className="rounded-2xl" />

              <div className="relative z-10 px-2">
                <p className="text-cream/60 text-xs tracking-[0.25em] uppercase mb-4">
                  Your Scent identity
                </p>
                <h1
                  className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[1.1] text-cream mb-6"
                  style={{ letterSpacing: "0.04em" }}
                >
                  {archetype.name.toUpperCase()}
                </h1>
                <p className="text-cream/85 text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
                  {archetype.characterDescription}
                </p>
              </div>
            </div>

            {/* Profile at a glance — minimal */}
            <div
              className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-cream/60 mb-16 border-t border-cream/10 pt-8 animate-fade-in justify-center md:justify-start"
              style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
            >
              <span>
                <span className="text-cream/40">Dominant</span>{" "}
                <span className="text-cream/80">{profile.dominant}</span>
              </span>
              <span>
                <span className="text-cream/40">Occasion</span>{" "}
                <span className="text-cream/80">{profile.secondary}</span>
              </span>
              <span>
                <span className="text-cream/40">Accent</span>{" "}
                <span className="text-cream/80">{profile.accent}</span>
              </span>
            </div>

            {/* Personality-style description + Scent DNA */}
            <section className="mb-10 border-t border-cream/10 pt-8">
              <h2 className="text-cream/40 text-xs uppercase tracking-widest mb-3">
                Personality-style reads
              </h2>
              <p className="text-cream/90 text-sm leading-relaxed max-w-xl">
                {profile.description}
                {" "}
                <span className="text-cream/75">
                  Your DNA lands on {scentDna.texture.toLowerCase()} texture with {scentDna.darkness.toLowerCase()} energy,
                  balanced by {scentDna.sweetness.toLowerCase()}.
                </span>
              </p>
            </section>

            <section className="mb-10 border border-cream/10 rounded-2xl p-6">
              <h2 className="text-cream/40 text-xs uppercase tracking-widest mb-5">
                Scent DNA
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-cream/50 text-xs uppercase tracking-widest mb-1">Families</p>
                  <p className="text-cream/90 text-sm leading-relaxed">{scentDna.families.join(", ")}</p>
                </div>
                <div>
                  <p className="text-cream/50 text-xs uppercase tracking-widest mb-1">Accords</p>
                  <p className="text-cream/90 text-sm leading-relaxed">{scentDna.accords.join(", ")}</p>
                </div>
                <div>
                  <p className="text-cream/50 text-xs uppercase tracking-widest mb-1">Sweetness</p>
                  <p className="text-cream/90 text-sm leading-relaxed">{scentDna.sweetness}</p>
                </div>
                <div>
                  <p className="text-cream/50 text-xs uppercase tracking-widest mb-1">Darkness</p>
                  <p className="text-cream/90 text-sm leading-relaxed">{scentDna.darkness}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-cream/50 text-xs uppercase tracking-widest mb-1">Texture</p>
                  <p className="text-cream/90 text-sm leading-relaxed">{scentDna.texture}</p>
                </div>
              </div>
            </section>
            <section className="border-t border-cream/10 pt-6 mb-8">
              <h2 className="text-cream/40 text-xs uppercase tracking-widest mb-3">
                Best seasons
              </h2>
              <p className="text-cream/90 text-sm leading-relaxed">
                {archetype.seasonsWhereItShines.join(", ")}
              </p>
            </section>
            <section className="border-t border-cream/10 pt-6 mb-14">
              <h2 className="text-cream/40 text-xs uppercase tracking-widest mb-3">
                Best occasions
              </h2>
              <p className="text-cream/90 text-sm leading-relaxed">
                {archetype.typicalOccasions.join(", ")}
              </p>
            </section>
          </>
        ) : (
          /* Fallback when no archetype (legacy profile) */
          <>
            <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight mb-6 text-cream">
              Your scent profile
            </h1>
            <p className="text-cream/70 text-lg mb-10 max-w-lg">
              Based on your answers — a snapshot of how you wear scent.
            </p>
            <section className="p-8 border border-cream/15 mb-12 rounded-lg">
              <p className="text-cream/90 text-base leading-relaxed mb-6">
                {profile.description}
              </p>
              <dl className="space-y-3 text-sm">
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

            <section className="p-6 border border-cream/10 mb-12 rounded-2xl">
              <h2 className="text-cream/40 text-xs uppercase tracking-widest mb-5">
                Scent DNA
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-cream/50 text-xs uppercase tracking-widest mb-1">Families</p>
                  <p className="text-cream/90 text-sm leading-relaxed">{scentDna.families.join(", ")}</p>
                </div>
                <div>
                  <p className="text-cream/50 text-xs uppercase tracking-widest mb-1">Accords</p>
                  <p className="text-cream/90 text-sm leading-relaxed">{scentDna.accords.join(", ")}</p>
                </div>
                <div>
                  <p className="text-cream/50 text-xs uppercase tracking-widest mb-1">Sweetness</p>
                  <p className="text-cream/90 text-sm leading-relaxed">{scentDna.sweetness}</p>
                </div>
                <div>
                  <p className="text-cream/50 text-xs uppercase tracking-widest mb-1">Darkness</p>
                  <p className="text-cream/90 text-sm leading-relaxed">{scentDna.darkness}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-cream/50 text-xs uppercase tracking-widest mb-1">Texture</p>
                  <p className="text-cream/90 text-sm leading-relaxed">{scentDna.texture}</p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Transition into recommendations: CTA section with subtle fade */}
        <div
          className="flex flex-col sm:flex-row gap-4 animate-fade-in border-t border-cream/10 pt-10"
          style={{ animationDelay: "0.35s", animationFillMode: "backwards" }}
        >
          <Link
            href="/recommendations?source=quiz"
            className="inline-block px-8 py-4 bg-gold text-charcoal text-sm font-medium text-center rounded-lg hover:bg-gold/90 transition-colors duration-300"
          >
            See recommendations
          </Link>
          <Link
            href="/"
            className="inline-block px-8 py-4 border border-cream/25 text-cream/90 text-sm text-center rounded-lg hover:bg-cream/10 transition-colors duration-200"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
