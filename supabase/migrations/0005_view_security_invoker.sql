-- Harden public.admin_user_stats against privilege escalation.
--
-- BACKGROUND
-- Postgres views default to running with the OWNER's permissions (SECURITY
-- DEFINER semantics), bypassing the querying user's RLS. Supabase's
-- "0011_security_definer_view" linter flags this because any authenticated
-- user could SELECT from admin_user_stats and see every other user's row,
-- despite the RLS policies on profiles + slip_events.
--
-- FIX
-- Switch the view to security_invoker = true (Postgres 15+). Queries against
-- the view now run with the *caller's* permissions and the RLS policies on
-- the underlying tables (profiles, slip_events) are evaluated against the
-- caller. The existing "admin read all" policies on both tables ensure that
-- admins/super-admins still see every row; non-admins see nothing.

alter view public.admin_user_stats set (security_invoker = true);

-- Re-grant select to authenticated for clarity (idempotent if already granted).
-- The actual access control now lives in the RLS policies on the source tables,
-- not in a blanket grant on the view.
grant select on public.admin_user_stats to authenticated;
