// OAuth callback. Supabase sends the user here with ?code=... after the
// Google sign-in. We exchange the code for a session (which sets the
// HttpOnly auth cookie), ensure a profile row exists (Google sign-ups
// bypass the email/password path that creates the row), and redirect.

import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/editor";
  const origin = url.origin;

  // The OAuth provider can also return ?error=… on cancel/denial.
  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    const errorDescription = url.searchParams.get("error_description") || oauthError;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await getSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`,
    );
  }

  // Now we have a session. Ensure a profile row exists — the on_auth_user_created
  // trigger should handle this server-side, but we recover client-side in case
  // the trigger hasn't been deployed yet or fails silently.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, banned")
      .eq("id", user.id)
      .single();

    if (!profile) {
      // PGRST116 = row not found, which is fine — we'll insert it.
      if (profileErr && profileErr.code !== "PGRST116") {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent("Database setup incomplete: profiles table missing.")}`,
        );
      }
      const { error: insertErr } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User",
        role: "user",
        plan: "free",
      });
      if (insertErr) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent("Failed to create profile: " + insertErr.message)}`,
        );
      }
    } else if (profile.banned) {
      return NextResponse.redirect(`${origin}/banned`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
