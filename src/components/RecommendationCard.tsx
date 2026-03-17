"use client";

/**
 * Single recommendation card: organic or sponsored.
 * Editorial variant: feature-style layout with role-based visual styling.
 */

import type { RecommendedFragrance, RecommendationRole } from "@/types";
import { trackEvent } from "@/lib/events";
import { useCallback } from "react";

export type RecommendationPageContext = "collection_results" | "recommendations_page";

const ROLES_ORDER: RecommendationRole[] = ["SAFE", "BOLD", "NICHE", "VERSATILE", "WILDCARD"];

function getRoleStyle(role: RecommendationRole): {
  label: string;
  cardClass: string;
  pillClass: string;
  textMuted: string;
} {
  switch (role) {
    case "SAFE":
      return {
        label: "Easy wear",
        cardClass: "bg-cream/60 border-charcoal/10 text-charcoal",
        pillClass: "bg-charcoal/10 text-charcoal",
        textMuted: "text-charcoal/60",
      };
    case "BOLD":
      return {
        label: "Statement",
        cardClass: "bg-charcoal border-charcoal text-cream",
        pillClass: "bg-cream/20 text-cream border border-cream/30",
        textMuted: "text-cream/70",
      };
    case "NICHE":
      return {
        label: "Niche",
        cardClass: "bg-sage/10 border-sage/30 text-charcoal",
        pillClass: "bg-sage/20 text-charcoal border border-sage/40",
        textMuted: "text-charcoal/60",
      };
    case "VERSATILE":
      return {
        label: "Versatile",
        cardClass: "bg-cream border-gold/30 text-charcoal",
        pillClass: "bg-gold/15 text-charcoal border border-gold/40",
        textMuted: "text-charcoal/60",
      };
    case "WILDCARD":
      return {
        label: "Discovery",
        cardClass: "bg-charcoal/5 border-gold/25 text-charcoal",
        pillClass: "bg-gold/10 text-charcoal border border-gold/30",
        textMuted: "text-charcoal/60",
      };
    default:
      return {
        label: "",
        cardClass: "bg-cream/80 border-charcoal/10 text-charcoal",
        pillClass: "bg-charcoal/10 text-charcoal",
        textMuted: "text-charcoal/60",
      };
  }
}

interface RecommendationCardProps {
  recommendation: RecommendedFragrance;
  index?: number;
  pageContext: RecommendationPageContext;
  /** Layout: "default" (horizontal), "compact", or "editorial" (feature-style) */
  variant?: "default" | "compact" | "editorial";
  /** For editorial: role drives visual style (defaults by index 0–4) */
  role?: RecommendationRole;
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
  role: roleProp,
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
  const role =
    roleProp ??
    (index != null && index < ROLES_ORDER.length ? ROLES_ORDER[index] : undefined);
  const roleStyle = role ? getRoleStyle(role) : null;

  const content =
    variant === "editorial" ? (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            {roleStyle && (
              <span
                className={`inline-block text-xs uppercase tracking-widest mb-2 ${roleStyle.pillClass} px-2 py-1 rounded`}
              >
                {roleStyle.label}
              </span>
            )}
            <p className="font-serif text-xl md:text-2xl">
              {recommendation.name}
            </p>
            <p className={`text-sm mt-0.5 ${roleStyle?.textMuted ?? "text-charcoal/60"}`}>
              {recommendation.brand}
            </p>
          </div>
          {showBadge && (
            <span className={`text-xs ${roleStyle?.textMuted ?? "text-charcoal/50"}`} aria-label="Sponsored">
              Sponsored
            </span>
          )}
        </div>
        <p className={`text-sm leading-relaxed ${roleStyle?.textMuted ?? "text-charcoal/80"}`}>
          {recommendation.note}
        </p>
        <p className={`text-xs ${roleStyle?.textMuted ?? "text-charcoal/50"}`}>{recommendation.category}</p>
      </div>
    ) : (
      <>
        <div>
          <div className="flex items-center gap-2">
            {index != null && (
              <span className="text-charcoal/40 text-sm font-medium">
                {index + 1}.
              </span>
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
        <span className="text-xs text-charcoal/50 sm:shrink-0">
          {recommendation.category}
        </span>
      </>
    );

  const baseClass =
    variant === "editorial"
      ? `p-6 md:p-8 rounded-lg flex flex-col text-left transition-all duration-200 border ${roleStyle ? roleStyle.cardClass : "bg-cream/80 border-charcoal/10 text-charcoal"} hover:opacity-95`
      : variant === "compact"
        ? "p-4 border border-charcoal/10 flex justify-between items-start gap-4 hover:bg-charcoal/[0.02] transition-colors"
        : "p-4 md:p-5 border border-charcoal/10 bg-white flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 hover:bg-charcoal/[0.02] transition-colors";

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={`w-full text-left cursor-pointer ${baseClass}`}
      >
        {content}
      </button>
    </li>
  );
}
