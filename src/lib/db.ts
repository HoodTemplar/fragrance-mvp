/**
 * Database helpers for saved results.
 * Uses the saved_results table (see supabase/schema.sql).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type SavedResultRow = {
  id: string;
  user_id: string;
  type: "collection" | "quiz";
  data: unknown;
  created_at: string;
};

/**
 * Fetch all saved results for the current user.
 */
export async function getSavedResults(
  supabase: SupabaseClient
): Promise<SavedResultRow[]> {
  const { data, error } = await supabase
    .from("saved_results")
    .select("id, user_id, type, data, created_at")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as SavedResultRow[]) ?? [];
}

/**
 * Insert a saved result (collection or quiz).
 */
export async function saveResult(
  supabase: SupabaseClient,
  type: "collection" | "quiz",
  data: unknown
): Promise<{ id: string } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row, error } = await supabase
    .from("saved_results")
    .insert({ user_id: user.id, type, data })
    .select("id")
    .single();

  if (error) return null;
  return row as { id: string };
}
