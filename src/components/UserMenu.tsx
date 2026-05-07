"use client";

// Header user menu: shows plan badge + email; "Sign in" link if logged out.
// Reads from Supabase directly (Server Components can't pass session into client header
// without a roundtrip, and this avoids prop-drilling through the editor layout).

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signOutAction } from "@/app/login/actions";
import { LogIn, LogOut, Shield } from "lucide-react";
import type { UserPlan } from "@/types";

type Snapshot = { email: string; plan: UserPlan; isAdmin: boolean } | null;

export default function UserMenu() {
  const [snap, setSnap] = useState<Snapshot>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) { setSnap(null); setLoading(false); }
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, plan, role")
        .eq("id", user.id)
        .single();
      if (!cancelled) {
        setSnap(profile ? { email: profile.email, plan: profile.plan as UserPlan, isAdmin: profile.role === "admin" } : null);
        setLoading(false);
      }
    };

    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  if (loading) return null;

  if (!snap) {
    return (
      <Link href="/login" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md hover:bg-[var(--surface-elevated)]" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
        <LogIn className="w-3.5 h-3.5" /> Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {snap.isAdmin && (
        <Link href="/admin" className="flex items-center gap-1 text-xs px-2 py-1 rounded-md" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary-light)", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
          <Shield className="w-3 h-3" /> Admin
        </Link>
      )}
      <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-md font-medium" style={{ background: snap.plan === "free" ? "var(--surface-elevated)" : "rgba(16, 185, 129, 0.1)", color: snap.plan === "free" ? "var(--text-muted)" : "var(--success)" }}>
        {snap.plan}
      </span>
      <span className="hidden md:inline text-xs" style={{ color: "var(--text-muted)" }}>{snap.email}</span>
      <form action={signOutAction}>
        <button type="submit" className="text-xs flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[var(--surface-elevated)]" style={{ color: "var(--text-secondary)" }}>
          <LogOut className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
}
