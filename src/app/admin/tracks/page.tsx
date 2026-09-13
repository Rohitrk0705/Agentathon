import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewTrackForm } from "./new-track-form";
import { TrackRow } from "./track-row";

export default async function AdminTracksPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: tracks } = await supabase
    .from("tracks")
    .select("id, title, description")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/admin" className="text-sm text-gray-500 hover:underline">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-semibold">Tracks</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage the tracks teams can register against.
      </p>

      <div className="mt-6">
        <NewTrackForm />
      </div>

      <div className="mt-8 space-y-4">
        {tracks && tracks.length > 0 ? (
          tracks.map((track) => <TrackRow key={track.id} track={track} />)
        ) : (
          <p className="text-sm text-gray-500">No tracks yet.</p>
        )}
      </div>
    </main>
  );
}
