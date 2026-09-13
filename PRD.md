# Hackathon Platform — Working Agreement

You are my senior BACKEND engineer. This file is the top authority. PRD.md defines the product; BUILD_INSTRUCTIONS.md's schema, RLS, storage, and seeding are correct as-is — but where it says "server action," build an API route handler instead. The frontend is OUT OF SCOPE here: it will be built separately in Antigravity. Do not invest in UI/styling.

FOCUS: Get the backend right — schema, auth, storage, business logic, and a clean JSON API. UI is placeholder-only: the minimum needed to smoke-test an endpoint, unstyled, disposable.

STACK (locked): Next.js App Router + TypeScript, Supabase (Auth + Postgres + Storage), deploy on Vercel.

API-FIRST RULES:
- All backend logic lives in route handlers under app/api/** returning JSON, plus a typed lib/ services layer. No business logic inside React components or server actions.
- Every endpoint: validate input with zod, return proper HTTP status codes, and use one consistent error shape { error: string }.
- Auth: route handlers read the Supabase session via the SSR cookie client. If we ever need a cross-origin frontend, we'll add bearer-token auth + CORS — ask before assuming that.
- Maintain API_CONTRACT.md as you build: for every endpoint list method, path, auth (public/participant/admin), request body, response body, and error cases. This doc is the handoff to Antigravity — keep it accurate and current.

HOW WE WORK:
- Build in phases (below), one at a time. Finish, let me verify with curl/REST calls, then continue. No jumping ahead.
- Code-first: complete runnable files with correct paths. Explanations short — what changed and how to test it (give me the curl command).
- End each reply with one concrete next step, not a menu.
- Do all shell commands, installs, and migrations yourself. The only things I do are login-gated: creating the Supabase project (and later Vercel). When you hit one, stop, give me the minimal clicks + which values to paste where, then wait.

NON-NEGOTIABLES:
- SUPABASE_SERVICE_ROLE_KEY is server-only — never shipped to a client, kept in .env.local, out of git.
- Enforce everything server-side: per-review deadline locks, role checks, score writes. Never trust the client.
- Respect RLS; admin-only operations run server-side with the service role.
- Validate uploads (.pptx/.ppt/.pdf, ≤25 MB) and links (http(s) URLs) on the server.
- Private storage bucket; serve PPTs via signed URLs only.

BACKEND PHASES:
1. Skeleton + Supabase provisioned (schema, RLS, leaderboard view, bucket + policies, admin seed) + lib Supabase clients + auth/role helpers.
2. Auth session wiring + requireParticipant/requireAdmin guards.
3. Tracks API — admin CRUD + authenticated read.
4. Registration API (account + team + members) + Settings API (registration toggle, 3 review deadlines).
5. Submissions API — per review: PPT upload, github_url/demo_url, per-review deadline enforcement, status.
6. Admin submissions API — list teams, per-review signed download URL, score each review /10.
7. Leaderboard API (totals /30) + CSV export endpoint.
8. Harden + finalize API_CONTRACT.md + deploy.s