"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { check as checkRateLimit } from "@/lib/rate-limit";

const LOGIN_LIMIT = 8;            // max attempts
const LOGIN_WINDOW_MS = 10 * 60_000; // per 10 minutes
const SIGNUP_LIMIT = 5;
const SIGNUP_WINDOW_MS = 60 * 60_000; // per hour

async function getClientIp(): Promise<string> {
  const h = await headers();
  // x-forwarded-for is set by Vercel and most proxies. Fall back to a constant
  // so dev-server requests still get rate-limited as a unit.
  return (h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local").slice(0, 64);
}

export async function signInAction(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email and password are required." };

  const ip = await getClientIp();
  const rl = checkRateLimit(`login:${ip}:${email}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!rl.allowed) {
    return { error: `Too many login attempts. Try again in ${Math.ceil(rl.retryAfterSeconds / 60)} min.` };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  if (data.user) {
    const { data: profile, error: profileErr } = await supabase.from("profiles").select("id").eq("id", data.user.id).single();
    
    if (!profile) {
      // If the profiles table exists but the row is missing (because the user signed up
      // before the migrations were pushed), we can auto-recover by inserting it now.
      if (profileErr && profileErr.code !== 'PGRST116') {
        // Table is still missing or other fatal error
        await supabase.auth.signOut();
        return { error: "Database setup incomplete: 'profiles' table missing. Run 'npx supabase db push'." };
      }
      
      const { error: insertErr } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
        role: "user",
        plan: "free"
      });
      
      if (insertErr) {
        await supabase.auth.signOut();
        return { error: "Failed to recover missing profile: " + insertErr.message };
      }
    }
  }

  revalidatePath("/", "layout");
  redirect("/editor");
}

export async function signUpAction(formData: FormData): Promise<{ error?: string; message?: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const ip = await getClientIp();
  const rl = checkRateLimit(`signup:${ip}`, SIGNUP_LIMIT, SIGNUP_WINDOW_MS);
  if (!rl.allowed) {
    return { error: `Too many signup attempts. Try again in ${Math.ceil(rl.retryAfterSeconds / 60)} min.` };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || email.split("@")[0] } },
  });
  if (error) return { error: error.message };

  // If email confirmation is OFF in Supabase, the user is signed in immediately and we can redirect.
  if (data.session) {
    const { data: profile, error: profileErr } = await supabase.from("profiles").select("id").eq("id", data.user!.id).single();
    
    if (!profile) {
      if (profileErr && profileErr.code !== 'PGRST116') {
        await supabase.auth.signOut();
        return { error: "Database setup incomplete: 'profiles' table missing. Run 'npx supabase db push'." };
      }
      
      const { error: insertErr } = await supabase.from("profiles").insert({
        id: data.user!.id,
        email: data.user!.email,
        full_name: data.user!.user_metadata?.full_name || data.user!.email?.split("@")[0],
        role: "user",
        plan: "free"
      });
      
      if (insertErr) {
        await supabase.auth.signOut();
        return { error: "Failed to create profile: " + insertErr.message };
      }
    }
    revalidatePath("/", "layout");
    redirect("/editor");
  }
  return { message: "Check your email to confirm your account, then log in." };
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Kicks off a Google OAuth flow. Returns the provider URL via redirect();
 * the user lands on Google, then bounces back to /auth/callback?code=…
 * which exchanges the code for a session and ensures a profile row exists.
 */
export async function signInWithGoogleAction(): Promise<{ error: string } | void> {
  const h = await headers();
  // Build an absolute callback URL. Priority:
  //   1. NEXT_PUBLIC_SITE_URL — explicit prod/staging origin
  //   2. Vercel-provided host headers
  //   3. localhost dev fallback
  // Without (1), OAuth can bounce users back to localhost from production
  // when the request goes through a CDN that strips x-forwarded-host.
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  let origin: string;
  if (envUrl) {
    origin = envUrl;
  } else {
    const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
    const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    origin = `${proto}://${host}`;
  }
  const redirectTo = `${origin}/auth/callback`;

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      // Force account picker so users can switch Google accounts easily.
      queryParams: { access_type: "offline", prompt: "select_account" },
    },
  });
  if (error) return { error: error.message };
  if (!data?.url) return { error: "Failed to get Google sign-in URL." };

  redirect(data.url);
}
