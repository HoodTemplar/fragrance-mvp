/**
 * Create and read collection_uploads records (MVP schema).
 * One row per uploaded collection photo.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a collection_uploads row after a successful storage upload.
 * Throws with the exact Supabase error message on failure.
 */
export async function createCollectionUpload(
  supabase: SupabaseClient,
  storagePath: string
): Promise<{ id: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("collection_uploads insert: No logged-in user.");
  }

  console.log("[upload flow] Step 3: collection_uploads insert — starting");
  const { data, error } = await supabase
    .from("collection_uploads")
    .insert({ user_id: user.id, storage_path: storagePath })
    .select("id")
    .single();

  if (error) {
    throw new Error(`collection_uploads insert failed: ${error.message}`);
  }
  console.log("[upload flow] Step 3: collection_uploads insert — success, id:", (data as { id: string }).id);
  return data as { id: string };
}
