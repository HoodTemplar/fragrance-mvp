"use client";

/**
 * Share button: native share on supported devices, otherwise copy link.
 */

import { useState } from "react";
import { trackEvent } from "@/lib/events";

export default function ShareResults() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = "My Scent DNA Collection Results";
    const text = "Check out my fragrance collection score and scent profile on Scent DNA.";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        trackEvent("result_shared", { method: "native_share" });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent("result_shared", { method: "copy" });
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="px-5 py-2.5 border border-charcoal/20 text-charcoal text-sm hover:bg-charcoal/5 transition-colors"
    >
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
