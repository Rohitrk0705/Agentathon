import Link from "next/link";
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
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/admin" className="text-sm text-gray-500 hover:underline">
        ← Back to admin
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ranked by total score across all three reviews.
          </p>
        </div>
        <ExportCsvButton />
      </div>

      {!leaderboard || leaderboard.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No teams registered yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2 pr-3">Team</th>
                <th className="py-2 pr-3">Track</th>
                <th className="py-2 pr-3">R1</th>
                <th className="py-2 pr-3">R2</th>
                <th className="py-2 pr-3">R3</th>
                <th className="py-2 pr-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((team, i) => {
                const teamScores = scoresByTeam.get(team.id);
                const cell = (n: number) => {
                  const s = teamScores?.get(n);
                  return s === null || s === undefined ? "—" : Number(s).toFixed(1);
                };

                return (
                  <tr key={team.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3">{i + 1}</td>
                    <td className="py-2 pr-3 font-medium text-gray-900">
                      {team.team_name}
                    </td>
                    <td className="py-2 pr-3">
                      {team.track_id ? trackTitleById.get(team.track_id) ?? "—" : "—"}
                    </td>
                    <td className="py-2 pr-3">{cell(1)}</td>
                    <td className="py-2 pr-3">{cell(2)}</td>
                    <td className="py-2 pr-3">{cell(3)}</td>
                    <td className="py-2 pr-3 font-medium">
                      {Number(team.total_score).toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
