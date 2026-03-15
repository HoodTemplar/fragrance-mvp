"use client";

/**
 * Sign up page — email + password. Uses server action so auth runs on the server
 * where .env.local is available. Supabase can send a confirmation email if enabled.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      setMessage("Check your email to confirm your account (if confirmation is enabled in Supabase).");
      setLoading(false);
      router.refresh();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16 md:py-24">
      <p className="text-charcoal/50 text-sm tracking-wide uppercase mb-2">
        Create account
      </p>
      <h1 className="font-serif text-2xl text-charcoal mb-8">Sign up</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-charcoal/70 block mb-1">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-charcoal/20 text-charcoal bg-cream"
          />
        </label>
        <label className="block">
          <span className="text-sm text-charcoal/70 block mb-1">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 border border-charcoal/20 text-charcoal bg-cream"
          />
        </label>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {message && (
          <p className="text-sm text-charcoal/70">{message}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-charcoal text-cream text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-sm text-charcoal/60">
        Already have an account?{" "}
        <Link href="/login" className="text-charcoal underline">
          Log in
        </Link>
      </p>
      <p className="mt-2">
        <Link href="/" className="text-sm text-charcoal/50 hover:text-charcoal">
          ← Home
        </Link>
      </p>
    </div>
  );
}
