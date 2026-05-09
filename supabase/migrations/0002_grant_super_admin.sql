-- Add a distinct super_admin role tier above admin.
--
-- super_admin is granted to a single hardcoded email at signup; it can do
-- everything admin can plus grant/revoke admin (and super_admin) on others.
-- Regular admins cannot demote a super_admin.

-- 1. Allow 'super_admin' in the role check constraint.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('user', 'admin', 'super_admin'));

-- 2. Update the signup trigger to grant super_admin to the hardcoded email.
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
    initial_role := 'super_admin';
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

-- 3. is_admin() must also return true for super_admins so existing RLS policies
--    keep working (they all delegate to is_admin).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('admin', 'super_admin') and banned = false
  );
$$;

-- 4. Helper for super-admin-only checks (e.g. role grants).
create or replace function public.is_super_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'super_admin' and banned = false
  );
$$;

-- 5. Backfill: promote the existing profile if it predates this migration.
update public.profiles
set role = 'super_admin'
where email = 'ihsanmohammed320@gmail.com'
  and role <> 'super_admin';
