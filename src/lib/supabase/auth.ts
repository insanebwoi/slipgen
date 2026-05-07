// Server-side auth helpers. Use from Server Components and Route Handlers.

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "./server";
import type { Profile } from "./types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (profile as Profile | null) ?? null;
}

export async function requireUser(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.banned) redirect("/banned");
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireUser();
  if (profile.role !== "admin") redirect("/");
  return profile;
}
