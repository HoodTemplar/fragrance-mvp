"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Sign in and sign up return a result so the client can receive the response
 * (including Set-Cookie headers). Redirecting from a Server Action can prevent
 * auth cookies from being sent; client-side redirect after success fixes that.
 */
export async function signUp(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
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