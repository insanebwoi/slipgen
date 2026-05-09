-- Allow users to insert their own profile if it's missing (auto-recovery).
-- They must insert their own auth.uid(), and cannot elevate their privileges.
create policy "profiles: self insert"
  on public.profiles for insert
  with check (
    auth.uid() = id
    and role = 'user'
    and plan = 'free'
    and banned = false
  );
