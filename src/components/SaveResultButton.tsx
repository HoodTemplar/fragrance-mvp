"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { saveResult } from "@/lib/db";
import Link from "next/link";

type Props = {
  type: "collection" | "quiz";
  data: unknown;
};

/**
 * Button to save the current results to the user's profile (Supabase saved_results table).
 */
export default function SaveResultButton({ type, data }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!user) {
      router.push("/login?next=/profile");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const row = await saveResult(supabase, type, data);
      if (row) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <Link
        href="/login?next=/profile"
        className="px-5 py-2.5 bg-charcoal text-cream text-sm font-medium hover:bg-charcoal/90 transition-colors inline-block"
      >
        Sign in to save
      </Link>
    );
  }

  if (saved) {
    return (
      <span className="px-5 py-2.5 border border-charcoal/20 text-charcoal/70 text-sm">
        Saved
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={loading}
      className="px-5 py-2.5 bg-charcoal text-cream text-sm font-medium disabled:opacity-50 hover:bg-charcoal/90 transition-colors"
    >
      {loading ? "Saving…" : "Save to profile"}
    </button>
  );
}
