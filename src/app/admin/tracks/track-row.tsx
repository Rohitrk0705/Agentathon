"use client";

import { useActionState, useState } from "react";
import { updateTrack, deleteTrack, type TrackActionResult } from "./actions";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Trash2 } from "lucide-react";

const initialState: TrackActionResult | null = null;

type Track = {
  id: string;
  title: string;
  description: string | null;
};

export function TrackRow({ track }: { track: Track }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editState, editAction, editPending] = useActionState(
    updateTrack,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteTrack,
    initialState,
  );
  const [lastHandledEdit, setLastHandledEdit] = useState(editState);

  if (editState !== lastHandledEdit) {
    setLastHandledEdit(editState);
    if (editState && "ok" in editState && editState.ok) {
      setIsEditOpen(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-border-subtle bg-surface p-5 transition-all duration-150 hover:border-border-strong">
      <div className="space-y-1 min-w-0 flex-1">
        <h3 className="text-base font-semibold text-primary tracking-tight">
          {track.title}
        </h3>
        {track.description ? (
          <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-2xl">
            {track.description}
          </p>
        ) : (
          <p className="text-xs text-muted italic">No description provided.</p>
        )}
      </div>

      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsEditOpen(true)}
          icon={<Edit2 className="h-3.5 w-3.5" />}
        >
          Edit
        </Button>

        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!window.confirm(`Delete the track "${track.title}"? This cannot be undone.`)) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={track.id} />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            loading={deletePending}
            disabled={deletePending}
            icon={<Trash2 className="h-3.5 w-3.5" />}
          >
            {deletePending ? "Deleting…" : "Delete"}
          </Button>
          {deleteState && "error" in deleteState ? (
            <p role="alert" className="mt-1 text-xs text-danger">{deleteState.error}</p>
          ) : null}
        </form>
      </div>

      {/* Edit Track Modal Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Track"
        description="Update the title and problem description for this track."
      >
        <form action={editAction} className="space-y-4">
          <input type="hidden" name="id" value={track.id} />

          <div>
            <Label htmlFor={`edit_title_${track.id}`} requiredBadge>
              Track Title
            </Label>
            <Input
              id={`edit_title_${track.id}`}
              name="title"
              type="text"
              defaultValue={track.title}
              required
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor={`edit_description_${track.id}`}>
              Description (Optional)
            </Label>
            <Textarea
              id={`edit_description_${track.id}`}
              name="description"
              defaultValue={track.description ?? ""}
              rows={3}
              maxLength={2000}
            />
          </div>

          {editState && "error" in editState ? (
            <FieldError>{editState.error}</FieldError>
          ) : null}

          <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditOpen(false)}
              disabled={editPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={editPending}
            >
              {editPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
