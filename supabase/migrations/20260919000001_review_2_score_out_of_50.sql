-- Review 2 is now scored out of 50; Reviews 1 and 3 stay out of 10.
-- Leaderboard total therefore runs to 70.

-- The leaderboard view selects sum(score), so Postgres refuses to alter the
-- column type while it exists. Drop it here and recreate it unchanged below.
drop view if exists leaderboard;

-- numeric(3,1) already tops out at 99.9, but widen to (4,1) so the column is
-- not sitting at the edge of its precision.
alter table submissions alter column score type numeric(4,1);

-- Drop the old flat 0-10 check. It was created inline with the column, so its
-- name is generated -- look it up rather than guessing.
do $$
declare
  ck_name text;
begin
  select con.conname into ck_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where rel.relname = 'submissions'
    and nsp.nspname = 'public'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%score%'
    and con.conname <> 'submissions_score_range_ck';

  if ck_name is not null then
    execute format('alter table submissions drop constraint %I', ck_name);
  end if;
end $$;

alter table submissions drop constraint if exists submissions_score_range_ck;

alter table submissions add constraint submissions_score_range_ck check (
  score is null
  or (review_number = 2 and score >= 0 and score <= 50)
  or (review_number in (1,3) and score >= 0 and score <= 10)
);

-- Recreated verbatim: still sum(score), same ordering.
create view leaderboard as
select
  t.id, t.team_name, t.track_id,
  coalesce(sum(s.score), 0) as total_score,
  min(s.ppt_uploaded_at)    as first_submitted_at
from teams t
left join submissions s on s.team_id = t.id
group by t.id, t.team_name, t.track_id
order by total_score desc, first_submitted_at asc nulls last, t.team_name;
