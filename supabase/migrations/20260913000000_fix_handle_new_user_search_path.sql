-- Fix: handle_new_user() is invoked by supabase_auth_admin (via the auth.users
-- trigger), whose default search_path does not include "public". The original
-- unqualified `profiles` reference failed with "relation \"profiles\" does not
-- exist", silently blocking every signup. Schema-qualify and pin search_path.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
