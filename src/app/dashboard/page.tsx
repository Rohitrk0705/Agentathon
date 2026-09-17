import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ReviewSlots } from "./review-slots";
import type { SubmissionRow } from "./review-slot";
import { Users, Mail, Phone, Compass, CheckCircle2 } from "lucide-react";

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
          ? supabase.from("tracks").select("title, description").eq("id", team.track_id).single()
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
    <div className="space-y-8">
      {/* Top Team Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface/80 p-6 sm:p-8 backdrop-blur-md shadow-lg">
        {/* Ambient glow accent */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-15 blur-3xl"
          style={{ background: "var(--accent)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
                Team Workspace
              </span>
              {teamTrack?.title ? (
                <Badge variant="accent" dot>
                  {teamTrack.title}
                </Badge>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-primary">
              {team?.team_name ?? "Participant Team"}
            </h1>

            {/* Chips bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-xs text-secondary">
              {team?.contact_email ? (
                <div className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1 border border-border-subtle">
                  <Mail className="h-3.5 w-3.5 text-muted" />
                  <span>{team.contact_email}</span>
                </div>
              ) : null}

              {team?.contact_phone ? (
                <div className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1 border border-border-subtle">
                  <Phone className="h-3.5 w-3.5 text-muted" />
                  <span>{team.contact_phone}</span>
                </div>
              ) : null}

              {team ? (
                <div className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1 border border-border-subtle">
                  <Users className="h-3.5 w-3.5 text-muted" />
                  <span>{team.member_count} Member{team.member_count === 1 ? "" : "s"}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Team Members Avatar/List pills */}
          {members && members.length > 0 ? (
            <div className="flex flex-col md:items-end gap-2 pt-2 md:pt-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Roster
              </span>
              <div className="flex flex-wrap md:justify-end gap-1.5 max-w-sm">
                {members.map((m, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-xs text-primary border border-border-subtle/80"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Milestone Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-primary">
                Milestone Reviews
              </h2>
              <p className="text-xs sm:text-sm text-secondary mt-0.5">
                Submit presentation decks (.pptx / .pdf) and deployment links for evaluation
              </p>
            </div>
          </div>

          {team ? (
            <ReviewSlots
              teamId={team.id}
              reviews={reviews ?? []}
              submissions={submissionsMap}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-secondary">
                  No registered team found for your account. Please contact an organizer.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Track Info & Competition Guidelines */}
        <div className="space-y-6">
          {/* Active Assigned Track Card */}
          {teamTrack ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Your Assigned Track</span>
                </div>
                <CardTitle className="text-lg">{teamTrack.title}</CardTitle>
                {teamTrack.description ? (
                  <CardDescription className="text-xs mt-1">
                    {teamTrack.description}
                  </CardDescription>
                ) : null}
              </CardHeader>
            </Card>
          ) : null}

          {/* All Tracks Grid Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <Compass className="h-3.5 w-3.5" />
                <span>All Event Tracks</span>
              </div>
              <CardTitle className="text-base">Tracks Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {tracks && tracks.length > 0 ? (
                tracks.map((track) => {
                  const isCurrent = track.id === team?.track_id;
                  return (
                    <div
                      key={track.id}
                      className={`rounded-xl border p-3.5 transition-colors ${
                        isCurrent
                          ? "border-accent/40 bg-accent-muted/40"
                          : "border-border-subtle bg-surface-elevated/40 hover:border-border-strong"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-primary">
                          {track.title}
                        </h4>
                        {isCurrent ? (
                          <Badge variant="accent" className="text-[10px] px-1.5 py-0">
                            Your Track
                          </Badge>
                        ) : null}
                      </div>
                      {track.description ? (
                        <p className="mt-1 text-[11px] text-muted line-clamp-2 leading-relaxed">
                          {track.description}
                        </p>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted">No tracks configured yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
