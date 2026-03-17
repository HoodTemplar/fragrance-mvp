"use client";

/**
 * Recommendations: editorial-style layout.
 * Scent identity moment, then 5 fragrances as feature cards with role-based styling.
 */

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SaveResultButton from "@/components/SaveResultButton";
import RecommendationCard from "@/components/RecommendationCard";
import { trackEvent } from "@/lib/events";
import { MOCK_QUIZ_RESULT, MOCK_COLLECTION_RESULT } from "@/lib/mockData";
import type { ScentProfile, QuizResult, CollectionResult } from "@/types";
import type { RecommendedFragrance } from "@/types";

const QUIZ_RESULT_KEY = "scent-dna-quiz-result";
const COLLECTION_RESULT_KEY = "scent-dna-collection-result";

type RecommendationsData = {
  recommendedFragrances: RecommendedFragrance[];
  layeringSuggestions?: string[];
  whenToWear?: string[];
};

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const [source, setSource] = useState<"quiz" | "collection" | null>(null);
  const [profile, setProfile] = useState<ScentProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedFragrance[]>([]);
  const [layeringSuggestions, setLayeringSuggestions] = useState<string[]>([]);
  const [whenToWear, setWhenToWear] = useState<string[]>([]);
  const [saveData, setSaveData] = useState<QuizResult | CollectionResult | null>(null);
  const [saveType, setSaveType] = useState<"quiz" | "collection">("quiz");
  const recommendationViewedFired = useRef(false);

  useEffect(() => {
    if (source !== null && !recommendationViewedFired.current) {
      trackEvent("recommendation_viewed", { context: "recommendations_page" });
      recommendationViewedFired.current = true;
    }
  }, [source]);

  useEffect(() => {
    const fromQuiz = searchParams.get("source") === "quiz";

    if (fromQuiz) {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem(QUIZ_RESULT_KEY) : null;
      if (raw) {
        try {
          const data = JSON.parse(raw) as { profile: ScentProfile; recommendations?: RecommendationsData };
          setProfile(data.profile ?? null);
          if (data.recommendations) {
            setRecommendations(data.recommendations.recommendedFragrances ?? []);
            setLayeringSuggestions(data.recommendations.layeringSuggestions ?? []);
            setWhenToWear(data.recommendations.whenToWear ?? []);
          } else {
            setRecommendations(MOCK_QUIZ_RESULT.recommendations);
          }
          setSaveData({
            profile: data.profile,
            recommendations: data.recommendations?.recommendedFragrances ?? MOCK_QUIZ_RESULT.recommendations,
          });
          setSaveType("quiz");
        } catch {
          setProfile(MOCK_QUIZ_RESULT.profile);
          setRecommendations(MOCK_QUIZ_RESULT.recommendations);
          setSaveData(MOCK_QUIZ_RESULT);
          setSaveType("quiz");
        }
      } else {
        setProfile(MOCK_QUIZ_RESULT.profile);
        setRecommendations(MOCK_QUIZ_RESULT.recommendations);
        setSaveData(MOCK_QUIZ_RESULT);
        setSource("quiz");
      }
      setSource("quiz");
      return;
    }

    const rawCollection = typeof window !== "undefined" ? sessionStorage.getItem(COLLECTION_RESULT_KEY) : null;
    if (rawCollection) {
      try {
        const data = JSON.parse(rawCollection) as CollectionResult;
        setProfile(data.scentProfile ?? null);
        setRecommendations(data.recommendedFragrances ?? []);
        setLayeringSuggestions(data.layeringSuggestions ?? []);
        setWhenToWear(data.whenToWear ?? []);
        setSaveData(data);
        setSaveType("collection");
      } catch {
        setProfile(MOCK_COLLECTION_RESULT.scentProfile);
        setRecommendations(MOCK_COLLECTION_RESULT.recommendedFragrances);
        setLayeringSuggestions([]);
        setWhenToWear([]);
        setSaveData(MOCK_COLLECTION_RESULT);
        setSaveType("collection");
      }
    } else {
      setProfile(MOCK_COLLECTION_RESULT.scentProfile);
      setRecommendations(MOCK_COLLECTION_RESULT.recommendedFragrances);
      setLayeringSuggestions([]);
      setWhenToWear([]);
      setSaveData(MOCK_COLLECTION_RESULT);
      setSaveType("collection");
    }
    setSource("collection");
  }, [searchParams]);

  const fromQuiz = source === "quiz";

  const displayProfile =
    profile ?? (fromQuiz ? MOCK_QUIZ_RESULT.profile : MOCK_COLLECTION_RESULT.scentProfile);

  const displayRecs =
    recommendations.length > 0
      ? recommendations
      : fromQuiz
        ? MOCK_QUIZ_RESULT.recommendations
        : MOCK_COLLECTION_RESULT.recommendedFragrances;

  const identityTitle = displayProfile?.archetype?.name?.toUpperCase() ?? "Your picks";
  const identityDescription = displayProfile?.archetype?.characterDescription ?? displayProfile?.description ?? "";

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20 animate-fade-in">
        {/* Scent identity — editorial moment */}
        <header className="mb-16 md:mb-20">
          <p className="text-charcoal/50 text-xs tracking-[0.2em] uppercase mb-4">
            {fromQuiz ? "Your recommendations" : "Collection recommendations"}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-charcoal mb-6 leading-tight">
            {identityTitle}
          </h1>
          <p className="text-charcoal/75 text-lg leading-relaxed max-w-xl">
            {identityDescription}
          </p>
          {displayProfile && !displayProfile.archetype && (
            <p className="text-charcoal/50 text-sm mt-4">
              {displayProfile.dominant} · {displayProfile.accent}
            </p>
          )}
        </header>

        {/* 5 fragrances — feature cards */}
        <section className="mb-16">
          <h2 className="font-serif text-xl text-charcoal/70 mb-8">
            5 fragrances to consider
          </h2>
          <ul className="space-y-6">
            {displayRecs.map((rec, i) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                index={i}
                pageContext="recommendations_page"
                variant="editorial"
              />
            ))}
          </ul>
        </section>

        {/* Layering — minimal */}
        {layeringSuggestions.length > 0 && (
          <section className="mb-12 pt-8 border-t border-charcoal/10">
            <h2 className="font-serif text-lg text-charcoal mb-4">Layering ideas</h2>
            <ul className="space-y-3">
              {layeringSuggestions.map((s, i) => (
                <li key={i} className="text-charcoal/80 text-sm leading-relaxed flex items-start gap-3">
                  <span className="text-gold mt-0.5">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* When to wear — minimal */}
        {whenToWear.length > 0 && (
          <section className="mb-12 pt-8 border-t border-charcoal/10">
            <h2 className="font-serif text-lg text-charcoal mb-4">When to wear</h2>
            <ul className="space-y-3">
              {whenToWear.map((s, i) => (
                <li key={i} className="text-charcoal/80 text-sm leading-relaxed flex items-start gap-3">
                  <span className="text-gold mt-0.5">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 pt-8 border-t border-charcoal/10">
          {saveData && <SaveResultButton type={saveType} data={saveData} />}
          <Link
            href="/"
            className="px-5 py-2.5 border border-charcoal/20 text-charcoal text-sm rounded-lg hover:bg-charcoal/5 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-12 text-charcoal/60 text-sm">
          Loading…
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
