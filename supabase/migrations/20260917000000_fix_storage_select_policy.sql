-- Fix: PPT upload with upsert:true was failing RLS because storage.objects
-- had no SELECT policy for participants. Supabase upsert requires SELECT
-- (in addition to INSERT/UPDATE) because Postgres reads back the row.
-- Safe to re-run.

drop policy if exists "team upload"    on storage.objects;
drop policy if exists "team update"    on storage.objects;
drop policy if exists "team read own"  on storage.objects;

create policy "team upload" on storage.objects for insert
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = 'teams'
    and (storage.foldername(name))[2] in (
      select id::text from teams where owner_id = auth.uid()
    )
  );

create policy "team update" on storage.objects for update
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[2] in (
      select id::text from teams where owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[2] in (
      select id::text from teams where owner_id = auth.uid()
    )
  );

create policy "team read own" on storage.objects for select
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[2] in (
      select id::text from teams where owner_id = auth.uid()
    )
  );
