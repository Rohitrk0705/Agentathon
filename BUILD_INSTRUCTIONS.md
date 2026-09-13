# Hackathon Platform — Build Instructions

Setup and run guide for the platform described in `PRD.md`. Written so that Claude (and future-you) can stand the project up from zero and build it in a sane order.

**Stack:** Next.js (App Router, TypeScript) · Tailwind CSS · Supabase (Auth + Postgres + Storage) · deploy on Vercel.

**Model:** three review stages, each with an admin-controlled upload deadline; each submission is a PPT + optional GitHub link + optional working-demo link; admin scores each review /10; leaderboard ranks on the total across the three reviews.

**Frontend:** built separately in Antigravity. This repo is API-first — all backend logic lives in route handlers under `app/api/**` returning JSON. Pages in this repo are placeholder-only, the minimum needed to smoke-test an endpoint; no styling investment.

---

## 1. Prerequisites
- **Node.js 20 LTS** (18+ works) and npm.
- A **Supabase** account (free tier is enough) → https://supabase.com
- A **Vercel** account for deployment.
- Git.

---

## 2. Create the app
```bash
npx create-next-app@latest hackathon-platform \
  --typescript --tailwind --app --src-dir --eslint --import-alias "@/*"
cd hackathon-platform
npm install @supabase/supabase-js @supabase/ssr
```

---

## 3. Environment variables
Create `.env.local` in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
- `NEXT_PUBLIC_*` are safe on the client.
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** — use it only in route handlers (never import it into a client component). It bypasses RLS, so it's how admin cross-team reads, score writes, and signed-URL generation are done.

Get all three from Supabase → **Project Settings → API**.

---

## 4. Database schema
In Supabase → **SQL Editor**, run:

```sql
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
```

### Row Level Security (RLS)
```sql
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
```
> **Score integrity note:** the "own submission update" policy technically lets a participant PATCH their own row's `score`. Keep the participant UI free of any score field, and write scores only via an admin route handler (service role). Optional hardening: a `before update` trigger that rejects `score`/`scored_at` changes when `not is_admin()`.

> **Deadline enforcement:** enforce the per-review lock in the route handler (compare `now()` to `reviews.upload_deadline`) as the source of truth; the UI disable is convenience only.

### Leaderboard (derived)
```sql
create or replace view leaderboard as
select
  t.id, t.team_name, t.track_id,
  coalesce(sum(s.score), 0) as total_score,
  min(s.ppt_uploaded_at)    as first_submitted_at
from teams t
left join submissions s on s.team_id = t.id
group by t.id, t.team_name, t.track_id
order by total_score desc, first_submitted_at asc nulls last, t.team_name;
```

---

## 5. Storage (PPT uploads)
Supabase → **Storage** → create a **private** bucket named `submissions`.

Path convention: `teams/{team_id}/review-{n}/{filename}`.

Bucket policies (Storage → Policies, on `storage.objects`):
```sql
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
```
Enforce the 25 MB / file-type limit client-side before upload, and re-validate in the upload route handler.

---

## 6. Seed the single admin
1. Supabase → **Authentication → Users → Add user** → create the admin with a strong password.
2. In SQL Editor, promote it:
```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin@yourhackathon.com');
```
No admin signup exists in the app — this manual step is the only way an admin is created.

---

## 7. Suggested folder structure
```
src/
  app/
    (public)/            login, register, landing
    dashboard/           participant: tracks + 3 review slots
    admin/
      tracks/
      settings/          registration toggle + 3 review deadlines
      teams/             per-review submissions + scoring
      leaderboard/
    api/                 all backend logic — route handlers returning JSON
      tracks/            admin CRUD + authenticated read
      teams/             registration (account + team + members)
      settings/          registration toggle + 3 review deadlines
      submissions/       per-review PPT upload, github/demo links, status
      admin/
        teams/           list teams, per-review signed download, scoring
        leaderboard/     totals + CSV export
  lib/
    supabase/
      client.ts          browser client (anon key)
      server.ts          server client (cookies / service role)
    auth.ts              getUser(), requireAdmin() guards
    deadlines.ts         isReviewOpen(reviewNumber) helper
    validation.ts        zod schemas (incl. url() for github/demo)
  components/
```

---

## 8. Run, build, deploy
```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # run the production build locally
```
**Deploy (Vercel):** push to GitHub → import the repo in Vercel → add the three env vars from §3 → deploy. Add your Vercel domain to Supabase → **Authentication → URL Configuration** (Site URL + redirect URLs).

---

## 9. Suggested build order (phases)
Build and verify one phase before the next — keeps the AI-assisted build focused and testable.

1. **Auth + roles + route guards** — Supabase clients, login, `requireAdmin()`, redirects.
2. **Admin: tracks CRUD** — simplest admin-only feature; proves role gating works.
3. **Admin: settings** — registration toggle + the three review deadlines.
4. **Participant: registration + dashboard** — create account+team+members; show tracks live.
5. **Participant: 3 review slots** — per-review PPT upload to storage, optional GitHub + demo links, per-review deadline lock and status states.
6. **Admin: teams table + per-review download** — signed-URL download per review, show links.
7. **Scoring + leaderboard** — score each review /10, total across reviews, CSV export.
8. **Polish + deploy** — validation, empty states, responsive check, then ship to Vercel.

---

## 10. Definition of done (v1)
- A participant can register, log in, see tracks, and for each of the three reviews upload/replace a PPT plus optional GitHub and demo links, until that review's deadline.
- Each review's upload freezes automatically at its own deadline; registration freezes when closed.
- Admin can set all three deadlines, download every PPT per review, score each review /10, and view + export a leaderboard ranked on the total across the three reviews.
- Private bucket: no PPT is reachable without a server-issued signed URL.
