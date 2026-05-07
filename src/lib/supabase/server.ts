// Server-side Supabase client for Server Components, Route Handlers, and Server Actions.
// In Next 16, `cookies()` is async and may be read-only in pure RSC contexts.
// We swallow set errors when the cookie store is read-only — the proxy handles refresh in that case.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Pure Server Component contexts can't mutate cookies — proxy.ts refreshes the session there.
          }
        },
      },
    }
  );
}
