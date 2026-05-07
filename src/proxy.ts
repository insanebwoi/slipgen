// Next 16 renamed `middleware.ts` to `proxy.ts`. This runs before route rendering and:
//  1. Refreshes the Supabase session cookie if needed.
//  2. Redirects unauthenticated users away from /editor and /admin.
//  3. Redirects non-admins away from /admin.
//
// Keep this file fast — it runs on every matched request.

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_USER_PATHS = ["/editor"];
const ADMIN_PATHS = ["/admin"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set({ name, value, ...options });
          }
        },
      },
    }
  );

  // getUser() forces a token refresh if needed and writes the new cookie via setAll above.
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_USER_PATHS.some((p) => path === p || path.startsWith(p + "/"));
  const isAdmin     = ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"));

  if ((isProtected || isAdmin) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isAdmin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, banned")
      .eq("id", user.id)
      .single();

    if (!profile || profile.banned || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = profile?.banned ? "/banned" : "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Run on app routes; skip Next internals, static assets, and the AI proxy route.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/ai-process|.*\\.(?:png|svg|jpg|jpeg|webp)$).*)"],
};
