import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ExportCsvButton } from "./export-csv-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy, Medal, Award } from "lucide-react";

export default async function AdminLeaderboardPage() {
  await requireAdmin();

  const supabase = await createClient();

  const [{ data: leaderboard }, { data: submissions }, { data: tracks }] =
    await Promise.all([
      supabase
        .from("leaderboard")
        .select("id, team_name, track_id, total_score, first_submitted_at"),
      supabase.from("submissions").select("team_id, review_number, score"),
      supabase.from("tracks").select("id, title"),
    ]);

  const trackTitleById = new Map((tracks ?? []).map((t) => [t.id, t.title]));

  const scoresByTeam = new Map<string, Map<number, number | null>>();
  for (const s of submissions ?? []) {
    const teamMap = scoresByTeam.get(s.team_id) ?? new Map();
    teamMap.set(s.review_number, s.score);
    scoresByTeam.set(s.team_id, teamMap);
  }

  const teamCount = leaderboard?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
              Live Competition Standings
            </span>
            <span className="inline-flex items-center rounded-full bg-surface-elevated border border-border-subtle px-2 py-0.5 text-xs text-secondary font-mono">
              {teamCount} Ranked Cohorts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            Official Leaderboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-secondary">
            Cumulative evaluation scores ranked across Review 1, 2, and 3 (Max 30.0 pts)
          </p>
        </div>

        <div className="shrink-0">
          <ExportCsvButton />
        </div>
      </div>

      {/* Leaderboard Table / Empty state */}
      {!leaderboard || leaderboard.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="No teams registered or evaluated yet"
          description="Scores and rankings will automatically update here as evaluations are saved by judges."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-elevated/80 text-secondary">
                  <th className="sticky top-0 px-4 sm:px-6 py-3.5 text-caption font-bold w-16 text-center">
                    Rank
                  </th>
                  <th className="sticky top-0 px-4 sm:px-6 py-3.5 text-caption font-bold">
                    Team Name
                  </th>
                  <th className="sticky top-0 px-4 sm:px-6 py-3.5 text-caption font-bold">
                    Track
                  </th>
                  <th className="sticky top-0 px-4 sm:px-6 py-3.5 text-caption font-bold text-center w-24">
                    R1 / 10
                  </th>
                  <th className="sticky top-0 px-4 sm:px-6 py-3.5 text-caption font-bold text-center w-24">
                    R2 / 10
                  </th>
                  <th className="sticky top-0 px-4 sm:px-6 py-3.5 text-caption font-bold text-center w-24">
                    R3 / 10
                  </th>
                  <th className="sticky top-0 px-4 sm:px-6 py-3.5 text-caption font-bold text-right w-28">
                    Total Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {leaderboard.map((team, i) => {
                  const teamScores = scoresByTeam.get(team.id);
                  const cell = (n: number) => {
                    const s = teamScores?.get(n);
                    return s === null || s === undefined ? null : Number(s).toFixed(1);
                  };

                  const isFirst = i === 0;
                  const isSecond = i === 1;
                  const isThird = i === 2;

                  return (
                    <tr
                      key={team.id}
                      className="hover:bg-surface-hover/70 transition-colors duration-150 group"
                    >
                      {/* Rank with Podium Styling */}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        {isFirst ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-bold font-mono">
                            <Trophy className="h-3.5 w-3.5" />
                          </span>
                        ) : isSecond ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-300/15 border border-slate-300/30 text-slate-300 text-xs font-bold font-mono">
                            <Medal className="h-3.5 w-3.5" />
                          </span>
                        ) : isThird ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700/15 border border-amber-700/30 text-amber-600 text-xs font-bold font-mono">
                            <Award className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-medium text-muted">
                            #{i + 1}
                          </span>
                        )}
                      </td>

                      {/* Team Name */}
                      <td className="px-4 sm:px-6 py-4">
                        <span className="font-semibold text-primary group-hover:text-accent transition-colors">
                          {team.team_name}
                        </span>
                      </td>

                      {/* Track */}
                      <td className="px-4 sm:px-6 py-4">
                        <Badge variant="accent" className="text-xs">
                          {team.track_id ? trackTitleById.get(team.track_id) ?? "—" : "—"}
                        </Badge>
                      </td>

                      {/* R1 Score Chip */}
                      <td className="px-4 sm:px-6 py-4 text-center font-mono tabular-nums">
                        {cell(1) !== null ? (
                          <span className="inline-flex items-center rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-primary border border-border-subtle font-medium">
                            {cell(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted/60">—</span>
                        )}
                      </td>

                      {/* R2 Score Chip */}
                      <td className="px-4 sm:px-6 py-4 text-center font-mono tabular-nums">
                        {cell(2) !== null ? (
                          <span className="inline-flex items-center rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-primary border border-border-subtle font-medium">
                            {cell(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted/60">—</span>
                        )}
                      </td>

                      {/* R3 Score Chip */}
                      <td className="px-4 sm:px-6 py-4 text-center font-mono tabular-nums">
                        {cell(3) !== null ? (
                          <span className="inline-flex items-center rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-primary border border-border-subtle font-medium">
                            {cell(3)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted/60">—</span>
                        )}
                      </td>

                      {/* Total Score */}
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <span
                          className={`font-mono text-sm font-bold tabular-nums ${
                            isFirst ? "text-accent" : "text-primary"
                          }`}
                        >
                          {Number(team.total_score).toFixed(1)}
                        </span>
                        <span className="text-[11px] text-muted font-mono ml-1">
                          / 30
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
