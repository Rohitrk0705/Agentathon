import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewTrackForm } from "./new-track-form";
import { TrackRow } from "./track-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Layers } from "lucide-react";

export default async function AdminTracksPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: tracks } = await supabase
    .from("tracks")
    .select("id, title, description")
    .order("created_at", { ascending: false });

  const trackCount = tracks?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
              Competition Domains
            </span>
            <span className="inline-flex items-center rounded-full bg-surface-elevated border border-border-subtle px-2 py-0.5 text-xs text-secondary font-mono">
              {trackCount} Track{trackCount === 1 ? "" : "s"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            Tracks Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-secondary">
            Define and manage problem categories available for team registration
          </p>
        </div>

        <div className="shrink-0">
          <NewTrackForm />
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-3">
        {tracks && tracks.length > 0 ? (
          tracks.map((track) => <TrackRow key={track.id} track={track} />)
        ) : (
          <EmptyState
            icon={<Layers className="h-6 w-6" />}
            title="No tracks created yet"
            description="Create your first competition track to let participants pick their challenge domain."
            action={<NewTrackForm />}
          />
        )}
      </div>
    </div>
  );
}
