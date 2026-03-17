"use server";

/**
 * Submit quiz answers, optionally save to Supabase, and return the generated scent profile + rule-based recommendations.
 * Stores raw answers (q1–q9) and structured quizPreferences (engine-ready mapping) in result_data.
 */

import { createClient } from "@/lib/supabase/server";
import { generateScentProfile } from "@/lib/quizProfile";
import { mapQuizAnswersToEngine } from "@/lib/quizToEngineMap";
import { getRecommendationsForQuiz } from "@/app/actions/analyze";
import type { ScentProfile } from "@/types";
import type { RecommendedFragrance } from "@/types";

export type QuizSubmitResult = {
  profile: ScentProfile;
  recommendations?: {
    recommendedFragrances: RecommendedFragrance[];
    layeringSuggestions: string[];
    whenToWear: string[];
  };
  saved: boolean;
  error?: string;
};

export async function submitQuiz(
  sessionId: string,
  answers: Record<string, string>
): Promise<QuizSubmitResult> {
  const profile = generateScentProfile(answers);
  const recommendations = await getRecommendationsForQuiz(answers);

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { profile, recommendations, saved: false };
    }

    const userId = user.id;

    for (const [questionId, answerValue] of Object.entries(answers)) {
      const { error } = await supabase.from("quiz_answers").insert({
        user_id: userId,
        session_id: sessionId,
        question_id: questionId,
        answer_value: answerValue,
      });
      if (error) {
        console.error("quiz_answers insert error", error);
        return { profile, recommendations, saved: false, error: error.message };
      }
    }

    const quizPreferences = mapQuizAnswersToEngine(answers);
    const resultData = {
      profile,
      answers,
      quizPreferences,
      generatedAt: new Date().toISOString(),
    };

    const { error: analysisError } = await supabase.from("analyses").insert({
      user_id: userId,
      source: "quiz",
      quiz_session_id: sessionId,
      result_data: resultData,
    });

    if (analysisError) {
      console.error("analyses insert error", analysisError);
      return { profile, recommendations, saved: false, error: analysisError.message };
    }

    return { profile, recommendations, saved: true };
  } catch (e) {
    console.error("submitQuiz error", e);
    return {
      profile,
      recommendations,
      saved: false,
      error: e instanceof Error ? e.message : "Failed to save",
    };
  }
}
