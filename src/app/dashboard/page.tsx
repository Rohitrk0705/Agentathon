import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ReviewSlots } from "./review-slots";
import type { SubmissionRow } from "./review-slot";

export default async function DashboardPage() {
  const { user } = await requireUser();

  const supabase = await createClient();

  const [{ data: team }, { data: tracks }, { data: reviews }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, team_name, track_id, member_count, contact_email, contact_phone")
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
      .from("tracks")
      .select("id, title, description")
      .order("title", { ascending: true }),
    supabase
      .from("reviews")
      .select("review_number, title, upload_deadline")
      .order("review_number", { ascending: true }),
  ]);

  const [{ data: members }, { data: teamTrack }, { data: submissions }] = team
    ? await Promise.all([
        supabase.from("team_members").select("name").eq("team_id", team.id),
        team.track_id
          ? supabase.from("tracks").select("title").eq("id", team.track_id).single()
          : Promise.resolve({ data: null }),
        supabase
          .from("submissions")
          .select("review_number, ppt_filename, ppt_uploaded_at, github_url, demo_url")
          .eq("team_id", team.id),
      ])
    : [{ data: null }, { data: null }, { data: null }];

  const submissionsMap: Record<number, SubmissionRow | undefined> = {};
  for (const s of submissions ?? []) {
    submissionsMap[s.review_number] = {
      ppt_filename: s.ppt_filename,
      ppt_uploaded_at: s.ppt_uploaded_at,
      github_url: s.github_url,
      demo_url: s.demo_url,
    };
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
            Welcome, {team?.team_name ?? "Participant"}
          </h1>
          {teamTrack?.title ? (
            <Badge variant="accent">{teamTrack.title}</Badge>
          ) : null}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-primary">
              Reviews
            </h2>
            <p className="text-caption mt-1">
              Submit your work for each review stage
            </p>
          </div>

          {team ? (
            <ReviewSlots
              teamId={team.id}
              reviews={reviews ?? []}
              submissions={submissionsMap}
            />
          ) : (
            <div className="rounded-lg border border-border-subtle bg-surface p-6 text-center">
              <p className="text-sm text-secondary">
                No team found for your account. Contact the organizers.
              </p>
            </div>
          )}
        </div>

        {/* Right column — Sidebar */}
        <div className="space-y-6">
          {/* Team info card */}
          <div className="rounded-lg border border-border-subtle bg-surface p-6">
            <h2 className="text-base font-semibold text-primary mb-4">
              Your Team
            </h2>
            {team ? (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted uppercase tracking-wider">Team</dt>
                  <dd className="mt-0.5 text-primary font-medium">{team.team_name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase tracking-wider">Track</dt>
                  <dd className="mt-0.5 text-primary">{teamTrack?.title ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase tracking-wider">
                    Members ({team.member_count})
                  </dt>
                  <dd className="mt-0.5 text-secondary">
                    {members && members.length > 0 ? (
                      <ul className="space-y-0.5">
                        {members.map((m, i) => (
                          <li key={i}>{m.name}</li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase tracking-wider">Email</dt>
                  <dd className="mt-0.5 text-secondary">{team.contact_email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase tracking-wider">Phone</dt>
                  <dd className="mt-0.5 text-secondary">{team.contact_phone}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-secondary">
                No team found for your account.
              </p>
            )}
          </div>

          {/* All tracks card */}
          <div className="rounded-lg border border-border-subtle bg-surface p-6">
            <h2 className="text-base font-semibold text-primary mb-4">
              All Tracks
            </h2>
            <div className="space-y-3">
              {tracks && tracks.length > 0 ? (
                tracks.map((track) => (
                  <div key={track.id}>
                    <h3 className="text-sm font-medium text-primary">
                      {track.title}
                    </h3>
                    {track.description ? (
                      <p className="mt-0.5 text-xs text-muted">{track.description}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted">No tracks yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
