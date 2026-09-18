import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatLocalDateTime } from "@/lib/format";
import { DownloadPptButton } from "./download-ppt-button";
import { ScoreForm } from "./score-form";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Users,
  ChevronDown,
  Mail,
  Phone,
  Calendar,
  Globe,
  Award,
  ExternalLink,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";

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

  const teamCount = teams?.length ?? 0;
  const totalSubmissions = submissions?.length ?? 0;
  const scoredCount = submissions?.filter((s) => s.score !== null).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
              Cohort Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            Teams & Submissions
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-secondary">
            Inspect team roster, download review pitch decks, and record official scores
          </p>
        </div>

        {/* Quick summary chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-secondary">
            <Users className="h-3.5 w-3.5 text-muted" />
            <strong className="text-primary font-semibold">{teamCount}</strong> Teams
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-secondary">
            <Award className="h-3.5 w-3.5 text-accent" />
            <strong className="text-primary font-semibold">{scoredCount}</strong> / {totalSubmissions} Scored
          </span>
        </div>
      </div>

      {/* Teams List */}
      {!teams || teams.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No teams registered yet"
          description="Participant teams will appear here with submission decks and links once they register."
        />
      ) : (
        <div className="space-y-3">
          {teams.map((team) => {
            const teamSubmissions = submissionsByTeam.get(team.id);
            const teamMembers = membersByTeam.get(team.id) ?? [];
            const trackTitle = team.track_id
              ? trackTitleById.get(team.track_id) ?? "—"
              : "—";

            // Count how many reviews have submissions
            let submittedReviewCount = 0;
            for (const r of reviews ?? []) {
              if (teamSubmissions?.get(r.review_number)?.ppt_filename) {
                submittedReviewCount++;
              }
            }

            return (
              <details
                key={team.id}
                className="group rounded-2xl border border-border-subtle bg-surface transition-all duration-150 overflow-hidden shadow-sm hover:border-border-strong"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 sm:p-5 list-none select-none [&::-webkit-details-marker]:hidden hover:bg-surface-hover/60 transition-colors">
                  <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <h2 className="text-base font-bold text-primary tracking-tight truncate">
                      {team.team_name}
                    </h2>

                    <Badge variant="accent" className="text-xs">
                      {trackTitle}
                    </Badge>

                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Users className="h-3 w-3" />
                      {team.member_count} members
                    </span>

                    <span className="hidden md:inline-flex items-center gap-1 text-xs text-muted font-mono">
                      <Mail className="h-3 w-3" />
                      {team.contact_email}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 text-[11px] font-mono text-secondary border border-border-subtle">
                      {submittedReviewCount} / {(reviews ?? []).length} Uploaded
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted group-open:hidden">
                      Details & Scoring
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted transition-transform duration-200 group-open:rotate-180" />
                  </div>
                </summary>

                <div className="border-t border-border-subtle/70 bg-surface/40 p-4 sm:p-6 space-y-6">
                  {/* Team Contact & Roster Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-border-subtle bg-surface p-4 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                        Team Roster
                      </span>
                      <p className="text-secondary font-medium">
                        {teamMembers.length > 0 ? teamMembers.join(", ") : "—"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                        Contact Details
                      </span>
                      <div className="space-y-0.5 text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-muted" />
                          <span>{team.contact_email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-muted" />
                          <span>{team.contact_phone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                        Registration Time
                      </span>
                      <div className="flex items-center gap-1.5 text-secondary font-mono">
                        <Calendar className="h-3 w-3 text-muted" />
                        <span>{formatLocalDateTime(team.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dense Per-Review Breakdown & Scoring Table */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">
                      Milestone Reviews & Evaluations
                    </h3>

                    <div className="space-y-3">
                      {(reviews ?? []).map((review) => {
                        const submission = teamSubmissions?.get(review.review_number);

                        return (
                          <div
                            key={review.review_number}
                            className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5 transition-colors hover:border-border-strong space-y-3.5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border-subtle/50 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-accent">
                                  R{review.review_number}
                                </span>
                                <h4 className="text-sm font-bold text-primary">
                                  {review.title}
                                </h4>
                              </div>

                              <div>
                                {submission?.ppt_uploaded_at ? (
                                  <span className="text-[11px] text-muted font-mono">
                                    Submitted {formatLocalDateTime(submission.ppt_uploaded_at)}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-muted italic">
                                    No submission uploaded
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Presentation download & links row */}
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              {submission?.ppt_uploaded_at ? (
                                <DownloadPptButton
                                  submissionId={submission.id}
                                  filename={submission.ppt_filename}
                                />
                              ) : null}

                              {submission?.github_url ? (
                                <a
                                  href={submission.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-xs text-info hover:text-info/80 hover:border-border-strong transition-colors"
                                >
                                  <GithubIcon className="h-3.5 w-3.5" />
                                  <span>Repository</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              ) : null}

                              {submission?.demo_url ? (
                                <a
                                  href={submission.demo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-xs text-accent hover:text-accent/80 hover:border-border-strong transition-colors"
                                >
                                  <Globe className="h-3.5 w-3.5" />
                                  <span>Live Demo</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              ) : null}
                            </div>

                            {/* Scoring form: always available, even with no upload */}
                            <div className="pt-2 border-t border-border-subtle/50">
                              <ScoreForm
                                teamId={team.id}
                                reviewNumber={review.review_number as 1 | 2 | 3}
                                initialScore={submission?.score ?? null}
                                initialRemarks={submission?.remarks ?? null}
                              />
                              {submission?.scored_at ? (
                                <p className="mt-1.5 text-[11px] text-muted font-mono">
                                  Last evaluated: {formatLocalDateTime(submission.scored_at)}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
