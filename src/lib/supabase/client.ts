/**
 * Supabase client for the browser (client components).
 * Uses NEXT_PUBLIC_* so Next.js inlines them into the client bundle.
 * We do not throw when env vars are missing—Supabase auth will return the real error.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createBrowserClient(url, key);
}
