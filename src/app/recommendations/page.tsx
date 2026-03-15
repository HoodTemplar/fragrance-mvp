"use client";

/**
 * Recommendations: 5 picks, layering, when to wear.
 * From quiz: reads scent-dna-quiz-result (profile + recommendations) from sessionStorage.
 * From collection: reads scent-dna-collection-result from sessionStorage if present, else mock.
 */

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SaveResultButton from "@/components/SaveResultButton";
import RecommendationCard from "@/components/RecommendationCard";
import { trackEvent } from "@/lib/events";
import { MOCK_QUIZ_RESULT, MOCK_COLLECTION_RESULT } from "@/lib/mockData";
import type { ScentProfile } from "@/types";
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
  const [saveData, setSaveData] = useState<unknown>(null);
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
        setSaveType("quiz");
      }
      setSource("quiz");
      return;
    }

    const rawCollection = typeof window !== "undefined" ? sessionStorage.getItem(COLLECTION_RESULT_KEY) : null;
    if (rawCollection) {
      try {
        const data = JSON.parse(rawCollection) as { scentProfile: ScentProfile; recommendedFragrances: RecommendedFragrance[]; layeringSuggestions?: string[]; whenToWear?: string[] };
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
  }, []);

  const fromQuiz = source === "quiz";
  const displayProfile = profile ?? (fromQuiz ? MOCK_QUIZ_RESULT.profile : MOCK_COLLECTION_RESULT.scentProfile);
  const displayRecs = recommendations.length > 0 ? recommendations : (fromQuiz ? MOCK_QUIZ_RESULT.recommendations : MOCK_COLLECTION_RESULT.recommendedFragrances);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
      <p className="text-charcoal/50 text-sm tracking-wide uppercase mb-2">Recommendations</p>
      <h1 className="font-serif text-3xl text-charcoal mb-2">Picks for you</h1>
      <p className="text-charcoal/60 text-sm mb-10">
        Based on {fromQuiz ? "your quiz" : "your collection"}.
      </p>

      <section className="mb-10 p-4 border border-charcoal/10">
        <p className="text-charcoal/50 text-xs uppercase tracking-wide mb-1">Your profile</p>
        <p className="text-charcoal/80 text-sm leading-relaxed">{displayProfile.description}</p>
        <p className="text-charcoal/50 text-xs mt-2">{displayProfile.dominant} · {displayProfile.accent}</p>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl text-charcoal mb-4">5 fragrances to consider next</h2>
        <ul className="space-y-3">
          {displayRecs.map((rec, i) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              index={i}
              pageContext="recommendations_page"
              variant="compact"
            />
          ))}
        </ul>
      </section>

      {layeringSuggestions.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-xl text-charcoal mb-3">Layering suggestions</h2>
          <ul className="space-y-2">
            {layeringSuggestions.map((s, i) => (
              <li key={i} className="text-sm text-charcoal/80 flex items-start gap-2">
                <span className="text-charcoal/40 mt-0.5">·</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {whenToWear.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-xl text-charcoal mb-3">When to wear</h2>
          <ul className="space-y-2">
            {whenToWear.map((s, i) => (
              <li key={i} className="text-sm text-charcoal/80 flex items-start gap-2">
                <span className="text-charcoal/40 mt-0.5">·</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-4 mt-10 pt-6">
      {Boolean(saveData) && <SaveResultButton type={saveType} data={saveData as Parameters<typeof SaveResultButton>[0]["data"]} />}
        <Link href="/" className="px-5 py-2.5 border border-charcoal/20 text-charcoal text-sm hover:bg-charcoal/5 transition-colors">Home</Link>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-charcoal/60 text-sm">Loading…</div>}>
      <RecommendationsContent />
    </Suspense>
  );
}
