-- Admins score every (team, review) pair, including teams that never uploaded.
-- Scoring now upserts on (team_id, review_number), so the first save for a
-- team with no submission row is an INSERT -- which admins had no policy for
-- ("admin submission update" only covers UPDATE, and "own submission insert"
-- requires the row's team to be owned by the caller).
-- Safe to re-run.

drop policy if exists "admin submission insert" on public.submissions;

create policy "admin submission insert" on public.submissions
  for insert to authenticated with check (public.is_admin());
