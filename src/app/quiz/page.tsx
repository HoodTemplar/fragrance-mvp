"use client";

/**
 * Scent DNA quiz — 10 questions. Premium styling. Saves to Supabase when signed in.
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

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => makeSessionId());

  const current = QUIZ_QUESTIONS[step];
  const isLast = step === QUIZ_QUESTIONS.length - 1;

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
          sessionStorage.setItem("scent-dna-quiz-result", JSON.stringify({
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
      <div className="max-w-lg mx-auto px-4 py-12 md:py-16">
        <p className="text-cream/50 text-xs tracking-[0.2em] uppercase mb-2">
          Scent DNA
        </p>
        <p className="text-cream/60 text-sm mb-6">
          {step + 1} of {QUIZ_QUESTIONS.length}
        </p>
        <div className="h-px bg-cream/10 rounded-full overflow-hidden mb-10">
          <div
            className="h-full bg-cream/40 rounded-full transition-all duration-300"
            style={{
              width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-light tracking-tight mb-10 leading-snug">
          {current.question}
        </h1>

        <ul className="space-y-3 mb-12">
          {current.options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-5 py-4 border transition-colors text-sm ${
                  answers[current.id] === opt.value
                    ? "border-cream bg-cream/10 text-cream"
                    : "border-cream/20 text-cream/80 hover:border-cream/40 hover:bg-cream/5"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>

        {error && (
          <p className="text-red-300/90 text-sm mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 border border-cream/30 text-cream/90 text-sm hover:bg-cream/10 transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext || submitting}
            className="flex-1 py-3.5 bg-cream text-charcoal text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream/90 transition-colors"
          >
            {submitting ? "Building your profile…" : isLast ? "See my result" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
