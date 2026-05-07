"use client";

// Bootstraps the current user's plan/email into the Zustand store on mount,
// and listens for auth changes (login/logout) to keep them in sync.
// Render once near the top of any authenticated page tree.

import { useEffect } from "react";
import { useSlipGenStore } from "@/lib/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserPlan } from "@/types";

export default function AuthBoot() {
  const setUserPlan = useSlipGenStore((s) => s.setUserPlan);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    const loadPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setUserPlan("free");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      if (!cancelled && profile?.plan) setUserPlan(profile.plan as UserPlan);
    };

    loadPlan();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadPlan();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setUserPlan]);

  return null;
}
