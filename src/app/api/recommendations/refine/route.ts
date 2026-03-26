import { NextResponse } from "next/server";
import type { RecommendedFragrance } from "@/types";
import { getRecommendationsForQuiz } from "@/app/actions/analyze";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      quizAnswers?: Record<string, string>;
    };

    const quizAnswers = body.quizAnswers;
    if (!quizAnswers || typeof quizAnswers !== "object") {
      return NextResponse.json({ error: "Missing quizAnswers" }, { status: 400 });
    }

    const result = await getRecommendationsForQuiz(quizAnswers);

    return NextResponse.json({
      recommendedFragrances: result.recommendedFragrances as RecommendedFragrance[],
      layeringSuggestions: result.layeringSuggestions,
      whenToWear: result.whenToWear,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to refine recommendations" },
      { status: 500 }
    );
  }
}

