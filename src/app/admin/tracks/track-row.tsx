"use client";

import { useActionState } from "react";
import { updateTrack, deleteTrack, type TrackActionResult } from "./actions";

const initialState: TrackActionResult | null = null;

type Track = {
  id: string;
  title: string;
  description: string | null;
};

export function TrackRow({ track }: { track: Track }) {
  const [editState, editAction, editPending] = useActionState(
    updateTrack,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteTrack,
    initialState,
  );

  const inputClasses =
    "w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none transition-colors duration-150";

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border-subtle bg-surface p-6">
      <form action={editAction} className="flex-1 space-y-3">
        <input type="hidden" name="id" value={track.id} />

        <input
          name="title"
          type="text"
          defaultValue={track.title}
          required
          maxLength={200}
          className={inputClasses}
        />
        <textarea
          name="description"
          defaultValue={track.description ?? ""}
          rows={2}
          maxLength={2000}
          className={`${inputClasses} min-h-[60px]`}
        />

        {editState && "error" in editState ? (
          <p role="alert" className="text-sm text-danger">{editState.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={editPending}
          className="rounded-md border border-border-subtle bg-transparent px-3 py-1.5 text-sm text-primary hover:bg-surface-hover hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {editPending ? "Saving…" : "Save"}
        </button>
      </form>

      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!window.confirm("Delete this track?")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={track.id} />
        <button
          type="submit"
          disabled={deletePending}
          className="rounded-md border border-danger/40 bg-transparent px-3 py-1.5 text-sm text-danger hover:bg-danger hover:text-white hover:border-danger disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {deletePending ? "Deleting…" : "Delete"}
        </button>
        {deleteState && "error" in deleteState ? (
          <p role="alert" className="mt-1 text-sm text-danger">{deleteState.error}</p>
        ) : null}
      </form>
    </div>
  );
}
