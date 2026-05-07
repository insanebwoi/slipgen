-- Grant admin role to the super-admin email if a profile already exists.
-- The handle_new_user() trigger covers fresh signups; this covers profiles
-- created before the trigger's email check was in place.
update public.profiles
set role = 'admin'
where email = 'ihsanmohammed320@gmail.com'
  and role <> 'admin';
