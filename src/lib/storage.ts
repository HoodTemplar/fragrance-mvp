import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET_COLLECTION_PHOTOS = "collection-photos";

export async function uploadCollectionPhoto(
  supabase: SupabaseClient,
  file: File
): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("AUTH USER:", user);
  console.log("AUTH ERROR:", userError);

  if (!user) {
    throw new Error("No logged-in user found during upload.");
  }

  console.log("[upload flow] Step 2: storage upload — starting");
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_COLLECTION_PHOTOS)
    .upload(path, file, { upsert: true });

  console.log("STORAGE UPLOAD DATA:", data);
  console.log("STORAGE UPLOAD ERROR:", error);

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  console.log("[upload flow] Step 2: storage upload — success, path:", path);
  return path;
}