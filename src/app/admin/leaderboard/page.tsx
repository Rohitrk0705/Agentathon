import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ExportCsvButton } from "./export-csv-button";

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

  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
            Leaderboard
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Ranked by total score across all three reviews
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <ExportCsvButton />
        </div>
      </div>

      {!leaderboard || leaderboard.length === 0 ? (
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
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
          <h3 className="text-base font-semibold text-primary">
            No teams registered yet
          </h3>
          <p className="mt-1 text-sm text-secondary">
            Scores will appear here once teams are registered and scored
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface text-left">
                <th className="sticky top-0 bg-surface px-4 py-3 text-caption font-medium">
                  Rank
                </th>
                <th className="sticky top-0 bg-surface px-4 py-3 text-caption font-medium">
                  Team
                </th>
                <th className="sticky top-0 bg-surface px-4 py-3 text-caption font-medium">
                  Track
                </th>
                <th className="sticky top-0 bg-surface px-4 py-3 text-caption font-medium text-right">
                  R1
                </th>
                <th className="sticky top-0 bg-surface px-4 py-3 text-caption font-medium text-right">
                  R2
                </th>
                <th className="sticky top-0 bg-surface px-4 py-3 text-caption font-medium text-right">
                  R3
                </th>
                <th className="sticky top-0 bg-surface px-4 py-3 text-caption font-medium text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((team, i) => {
                const teamScores = scoresByTeam.get(team.id);
                const cell = (n: number) => {
                  const s = teamScores?.get(n);
                  return s === null || s === undefined ? "—" : Number(s).toFixed(1);
                };
                const isFirst = i === 0;

                return (
                  <tr
                    key={team.id}
                    className="border-b border-border-subtle last:border-b-0 hover:bg-surface-hover transition-colors duration-150"
                  >
                    <td className="px-4 py-3 font-[family-name:var(--font-geist-mono)] text-xs text-muted">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-primary">
                      {team.team_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-2.5 py-0.5 text-xs font-medium">
                        {team.track_id ? trackTitleById.get(team.track_id) ?? "—" : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-[family-name:var(--font-geist-mono)] tabular-nums text-secondary">
                      {cell(1) === "—" ? (
                        <span className="text-muted">—</span>
                      ) : (
                        cell(1)
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-[family-name:var(--font-geist-mono)] tabular-nums text-secondary">
                      {cell(2) === "—" ? (
                        <span className="text-muted">—</span>
                      ) : (
                        cell(2)
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-[family-name:var(--font-geist-mono)] tabular-nums text-secondary">
                      {cell(3) === "—" ? (
                        <span className="text-muted">—</span>
                      ) : (
                        cell(3)
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-[family-name:var(--font-geist-mono)] tabular-nums font-semibold ${
                        isFirst ? "text-accent" : "text-primary"
                      }`}
                    >
                      {Number(team.total_score).toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
