"use server";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ExportCsvResult =
  | { ok: true; csv: string; filename: string }
  | { error: string };

function csvEscape(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportLeaderboardCsv(): Promise<ExportCsvResult> {
  await requireAdmin();

  const supabase = await createClient();

  const [
    { data: leaderboard },
    { data: submissions },
    { data: tracks },
    { data: teams },
    { data: members },
  ] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("id, team_name, track_id, total_score, first_submitted_at"),
    supabase.from("submissions").select("team_id, review_number, score"),
    supabase.from("tracks").select("id, title"),
    supabase.from("teams").select("id, contact_email, contact_phone"),
    supabase.from("team_members").select("team_id, name"),
  ]);

  if (!leaderboard) {
    return { error: "Could not load leaderboard data." };
  }

  const trackTitleById = new Map((tracks ?? []).map((t) => [t.id, t.title]));
  const contactByTeam = new Map((teams ?? []).map((t) => [t.id, t]));

  const membersByTeam = new Map<string, string[]>();
  for (const m of members ?? []) {
    const list = membersByTeam.get(m.team_id) ?? [];
    list.push(m.name);
    membersByTeam.set(m.team_id, list);
  }

  const scoresByTeam = new Map<string, Map<number, number | null>>();
  for (const s of submissions ?? []) {
    const teamMap = scoresByTeam.get(s.team_id) ?? new Map();
    teamMap.set(s.review_number, s.score);
    scoresByTeam.set(s.team_id, teamMap);
  }

  const header = "Rank,Team,Track,R1,R2,R3,Total,Members,Contact Email,Contact Phone";

  const rows = leaderboard.map((team, i) => {
    const teamScores = scoresByTeam.get(team.id);
    const scoreCell = (n: number) => {
      const s = teamScores?.get(n);
      return s === null || s === undefined ? "" : Number(s).toFixed(1);
    };
    const contact = contactByTeam.get(team.id);
    const memberNames = (membersByTeam.get(team.id) ?? []).join(", ");

    return [
      csvEscape(i + 1),
      csvEscape(team.team_name),
      csvEscape(team.track_id ? trackTitleById.get(team.track_id) ?? "" : ""),
      csvEscape(scoreCell(1)),
      csvEscape(scoreCell(2)),
      csvEscape(scoreCell(3)),
      csvEscape(Number(team.total_score).toFixed(1)),
      csvEscape(memberNames),
      csvEscape(contact?.contact_email ?? ""),
      csvEscape(contact?.contact_phone ?? ""),
    ].join(",");
  });

  const csv = [header, ...rows].join("\r\n");
  const filename = `agentathon-leaderboard-${new Date().toISOString().slice(0, 10)}.csv`;

  return { ok: true, csv, filename };
}
