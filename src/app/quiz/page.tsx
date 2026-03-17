"use client";

/**
 * Scent DNA quiz — 9 questions. Premium, consultation-style flow.
 * Card-style answers, smooth progress, light transition between questions.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_QUESTIONS } from "@/data/quizQuestions";
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

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => makeSessionId());

  const current = QUIZ_QUESTIONS[step];
  const isLast = step === TOTAL - 1;
  const progressPct = ((step + 1) / TOTAL) * 100;

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
    setError(null);
  }

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
          sessionStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify({
            profile: result.profile,
            recommendations: result.recommendations,
          }));
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
    <div className="min-h-screen bg-charcoal text-cream">
      <div className="max-w-lg mx-auto px-4 py-10 md:py-14">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-baseline text-sm mb-2">
            <span className="text-cream/50 tracking-[0.15em] uppercase">Scent DNA</span>
            <span className="text-cream/60 tabular-nums">
              {step + 1} of {TOTAL}
            </span>
          </div>
          <div className="h-0.5 bg-cream/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cream/50 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={TOTAL}
            />
          </div>
        </div>

        {/* Question + options (keyed for transition) */}
        <div key={step} className="animate-quiz-fade-in">
          <h1 className="font-serif text-2xl md:text-3xl font-light tracking-tight mb-8 leading-snug text-cream">
            {current.question}
          </h1>

          <ul className="space-y-3 mb-10">
            {current.options.map((opt) => {
              const isSelected = answers[current.id] === opt.value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-5 py-4 rounded-sm border-2 transition-all duration-200 text-sm leading-relaxed ${
                      isSelected
                        ? "border-cream bg-cream/10 text-cream"
                        : "border-cream/20 text-cream/85 hover:border-cream/40 hover:bg-cream/5 active:scale-[0.99]"
                    }`}
                  >
                    {opt.label}
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
              className="px-5 py-3 border border-cream/30 text-cream/90 text-sm hover:bg-cream/10 transition-colors rounded-sm"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext || submitting}
            className="flex-1 py-3.5 bg-cream text-charcoal text-sm font-medium rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream/95 active:scale-[0.99] transition-all duration-200"
          >
            {submitting ? "Building your profile…" : isLast ? "See my result" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
