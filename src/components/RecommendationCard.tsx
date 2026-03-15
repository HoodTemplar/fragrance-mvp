"use client";

/**
 * Single recommendation card: organic or sponsored.
 * - Organic: normal card, no badge, optional click tracking later.
 * - Sponsored: "Sponsored" badge, click tracked for future monetization (sponsorSlotId).
 * Ads are not turned on yet; structure is ready for when you add sponsored_slots.
 */

import type { RecommendedFragrance } from "@/types";
import { trackEvent } from "@/lib/events";
import { useCallback } from "react";

export type RecommendationPageContext = "collection_results" | "recommendations_page";

interface RecommendationCardProps {
  recommendation: RecommendedFragrance;
  index?: number;
  pageContext: RecommendationPageContext;
  /** Layout: "default" (horizontal) or "compact" */
  variant?: "default" | "compact";
}

async function trackSponsoredClick(
  sponsorSlotId: string | undefined,
  pageContext: string
): Promise<void> {
  try {
    await fetch("/api/recommendations/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sponsorSlotId: sponsorSlotId || null,
        pageContext,
      }),
    });
  } catch {
    // Silently ignore
  }
}

export default function RecommendationCard({
  recommendation,
  index,
  pageContext,
  variant = "default",
}: RecommendationCardProps) {
  const handleClick = useCallback(() => {
    trackEvent("recommendation_clicked", {
      recommendationId: recommendation.id,
      name: recommendation.name,
      brand: recommendation.brand,
      isSponsored: recommendation.isSponsored ?? false,
      pageContext,
    });
    if (recommendation.isSponsored && recommendation.sponsorSlotId) {
      trackSponsoredClick(recommendation.sponsorSlotId, pageContext);
    }
  }, [recommendation.id, recommendation.name, recommendation.brand, recommendation.isSponsored, recommendation.sponsorSlotId, pageContext]);

  const showBadge = recommendation.isSponsored === true;
  const isClickable = true;

  const content = (
    <>
      <div>
        <div className="flex items-center gap-2">
          {index != null && (
            <span className="text-charcoal/40 text-sm font-medium">{index + 1}.</span>
          )}
          <p className="font-medium text-charcoal">
            {recommendation.name}
            {showBadge && (
              <span
                className="ml-2 text-xs font-normal text-charcoal/50"
                aria-label="Sponsored"
              >
                Sponsored
              </span>
            )}
          </p>
        </div>
        <p className="text-xs text-charcoal/50 mt-0.5">{recommendation.brand}</p>
        <p className="text-sm text-charcoal/70 mt-2">{recommendation.note}</p>
      </div>
      <span className="text-xs text-charcoal/50 sm:shrink-0">{recommendation.category}</span>
    </>
  );

  const baseClass =
    variant === "compact"
      ? "p-4 border border-charcoal/10 flex justify-between items-start gap-4"
      : "p-4 md:p-5 border border-charcoal/10 bg-white flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3";

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={`w-full text-left ${baseClass} hover:bg-charcoal/[0.02] transition-colors cursor-pointer`}
      >
        {content}
      </button>
    </li>
  );
}
