"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/quiz", label: "Quiz" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/profile", label: "Profile" },
];

export default function Nav() {
  const { user, loading } = useAuth();

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      // ignore
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-charcoal/10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-lg text-charcoal font-medium tracking-tight"
        >
          Scent DNA
        </Link>
        <div className="flex flex-wrap items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-charcoal/70 hover:text-charcoal transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="text-xs text-charcoal/50 truncate max-w-[120px]">
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-sm text-charcoal/70 hover:text-charcoal"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-charcoal/70 hover:text-charcoal"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm text-charcoal/70 hover:text-charcoal"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
