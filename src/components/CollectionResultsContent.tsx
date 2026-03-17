"use client";

/**
 * Displays collection results. Uses AI result from sessionStorage when present (after upload flow),
 * otherwise uses the server-provided default (mock or fallback).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SaveResultButton from "@/components/SaveResultButton";
import ShareResults from "@/components/ShareResults";
import RecommendationCard from "@/components/RecommendationCard";
import { trackEvent } from "@/lib/events";
import type { CollectionResult } from "@/types";

const RESULT_KEY = "scent-dna-collection-result";

interface Props {
  initialResult: CollectionResult;
  fromUpload?: boolean;
}

export default function CollectionResultsContent({ initialResult, fromUpload }: Props) {
  const [r, setR] = useState<CollectionResult>(initialResult);
  const recommendationViewedFired = useRef(false);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? sessionStorage.getItem(RESULT_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored) as CollectionResult;
        setR(parsed);
        sessionStorage.removeItem(RESULT_KEY);
      }
    } catch {
      // keep initialResult
    }
  }, [initialResult]);

  useEffect(() => {
    if (r.recommendedFragrances?.length && !recommendationViewedFired.current) {
      trackEvent("recommendation_viewed", { context: "collection_results" });
      recommendationViewedFired.current = true;
    }
  }, [r.recommendedFragrances?.length]);

  const breakdown = r.scoreBreakdown;

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-charcoal text-cream px-4 pt-10 pb-12 md:pt-14 md:pb-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-cream/50 text-xs tracking-[0.2em] uppercase mb-2">Collection results</p>
          <h1 className="font-serif text-2xl md:text-3xl font-light tracking-tight mb-2">Your collection</h1>
          {fromUpload && (
            <p className="text-cream/60 text-sm mb-6">Your photo was received. Here’s your analysis.</p>
          )}
          <div className="mt-8 flex items-baseline gap-3">
            <span className="font-serif text-5xl md:text-6xl font-light tabular-nums">{r.score}</span>
            <span className="text-cream/60 text-lg">out of 100</span>
          </div>
          <p className="text-cream/50 text-sm mt-1">Collection score</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
        {breakdown && (
          <section className="mb-12 p-4 md:p-5 border border-charcoal/10 bg-white">
            <h2 className="font-serif text-lg text-charcoal mb-3">How your score was calculated</h2>
            <p className="text-charcoal/60 text-sm mb-4">
              Simple, transparent rules. Total = variety + versatility + season coverage + occasion coverage + low redundancy (max 100).
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between gap-4">
                <span className="text-charcoal/80">Variety (scent families)</span>
                <span className="shrink-0 font-medium text-charcoal">{breakdown.variety.points}/{breakdown.variety.max}</span>
              </li>
              <li className="text-charcoal/50 text-xs pl-1">{breakdown.variety.explanation}</li>
              <li className="flex justify-between gap-4">
                <span className="text-charcoal/80">Versatility (all-rounders)</span>
                <span className="shrink-0 font-medium text-charcoal">{breakdown.versatility.points}/{breakdown.versatility.max}</span>
              </li>
              <li className="text-charcoal/50 text-xs pl-1">{breakdown.versatility.explanation}</li>
              <li className="flex justify-between gap-4">
                <span className="text-charcoal/80">Season coverage</span>
                <span className="shrink-0 font-medium text-charcoal">{breakdown.seasonCoverage.points}/{breakdown.seasonCoverage.max}</span>
              </li>
              <li className="text-charcoal/50 text-xs pl-1">{breakdown.seasonCoverage.explanation}</li>
              <li className="flex justify-between gap-4">
                <span className="text-charcoal/80">Occasion coverage</span>
                <span className="shrink-0 font-medium text-charcoal">{breakdown.occasionCoverage.points}/{breakdown.occasionCoverage.max}</span>
              </li>
              <li className="text-charcoal/50 text-xs pl-1">{breakdown.occasionCoverage.explanation}</li>
              <li className="flex justify-between gap-4">
                <span className="text-charcoal/80">Low redundancy</span>
                <span className="shrink-0 font-medium text-charcoal">{breakdown.lowRedundancy.points}/{breakdown.lowRedundancy.max}</span>
              </li>
              <li className="text-charcoal/50 text-xs pl-1">{breakdown.lowRedundancy.explanation}</li>
            </ul>
            <p className="text-charcoal/50 text-xs mt-4 pt-3 border-t border-charcoal/10">See docs/SCORING.md for full rules in plain English.</p>
          </section>
        )}

        <section className="mb-12">
          <h2 className="font-serif text-xl text-charcoal mb-2">Scent DNA profile</h2>
          <p className="text-charcoal/60 text-sm mb-4 leading-relaxed">{r.scentProfile.description}</p>
          {r.whoThisSuits && (
            <p className="text-charcoal/80 text-sm mb-4 italic">Who this suits: {r.whoThisSuits}</p>
          )}
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-charcoal/5 border border-charcoal/10">
              <dt className="text-charcoal/50 text-xs uppercase tracking-wide">Dominant</dt>
              <dd className="font-medium text-charcoal mt-0.5">{r.scentProfile.dominant}</dd>
            </div>
            <div className="p-3 bg-charcoal/5 border border-charcoal/10">
              <dt className="text-charcoal/50 text-xs uppercase tracking-wide">Secondary</dt>
              <dd className="font-medium text-charcoal mt-0.5">{r.scentProfile.secondary}</dd>
            </div>
            <div className="p-3 bg-charcoal/5 border border-charcoal/10">
              <dt className="text-charcoal/50 text-xs uppercase tracking-wide">Accent</dt>
              <dd className="font-medium text-charcoal mt-0.5">{r.scentProfile.accent}</dd>
            </div>
          </dl>
          {r.overallVibe && (
            <div className="mt-4 p-4 bg-charcoal/5 border border-charcoal/10">
              <h3 className="text-charcoal/70 text-xs uppercase tracking-wide mb-2">Overall vibe</h3>
              <p className="text-charcoal/80 text-sm leading-relaxed">{r.overallVibe}</p>
            </div>
          )}
          {r.howItWears && (
            <div className="mt-4 p-4 bg-charcoal/5 border border-charcoal/10">
              <h3 className="text-charcoal/70 text-xs uppercase tracking-wide mb-2">How it wears</h3>
              <p className="text-charcoal/80 text-sm leading-relaxed">{r.howItWears}</p>
            </div>
          )}
          {(r.bestSeasons?.length ?? 0) > 0 && (
            <div className="mt-4">
              <h3 className="text-charcoal/70 text-xs uppercase tracking-wide mb-2">Best seasons</h3>
              <div className="flex flex-wrap gap-2">
                {r.bestSeasons!.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 text-sm border border-charcoal/15 text-charcoal/80 bg-white">{s}</span>
                ))}
              </div>
            </div>
          )}
          {(r.bestOccasions?.length ?? 0) > 0 && (
            <div className="mt-4">
              <h3 className="text-charcoal/70 text-xs uppercase tracking-wide mb-2">Best occasions</h3>
              <div className="flex flex-wrap gap-2">
                {r.bestOccasions!.map((o, i) => (
                  <span key={i} className="px-2.5 py-1 text-sm border border-charcoal/15 text-charcoal/80 bg-white">{o}</span>
                ))}
              </div>
            </div>
          )}
          {r.whyItWorks && (
            <p className="text-charcoal/80 text-sm mt-4 leading-relaxed"><strong className="text-charcoal">Why it works:</strong> {r.whyItWorks}</p>
          )}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="font-serif text-xl text-charcoal mb-3">Strengths</h2>
            <ul className="space-y-2">
              {r.strengths.map((s, i) => (
                <li key={i} className="text-sm text-charcoal/80 flex items-start gap-2">
                  <span className="text-charcoal/40 mt-0.5">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-xl text-charcoal mb-3">Weaknesses</h2>
            <ul className="space-y-2">
              {r.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-charcoal/80 flex items-start gap-2">
                  <span className="text-charcoal/40 mt-0.5">·</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-xl text-charcoal mb-3">What your collection is missing</h2>
          <div className="flex flex-wrap gap-2">
            {r.missingCategories.map((cat, i) => (
              <span key={i} className="px-3 py-1.5 text-sm border border-charcoal/20 text-charcoal/80 bg-white">{cat}</span>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-xl text-charcoal mb-4">Recommended next purchases</h2>
          <ul className="space-y-3">
            {r.recommendedFragrances.map((rec, i) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                index={i}
                pageContext="collection_results"
                variant="default"
              />
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-xl text-charcoal mb-3">Suggested layering combinations</h2>
          <ul className="space-y-2">
            {r.layeringSuggestions.map((s, i) => (
              <li key={i} className="text-sm text-charcoal/80 flex items-start gap-2">
                <span className="text-charcoal/40 mt-0.5">·</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        {(r.similarFragrances?.length ?? 0) > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-xl text-charcoal mb-3">Similar fragrances & you may also like</h2>
            <ul className="space-y-2">
              {r.similarFragrances!.map((s, i) => (
                <li key={i} className="text-sm text-charcoal/80 flex items-start gap-2">
                  <span className="text-charcoal/40 mt-0.5">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-12">
          <h2 className="font-serif text-xl text-charcoal mb-3">Best times & occasions to wear what you own</h2>
          <ul className="space-y-2">
            {r.whenToWear.map((s, i) => (
              <li key={i} className="text-sm text-charcoal/80 flex items-start gap-2">
                <span className="text-charcoal/40 mt-0.5">·</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-charcoal/10">
          <SaveResultButton type="collection" data={r} />
          <ShareResults />
          <Link href="/" className="px-5 py-2.5 border border-charcoal/20 text-charcoal text-sm hover:bg-charcoal/5 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}
