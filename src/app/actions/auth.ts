"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Sign in and sign up return a result so the client can receive the response
 * (including Set-Cookie headers). Redirecting from a Server Action can prevent
 * auth cookies from being sent; client-side redirect after success fixes that.
 */
export async function signUp(
  email: string,
  password: string,
  options?: { marketingConsent?: boolean }
) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const marketingConsent = options?.marketingConsent ?? false;
  const { error: insertError } = await supabase.from("email_subscribers").upsert(
    {
      email: email.trim().toLowerCase(),
      marketing_opt_in: marketingConsent,
      source: "signup_page",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  if (insertError) {
    console.error("[signup] email_subscribers insert failed:", insertError.message);
  }

  return { error: null };
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}