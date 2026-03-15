"use client";

/**
 * Provides the current user (or null) to the whole app.
 * Refetches user on pathname change so session set by server action (login/signup)
 * is picked up after client-side redirect.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

function fetchUser() {
  const supabase = createClient();
  return supabase.auth.getUser().then(({ data: { user } }) => user);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const supabase = createClient();
      fetchUser().then((u) => {
        setUser(u);
        setLoading(false);
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = data.subscription;
    } catch {
      setLoading(false);
    }
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (pathname === undefined) return;
    fetchUser().then((u) => {
      setUser(u);
    });
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
