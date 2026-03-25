"use client";

/**
 * Scent DNA quiz — scene-based questions with neutral answer options.
 * Click triggers card pulse and smooth page background transition to match selection.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_QUESTIONS, type ThemeHint } from "@/data/quizQuestions";
import { submitQuiz } from "@/app/actions/quiz";
import { trackEvent } from "@/lib/events";

function makeSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const QUIZ_RESULT_KEY = "scent-dna-quiz-result";
const TOTAL = QUIZ_QUESTIONS.length;

function getThemeFromHint(hint: ThemeHint | undefined): "dark" | "fresh" | "warm" {
  if (hint && hint !== "neutral") return hint;
  return "dark";
}

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => makeSessionId());
  const [theme, setTheme] = useState<"dark" | "fresh" | "warm">("dark");
  const [pressingValue, setPressingValue] = useState<string | null>(null);

  const current = QUIZ_QUESTIONS[step];
  const isLast = step === TOTAL - 1;
  const progressPct = ((step + 1) / TOTAL) * 100;

  const currentTheme = useMemo(() => {
    const currentAnswer = answers[current.id];
    const opt = current.options.find((o) => o.value === currentAnswer);
    return getThemeFromHint(opt?.themeHint);
  }, [current.id, current.options, answers]);

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-theme-transition", "true");
  }, [theme]);

  const handleSelect = useCallback((value: string) => {
    setPressingValue(value);
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
    setError(null);
    setTimeout(() => setPressingValue(null), 280);
  }, [current.id]);

  async function handleNext() {
    if (isLast) {
      setSubmitting(true);
      setError(null);
      try {
        const result = await submitQuiz(sessionId, answers);
        if (result.error && !result.profile) {
          setError(result.error);
          setSubmitting(false);
          return;
        }
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            QUIZ_RESULT_KEY,
            JSON.stringify({
              profile: result.profile,
              recommendations: result.recommendations,
            })
          );
        }
        trackEvent("quiz_completed", { sessionId });
        router.push("/quiz-result");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setSubmitting(false);
      }
      return;
    }
    setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  const canNext = answers[current.id] != null;

  return (
    <div
      className="min-h-screen bg-theme-gradient transition-colors duration-700 ease-out"
      style={{
        backgroundColor: "var(--theme-bg)",
        color: "var(--theme-text)",
      }}
    >
      <div className="max-w-xl mx-auto px-4 py-10 md:py-14">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between items-baseline text-sm mb-2">
            <span
              className="tracking-[0.2em] uppercase"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Scent DNA
            </span>
            <span
              className="tabular-nums"
              style={{ color: "var(--theme-text-muted)" }}
            >
              {step + 1} of {TOTAL}
            </span>
          </div>
          <div className="quiz-progress-track h-1">
            <div
              className="quiz-progress-fill"
              style={{
                width: `${progressPct}%`,
                backgroundColor: "var(--theme-accent)",
              }}
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={TOTAL}
            />
          </div>
        </div>

        {/* Scene + answer cards */}
        <div key={step} className="animate-quiz-fade-in">
          <h1
            className="font-serif text-2xl md:text-3xl lg:text-4xl font-light tracking-tight mb-2 leading-tight"
            style={{ color: "var(--theme-text)" }}
          >
            {current.sceneHeadline}
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--theme-text-muted)" }}
            aria-hidden
          >
            {current.question}
          </p>

          <ul className="space-y-4 mb-12">
            {current.options.map((opt) => {
              const isSelected = answers[current.id] === opt.value;
              const isPressing = pressingValue === opt.value;

              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`quiz-answer-card w-full text-left px-6 py-5 rounded-xl border-2 ${
                      isSelected ? "quiz-answer-card-selected" : ""
                    } ${isPressing ? "animate-card-press" : ""}`}
                  >
                    <span className="block font-medium text-base md:text-lg leading-snug text-neutral-900">
                      {opt.label}
                    </span>
                    {opt.subtitle && (
                      <span className="block text-sm mt-1 leading-relaxed text-neutral-500">
                        {opt.subtitle}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {error && (
          <p className="text-red-300/90 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-3.5 border text-sm rounded-lg transition-colors duration-200 hover:opacity-90"
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text-muted)",
              }}
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext || submitting}
            className="flex-1 py-3.5 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:opacity-95 active:scale-[0.99]"
            style={{
              backgroundColor: "var(--theme-accent)",
              color: theme === "fresh" ? "#1a2529" : "var(--theme-bg)",
            }}
          >
            {submitting
              ? "Building your profile…"
              : isLast
                ? "See my result"
                : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
