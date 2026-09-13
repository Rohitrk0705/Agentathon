-- is_admin() queried public.profiles, which is itself RLS-protected by a policy
-- that calls is_admin() again. The planner does not reliably short-circuit the
-- "id = auth.uid() OR is_admin()" check, so any policy that calls is_admin()
-- unconditionally (e.g. tracks' "admin tracks" policy) recurses until Postgres
-- raises "stack depth limit exceeded" (54001). Fix: SECURITY DEFINER so the
-- internal profiles lookup runs as the function owner (bypassrls), breaking
-- the recursive cycle — the standard Supabase pattern for this exact trap.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;
