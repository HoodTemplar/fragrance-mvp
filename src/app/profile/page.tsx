"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getSavedResults, type SavedResultRow } from "@/lib/db";

export default function ProfilePage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<SavedResultRow[]>([]);
  const [loading, setLoading] = useState(!!user);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const rows = await getSavedResults(supabase);
        if (!cancelled) setSaved(rows);
      } catch {
        if (!cancelled) setSaved([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const hasSaved = saved.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
      <p className="text-charcoal/50 text-sm tracking-wide uppercase mb-2">
        Profile
      </p>
      <h1 className="font-serif text-3xl text-charcoal mb-4">
        Your profile
      </h1>
      {user ? (
        <p className="text-charcoal/60 text-sm leading-relaxed mb-10">
          Saved results from your account. Sign out in the nav to switch accounts.
        </p>
      ) : (
        <p className="text-charcoal/60 text-sm leading-relaxed mb-10">
          Sign in to save and see your results here.
        </p>
      )}

      <section>
        <h2 className="font-serif text-xl text-charcoal mb-4">
          Saved results
        </h2>
        {loading ? (
          <p className="text-charcoal/50 text-sm">Loading…</p>
        ) : !hasSaved ? (
          <p className="text-charcoal/50 text-sm">
            No saved results yet. Complete an upload or the quiz, then use “Save to profile” on the results or recommendations page.
          </p>
        ) : (
          <ul className="space-y-3">
            {saved.map((row) => (
              <li
                key={row.id}
                className="p-4 border border-charcoal/10 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-charcoal text-sm">
                    {row.type === "collection" ? "Collection results" : "Quiz recommendations"}
                  </p>
                  <p className="text-xs text-charcoal/50">
                    {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={
                    row.type === "collection"
                      ? "/results"
                      : "/recommendations?source=quiz"
                  }
                  className="text-sm text-charcoal/70 hover:text-charcoal"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 pt-6">
        <Link
          href="/"
          className="text-sm text-charcoal/60 hover:text-charcoal"
        >
          ← Home
        </Link>
      </div>
    </div>
  );
}
