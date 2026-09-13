import Link from "next/link";
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
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/admin" className="text-sm text-gray-500 hover:underline">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-semibold">Teams</h1>
      <p className="mt-1 text-sm text-gray-500">
        Every registered team, their submissions, and links per review.
      </p>

      <div className="mt-6 space-y-6">
        {!teams || teams.length === 0 ? (
          <p className="text-sm text-gray-500">No teams have registered yet.</p>
        ) : (
          teams.map((team) => {
            const teamSubmissions = submissionsByTeam.get(team.id);
            const teamMembers = membersByTeam.get(team.id) ?? [];

            return (
              <div key={team.id} className="rounded-md border border-gray-200 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-bold text-gray-900">{team.team_name}</h2>
                  <span className="text-xs text-gray-500">
                    Registered {formatLocalDateTime(team.created_at)}
                  </span>
                </div>

                <dl className="mt-2 space-y-1 text-sm text-gray-700">
                  <div>
                    <dt className="inline font-medium">Track: </dt>
                    <dd className="inline">
                      {team.track_id ? trackTitleById.get(team.track_id) ?? "—" : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Members ({team.member_count}): </dt>
                    <dd className="inline">
                      {teamMembers.length > 0 ? teamMembers.join(", ") : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Contact: </dt>
                    <dd className="inline">
                      {team.contact_email} · {team.contact_phone}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-3">
                  {(reviews ?? []).map((review) => {
                    const submission = teamSubmissions?.get(review.review_number);

                    return (
                      <div
                        key={review.review_number}
                        className="rounded-md border border-gray-100 bg-gray-50 p-3"
                      >
                        <h3 className="text-sm font-medium text-gray-900">
                          {review.title}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                          {submission?.ppt_uploaded_at ? (
                            <>
                              <span className="text-gray-700">
                                Submitted {formatLocalDateTime(submission.ppt_uploaded_at)}
                              </span>
                              <DownloadPptButton
                                submissionId={submission.id}
                                filename={submission.ppt_filename}
                              />
                            </>
                          ) : (
                            <span className="text-gray-500">Not submitted</span>
                          )}

                          {submission?.github_url ? (
                            <a
                              href={submission.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              GitHub ↗
                            </a>
                          ) : null}

                          {submission?.demo_url ? (
                            <a
                              href={submission.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Demo ↗
                            </a>
                          ) : null}
                        </div>

                        {submission ? (
                          <div className="mt-2">
                            <ScoreForm
                              submissionId={submission.id}
                              initialScore={submission.score}
                              initialRemarks={submission.remarks}
                            />
                            {submission.scored_at ? (
                              <p className="mt-1 text-xs text-gray-500">
                                Scored {formatLocalDateTime(submission.scored_at)}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
