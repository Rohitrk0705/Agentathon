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

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-gray-200 p-4">
      <form action={editAction} className="flex-1 space-y-2">
        <input type="hidden" name="id" value={track.id} />

        <input
          name="title"
          type="text"
          defaultValue={track.title}
          required
          maxLength={200}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <textarea
          name="description"
          defaultValue={track.description ?? ""}
          rows={2}
          maxLength={2000}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />

        {editState && "error" in editState ? (
          <p className="text-sm text-red-600">{editState.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={editPending}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
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
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
        >
          {deletePending ? "Deleting…" : "Delete"}
        </button>
        {deleteState && "error" in deleteState ? (
          <p className="mt-1 text-sm text-red-600">{deleteState.error}</p>
        ) : null}
      </form>
    </div>
  );
}
