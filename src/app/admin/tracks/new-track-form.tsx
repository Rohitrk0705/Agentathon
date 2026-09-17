"use client";

import { useActionState, useRef, useState } from "react";
import { createTrack, type TrackActionResult } from "./actions";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

const initialState: TrackActionResult | null = null;

export function NewTrackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createTrack,
    initialState,
  );
  const [lastHandledState, setLastHandledState] = useState(state);
  const formRef = useRef<HTMLFormElement>(null);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state && "ok" in state && state.ok) {
      setIsOpen(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={() => setIsOpen(true)}
        icon={<Plus className="h-4 w-4" />}
      >
        Create New Track
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Problem Track"
        description="Add a new challenge track or domain for participating teams."
      >
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="title" requiredBadge>
              Track Title
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              maxLength={200}
              placeholder="e.g. Autonomous Financial Analysts"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              maxLength={2000}
              placeholder="Guidelines, criteria, and problem scope for this track..."
            />
          </div>

          {state && "error" in state ? (
            <FieldError>{state.error}</FieldError>
          ) : null}

          <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={pending}
            >
              {pending ? "Creating…" : "Save Track"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
