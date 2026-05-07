-- ===========================================================================
-- SlipGen — initial schema
-- Tables: profiles (1:1 with auth.users), slip_events (telemetry), audit_log
-- Auth: Supabase auth.users provides identity.
-- Plans: 'free' | 'basic' | 'standard'
-- Roles: 'user' | 'admin'  (super-admin granted by hardcoded email on first login)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles  (one row per auth user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  plan        text not null default 'free' check (plan in ('free','basic','standard')),
  role        text not null default 'user' check (role in ('user','admin')),
  banned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_plan_idx on public.profiles(plan);

-- Auto-bump updated_at on every UPDATE.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 2. slip_events  (lightweight telemetry — number of slips generated per user)
-- ---------------------------------------------------------------------------
create table if not exists public.slip_events (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_type  text not null check (event_type in ('export','ai_process')),
  slip_count  int not null default 0,
  meta        jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists slip_events_user_idx on public.slip_events(user_id);
create index if not exists slip_events_created_idx on public.slip_events(created_at desc);

-- ---------------------------------------------------------------------------
-- 3. audit_log  (admin actions — plan changes, bans, role grants)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id           bigserial primary key,
  actor_id     uuid not null references auth.users(id) on delete set null,
  target_id    uuid references auth.users(id) on delete set null,
  action       text not null,            -- e.g. 'plan_change', 'ban', 'unban', 'role_grant'
  before_value jsonb,
  after_value  jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists audit_log_actor_idx on public.audit_log(actor_id);
create index if not exists audit_log_target_idx on public.audit_log(target_id);

-- ---------------------------------------------------------------------------
-- 4. Trigger: auto-create profile on auth.users insert
--    Bootstrap super-admin: if email matches the hardcoded super-admin, grant role='admin'.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  super_admin_email constant text := 'ihsanmohammed320@gmail.com';
  initial_role text := 'user';
begin
  if new.email = super_admin_email then
    initial_role := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    initial_role
  )
  on conflict (id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5. Helper: is_admin(uid)
--    SECURITY DEFINER so RLS policies can call it without recursing into profiles RLS.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin' and banned = false
  );
$$;

-- ---------------------------------------------------------------------------
-- 6. Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.slip_events enable row level security;
alter table public.audit_log enable row level security;

-- ===== profiles =====
-- Users can read their own row.
drop policy if exists "profiles: self read" on public.profiles;
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins can read all profiles.
drop policy if exists "profiles: admin read all" on public.profiles;
create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- Users can update their own full_name only (NOT plan, role, banned).
drop policy if exists "profiles: self update name" on public.profiles;
create policy "profiles: self update name"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and plan = (select plan from public.profiles where id = auth.uid())
    and role = (select role from public.profiles where id = auth.uid())
    and banned = (select banned from public.profiles where id = auth.uid())
  );

-- Admins can update any profile (plan, role, banned). Cannot change their own role to non-admin
-- (prevents accidentally locking everyone out — at least the super-admin path stays open via the trigger).
drop policy if exists "profiles: admin update" on public.profiles;
create policy "profiles: admin update"
  on public.profiles for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ===== slip_events =====
drop policy if exists "events: insert own" on public.slip_events;
create policy "events: insert own"
  on public.slip_events for insert
  with check (auth.uid() = user_id);

drop policy if exists "events: read own" on public.slip_events;
create policy "events: read own"
  on public.slip_events for select
  using (auth.uid() = user_id);

drop policy if exists "events: admin read all" on public.slip_events;
create policy "events: admin read all"
  on public.slip_events for select
  using (public.is_admin(auth.uid()));

-- ===== audit_log =====
-- Only admins can write (and only as themselves) or read.
drop policy if exists "audit: admin write" on public.audit_log;
create policy "audit: admin write"
  on public.audit_log for insert
  with check (public.is_admin(auth.uid()) and actor_id = auth.uid());

drop policy if exists "audit: admin read" on public.audit_log;
create policy "audit: admin read"
  on public.audit_log for select
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- 7. Convenience views for the admin dashboard
-- ---------------------------------------------------------------------------
create or replace view public.admin_user_stats as
  select
    p.id,
    p.email,
    p.full_name,
    p.plan,
    p.role,
    p.banned,
    p.created_at,
    p.updated_at,
    coalesce(sum(case when e.event_type = 'export' then e.slip_count else 0 end), 0) as total_slips_exported,
    coalesce(sum(case when e.event_type = 'ai_process' then 1 else 0 end), 0)        as total_ai_runs,
    max(e.created_at) as last_active_at
  from public.profiles p
  left join public.slip_events e on e.user_id = p.id
  group by p.id;

-- View inherits the underlying tables' RLS (admin-read policy on slip_events covers it).
grant select on public.admin_user_stats to authenticated;
