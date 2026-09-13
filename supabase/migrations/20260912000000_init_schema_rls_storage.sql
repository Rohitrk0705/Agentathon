-- Profiles: 1:1 with auth.users, holds role
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'participant' check (role in ('participant','admin')),
  full_name text,
  created_at timestamptz default now()
);

-- Tracks (a.k.a. problem statements)
create table tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz default now()
);

-- Teams: one per participant account (identity only; submissions live separately)
create table teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  team_name text not null,
  track_id uuid references tracks(id),
  member_count int not null check (member_count >= 1),
  contact_email text,
  contact_phone text,
  created_at timestamptz default now()
);
create unique index teams_team_name_unique on teams (lower(team_name));
create unique index teams_owner_unique on teams (owner_id);

-- Team member names
create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null
);

-- Reviews: three configurable stages, each with an admin-set upload deadline
create table reviews (
  review_number int primary key check (review_number between 1 and 3),
  title text not null,
  upload_deadline timestamptz            -- null = not yet open; admin sets it
);
insert into reviews (review_number, title) values
  (1,'Review 1'), (2,'Review 2'), (3,'Review 3')
on conflict do nothing;

-- Submissions: one row per team per review
create table submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  review_number int not null references reviews(review_number),
  ppt_path text,                         -- path inside the 'submissions' bucket
  ppt_filename text,
  ppt_uploaded_at timestamptz,
  github_url text,                       -- optional
  demo_url text,                         -- optional
  score numeric(3,1) check (score >= 0 and score <= 10),
  remarks text,
  scored_at timestamptz,
  updated_at timestamptz default now(),
  unique (team_id, review_number)
);

-- Singleton settings row
create table app_settings (
  id int primary key default 1 check (id = 1),
  registration_open boolean not null default true
);
insert into app_settings (id) values (1) on conflict do nothing;

-- Helper: is the current user an admin?
create or replace function is_admin() returns boolean
language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Auto-create a profile row when a user signs up
create or replace function handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Row Level Security (RLS)
alter table profiles     enable row level security;
alter table tracks       enable row level security;
alter table teams        enable row level security;
alter table team_members enable row level security;
alter table reviews      enable row level security;
alter table submissions  enable row level security;
alter table app_settings enable row level security;

-- profiles: own row (admin reads all)
create policy "own profile"  on profiles for select using (id = auth.uid() or is_admin());

-- tracks: any signed-in user reads; only admin writes
create policy "read tracks"  on tracks for select using (auth.role() = 'authenticated');
create policy "admin tracks" on tracks for all    using (is_admin()) with check (is_admin());

-- reviews: any signed-in user reads deadlines; only admin writes
create policy "read reviews"  on reviews for select using (auth.role() = 'authenticated');
create policy "admin reviews" on reviews for all    using (is_admin()) with check (is_admin());

-- teams: owner reads/writes own; admin reads all
create policy "own team read"   on teams for select using (owner_id = auth.uid() or is_admin());
create policy "own team insert" on teams for insert with check (owner_id = auth.uid());
create policy "own team update" on teams for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- team_members: owning team or admin
create policy "members access" on team_members for all
  using (exists (select 1 from teams t where t.id = team_id and (t.owner_id = auth.uid() or is_admin())))
  with check (exists (select 1 from teams t where t.id = team_id and t.owner_id = auth.uid()));

-- submissions: owner reads/writes own; admin reads all + updates score
create policy "own submission read"   on submissions for select
  using (exists (select 1 from teams t where t.id = team_id and (t.owner_id = auth.uid() or is_admin())));
create policy "own submission insert" on submissions for insert
  with check (exists (select 1 from teams t where t.id = team_id and t.owner_id = auth.uid()));
create policy "own submission update" on submissions for update
  using (exists (select 1 from teams t where t.id = team_id and t.owner_id = auth.uid()))
  with check (exists (select 1 from teams t where t.id = team_id and t.owner_id = auth.uid()));
create policy "admin submission update" on submissions for update
  using (is_admin()) with check (is_admin());

-- app_settings: everyone reads; only admin writes
create policy "read settings"  on app_settings for select using (auth.role() = 'authenticated');
create policy "admin settings" on app_settings for all using (is_admin()) with check (is_admin());

-- Leaderboard (derived)
create or replace view leaderboard as
select
  t.id, t.team_name, t.track_id,
  coalesce(sum(s.score), 0) as total_score,
  min(s.ppt_uploaded_at)    as first_submitted_at
from teams t
left join submissions s on s.team_id = t.id
group by t.id, t.team_name, t.track_id
order by total_score desc, first_submitted_at asc nulls last, t.team_name;

-- Storage: private 'submissions' bucket
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- Bucket policies (on storage.objects)
-- Participant uploads/replaces only inside their own team folder
create policy "team upload" on storage.objects for insert
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = 'teams'
    and (storage.foldername(name))[2] in (select id::text from teams where owner_id = auth.uid())
  );
create policy "team update" on storage.objects for update
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[2] in (select id::text from teams where owner_id = auth.uid())
  );
-- Reads happen through server-generated signed URLs (service role); no public read policy.
