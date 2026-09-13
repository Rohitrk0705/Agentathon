import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatLocalDateTime } from "@/lib/format";
import { DownloadPptButton } from "./download-ppt-button";
import { ScoreForm } from "./score-form";

type SubmissionRow = {
  id: string;
  team_id: string;
  review_number: number;
  ppt_path: string | null;
  ppt_filename: string | null;
  ppt_uploaded_at: string | null;
  github_url: string | null;
  demo_url: string | null;
  score: number | null;
  remarks: string | null;
  scored_at: string | null;
};

export default async function AdminTeamsPage() {
  await requireAdmin();

  const supabase = await createClient();

  const [
    { data: teams },
    { data: tracks },
    { data: members },
    { data: submissions },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("teams")
      .select("id, team_name, track_id, member_count, contact_email, contact_phone, created_at")
      .order("team_name", { ascending: true }),
    supabase.from("tracks").select("id, title"),
    supabase.from("team_members").select("team_id, name"),
    supabase
      .from("submissions")
      .select(
        "id, team_id, review_number, ppt_path, ppt_filename, ppt_uploaded_at, github_url, demo_url, score, remarks, scored_at",
      ),
    supabase
      .from("reviews")
      .select("review_number, title")
      .order("review_number", { ascending: true }),
  ]);

  const trackTitleById = new Map((tracks ?? []).map((t) => [t.id, t.title]));

  const membersByTeam = new Map<string, string[]>();
  for (const m of members ?? []) {
    const list = membersByTeam.get(m.team_id) ?? [];
    list.push(m.name);
    membersByTeam.set(m.team_id, list);
  }

  const submissionsByTeam = new Map<string, Map<number, SubmissionRow>>();
  for (const s of submissions ?? []) {
    const teamMap = submissionsByTeam.get(s.team_id) ?? new Map();
    teamMap.set(s.review_number, s);
    submissionsByTeam.set(s.team_id, teamMap);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
          Teams
        </h1>
        <p className="mt-1 text-sm text-secondary">
          {teams && teams.length > 0
            ? `${teams.length} registered team${teams.length === 1 ? "" : "s"}`
            : "No teams have registered yet"}
        </p>
      </div>

      <div className="space-y-4">
        {!teams || teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="h-10 w-10 text-muted mb-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 className="text-base font-semibold text-primary">No teams registered yet</h3>
            <p className="mt-1 text-sm text-secondary">
              Teams will appear here once they register
            </p>
          </div>
        ) : (
          teams.map((team) => {
            const teamSubmissions = submissionsByTeam.get(team.id);
            const teamMembers = membersByTeam.get(team.id) ?? [];
            const trackTitle = team.track_id
              ? trackTitleById.get(team.track_id) ?? "—"
              : "—";

            return (
              <details
                key={team.id}
                className="group rounded-lg border border-border-subtle bg-surface"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 md:p-6 list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <h2 className="text-base font-semibold text-primary truncate">
                      {team.team_name}
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-2.5 py-0.5 text-xs font-medium">
                      {trackTitle}
                    </span>
                    <span className="text-xs text-muted">
                      {team.member_count} member{team.member_count === 1 ? "" : "s"}
                    </span>
                    <span className="hidden md:inline text-xs text-muted">
                      {team.contact_email}
                    </span>
                  </div>
                  <svg
                    className="h-5 w-5 shrink-0 text-muted transition-transform duration-150 group-open:rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>

                <div className="border-t border-border-subtle px-4 md:px-6 py-4 md:py-6 space-y-4">
                  {/* Team details */}
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted uppercase tracking-wider">Members</dt>
                      <dd className="mt-0.5 text-secondary">
                        {teamMembers.length > 0 ? teamMembers.join(", ") : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted uppercase tracking-wider">Contact</dt>
                      <dd className="mt-0.5 text-secondary">
                        {team.contact_email} · {team.contact_phone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted uppercase tracking-wider">Registered</dt>
                      <dd className="mt-0.5 text-secondary font-[family-name:var(--font-geist-mono)] text-xs">
                        {formatLocalDateTime(team.created_at)}
                      </dd>
                    </div>
                  </dl>

                  {/* Reviews */}
                  <div className="space-y-3">
                    {(reviews ?? []).map((review) => {
                      const submission = teamSubmissions?.get(review.review_number);

                      return (
                        <div
                          key={review.review_number}
                          className="rounded-md border border-border-subtle bg-background p-4"
                        >
                          <h3 className="text-sm font-semibold text-primary">
                            {review.title}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                            {submission?.ppt_uploaded_at ? (
                              <>
                                <span className="text-secondary text-xs">
                                  Submitted{" "}
                                  <span className="font-[family-name:var(--font-geist-mono)]">
                                    {formatLocalDateTime(submission.ppt_uploaded_at)}
                                  </span>
                                </span>
                                <DownloadPptButton
                                  submissionId={submission.id}
                                  filename={submission.ppt_filename}
                                />
                              </>
                            ) : (
                              <span className="text-xs text-muted">Not submitted</span>
                            )}

                            {submission?.github_url ? (
                              <a
                                href={submission.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-info hover:text-info/80 transition-colors duration-150"
                              >
                                GitHub ↗
                              </a>
                            ) : null}

                            {submission?.demo_url ? (
                              <a
                                href={submission.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-info hover:text-info/80 transition-colors duration-150"
                              >
                                Demo ↗
                              </a>
                            ) : null}
                          </div>

                          {submission ? (
                            <div className="mt-3 pt-3 border-t border-border-subtle">
                              <ScoreForm
                                submissionId={submission.id}
                                initialScore={submission.score}
                                initialRemarks={submission.remarks}
                              />
                              {submission.scored_at ? (
                                <p className="mt-1 text-xs text-muted">
                                  Scored{" "}
                                  <span className="font-[family-name:var(--font-geist-mono)]">
                                    {formatLocalDateTime(submission.scored_at)}
                                  </span>
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>
            );
          })
        )}
      </div>
    </div>
  );
}
