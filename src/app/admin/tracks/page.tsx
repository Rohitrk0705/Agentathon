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
    <div>
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
          Tracks
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Problem statements teams can pick
        </p>
      </div>

      <div className="mb-8">
        <NewTrackForm />
      </div>

      <div className="space-y-4">
        {tracks && tracks.length > 0 ? (
          tracks.map((track) => <TrackRow key={track.id} track={track} />)
        ) : (
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
              <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
              <path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
              <path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
            </svg>
            <h3 className="text-base font-semibold text-primary">No tracks yet</h3>
            <p className="mt-1 text-sm text-secondary">
              Add your first track above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
