import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { user } = await requireUser();

  const supabase = await createClient();

  const [{ data: team }, { data: tracks }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, team_name, track_id, member_count, contact_email, contact_phone")
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
      .from("tracks")
      .select("id, title, description")
      .order("title", { ascending: true }),
  ]);

  const [{ data: members }, { data: teamTrack }] = team
    ? await Promise.all([
        supabase.from("team_members").select("name").eq("team_id", team.id),
        team.track_id
          ? supabase.from("tracks").select("title").eq("id", team.track_id).single()
          : Promise.resolve({ data: null }),
      ])
    : [{ data: null }, { data: null }];

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Agentathon</h1>
        <form action="/logout" method="POST">
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            Sign out
          </button>
        </form>
      </div>

      <section className="mt-8 rounded-md border border-gray-200 p-4">
        <h2 className="text-sm font-medium text-gray-900">Your team</h2>
        {team ? (
          <dl className="mt-2 space-y-1 text-sm text-gray-700">
            <div>
              <dt className="inline font-medium">Team name: </dt>
              <dd className="inline">{team.team_name}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Track: </dt>
              <dd className="inline">{teamTrack?.title ?? "—"}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Members ({team.member_count}): </dt>
              <dd className="inline">
                {members && members.length > 0
                  ? members.map((m) => m.name).join(", ")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">Contact email: </dt>
              <dd className="inline">{team.contact_email}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Contact phone: </dt>
              <dd className="inline">{team.contact_phone}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            No team found for your account. Contact the organizers.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-gray-900">Tracks</h2>
        <div className="mt-2 space-y-3">
          {tracks && tracks.length > 0 ? (
            tracks.map((track) => (
              <div key={track.id} className="rounded-md border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900">{track.title}</h3>
                {track.description ? (
                  <p className="mt-1 text-sm text-gray-600">{track.description}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No tracks yet.</p>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-md border border-gray-200 p-4">
        <h2 className="text-sm font-medium text-gray-900">Reviews</h2>
        <p className="mt-2 text-sm text-gray-500">
          Review submission slots coming in the next update.
        </p>
      </section>
    </main>
  );
}
