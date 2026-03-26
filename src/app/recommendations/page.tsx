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
import { QUIZ_QUESTIONS } from "@/data/quizQuestions";
import type { ScentProfile, QuizResult, CollectionResult } from "@/types";
import type { RecommendedFragrance } from "@/types";
import type { RecommendationRole } from "@/types";
import { mapQuizAnswersToEngine } from "@/lib/quizToEngineMap";

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
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string> | null>(null);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string> | null>(null);
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
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
          const data = JSON.parse(raw) as {
            profile: ScentProfile;
            recommendations?: RecommendationsData;
            quizAnswers?: Record<string, string>;
          };
          setProfile(data.profile ?? null);
          if (data.recommendations) {
            setRecommendations(data.recommendations.recommendedFragrances ?? []);
            setLayeringSuggestions(data.recommendations.layeringSuggestions ?? []);
            setWhenToWear(data.recommendations.whenToWear ?? []);
          } else {
            setRecommendations(MOCK_QUIZ_RESULT.recommendations);
          }
          setQuizAnswers(data.quizAnswers ?? null);
          setDraftAnswers(data.quizAnswers ?? null);
          setSaveData({
            profile: data.profile,
            recommendations: data.recommendations?.recommendedFragrances ?? MOCK_QUIZ_RESULT.recommendations,
          });
          setSaveType("quiz");
        } catch {
          setProfile(MOCK_QUIZ_RESULT.profile);
          setRecommendations(MOCK_QUIZ_RESULT.recommendations);
          setQuizAnswers(null);
          setDraftAnswers(null);
          setSaveData(MOCK_QUIZ_RESULT);
          setSaveType("quiz");
        }
      } else {
        setProfile(MOCK_QUIZ_RESULT.profile);
        setRecommendations(MOCK_QUIZ_RESULT.recommendations);
        setQuizAnswers(null);
        setDraftAnswers(null);
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

        {fromQuiz && quizAnswers && (
          <section className="mb-14 p-5 md:p-6 border border-charcoal/10 rounded-2xl bg-white/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl text-charcoal mb-1">Refine your preferences</h2>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Adjust a few key choices, then re-run recommendations instantly.
                </p>
              </div>
            </div>

            {draftAnswers && (
              <div className="mt-5 space-y-4">
                {(() => {
                  const q8 = QUIZ_QUESTIONS.find((q) => q.id === "q8");
                  const q4 = QUIZ_QUESTIONS.find((q) => q.id === "q4");
                  const q7 = QUIZ_QUESTIONS.find((q) => q.id === "q7");
                  const avoidSweetEnabled = draftAnswers.q7 === "turnoff_sweet";
                  const baseQ7 = quizAnswers.q7 ?? "turnoff_heavy";
                  const setDraft = (patch: Partial<Record<string, string>>) => {
                    setDraftAnswers((prev) => {
                      if (!prev) return prev;
                      // Spread of a Partial can introduce `undefined` in TS; we guarantee patch values are strings.
                      return { ...prev, ...patch } as Record<string, string>;
                    });
                  };

                  return (
                    <>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/60 mb-2">
                          Scent direction
                        </label>
                        <select
                          className="w-full p-3 border border-charcoal/15 rounded-lg bg-white"
                          value={draftAnswers.q8 ?? ""}
                          onChange={(e) => setDraft({ q8: e.target.value })}
                        >
                          {(q8?.options ?? []).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/60 mb-2">
                          Intensity / projection
                        </label>
                        <select
                          className="w-full p-3 border border-charcoal/15 rounded-lg bg-white"
                          value={draftAnswers.q4 ?? ""}
                          onChange={(e) => setDraft({ q4: e.target.value })}
                        >
                          {(q4?.options ?? []).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-charcoal/60">Avoid sweet</p>
                          <p className="text-sm text-charcoal/75 mt-1">
                            {avoidSweetEnabled ? "On (keep it dry & elegant)" : "Off (allow sweetness notes)"}
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={avoidSweetEnabled}
                            onChange={(e) =>
                              setDraft({
                                q7: e.target.checked ? "turnoff_sweet" : baseQ7 === "turnoff_sweet" ? "turnoff_heavy" : baseQ7,
                              })
                            }
                          />
                          <span className="text-sm text-charcoal/80">{(q7?.options ?? []).find((o) => o.value === "turnoff_sweet")?.label ?? "Avoid sweet"}</span>
                        </label>
                      </div>
                    </>
                  );
                })()}

                {refineError && <p className="text-sm text-red-600">{refineError}</p>}

                <button
                  type="button"
                  onClick={async () => {
                    if (!draftAnswers) return;
                    setRefining(true);
                    setRefineError(null);
                    try {
                      const res = await fetch("/api/recommendations/refine", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ quizAnswers: draftAnswers }),
                      });
                      if (!res.ok) {
                        const msg = await res.text().catch(() => "");
                        throw new Error(msg || `Refine failed (${res.status})`);
                      }
                      const data = (await res.json()) as {
                        recommendedFragrances: RecommendedFragrance[];
                        layeringSuggestions: string[];
                        whenToWear: string[];
                      };

                      setRecommendations(data.recommendedFragrances ?? []);
                      setLayeringSuggestions(data.layeringSuggestions ?? []);
                      setWhenToWear(data.whenToWear ?? []);

                      if (typeof window !== "undefined" && profile) {
                        const quizPreferences = mapQuizAnswersToEngine(draftAnswers);
                        sessionStorage.setItem(
                          QUIZ_RESULT_KEY,
                          JSON.stringify({
                            profile,
                            recommendations: {
                              recommendedFragrances: data.recommendedFragrances,
                              layeringSuggestions: data.layeringSuggestions,
                              whenToWear: data.whenToWear,
                            },
                            quizAnswers: draftAnswers,
                            quizPreferences,
                          })
                        );
                      }

                      if (profile) {
                        setSaveData({ profile, recommendations: data.recommendedFragrances });
                      }
                    } catch (e) {
                      setRefineError(e instanceof Error ? e.message : "Refine failed");
                    } finally {
                      setRefining(false);
                    }
                  }}
                  disabled={refining}
                  className="w-full py-3 rounded-lg text-sm font-medium bg-charcoal text-cream hover:opacity-95 disabled:opacity-50 transition-colors"
                >
                  {refining ? "Re-running…" : "Refine & re-run"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Role-based sections */}
        {(() => {
          const recsWithRole = displayRecs.map((rec) => ({
            ...rec,
            _role: rec.role,
          }));

          const targets: Array<{ key: string; title: string; role: RecommendationRole }> = [
            { key: "signature", title: "Signature scent", role: "WILDCARD" },
            { key: "compliment", title: "Compliment puller", role: "BOLD" },
            { key: "date", title: "Date night", role: "NICHE" },
            { key: "professional", title: "Professional", role: "SAFE" },
            { key: "boldniche", title: "Bold/niche", role: "NICHE" },
            { key: "versatile", title: "Versatile", role: "VERSATILE" },
          ];

          const used = new Set<string>();
          const selectedPerTarget = targets.map((t) => {
            const found = recsWithRole.find((r) => r._role === t.role && !used.has(r.id)) ?? null;
            if (found) used.add(found.id);
            return { target: t, rec: found };
          });

          return (
            <section className="mb-16 space-y-10">
              {selectedPerTarget.map(({ target, rec }) => (
                <div key={target.key} className="space-y-4">
                  <h2 className="font-serif text-xl text-charcoal/70">{target.title}</h2>
                  {rec ? (
                    <ul className="space-y-6">
                      <RecommendationCard recommendation={rec} pageContext="recommendations_page" variant="editorial" />
                    </ul>
                  ) : (
                    <p className="text-sm text-charcoal/60 leading-relaxed">
                      {target.key === "boldniche"
                        ? "Your Date-night pick already covers your bold/niche moment."
                        : "No additional pick for this slot."}
                    </p>
                  )}
                </div>
              ))}
            </section>
          );
        })()}

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
