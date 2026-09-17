"use client";

import { useActionState, useCallback, useState } from "react";
import { reviewStatus } from "@/lib/deadlines";
import { SuccessToast } from "@/components/success-toast";
import { ClientOnlyDateTime } from "@/components/client-only-datetime";
import { setReviewDeadline, type SettingsActionResult } from "./actions";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Label, FieldError } from "@/components/ui/input";
import { Calendar, Save, Trash2 } from "lucide-react";

const initialState: SettingsActionResult | null = null;

type Review = {
  review_number: 1 | 2 | 3;
  title: string;
  upload_deadline: string | null;
};

function isoToLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function ReviewDeadlineCard({ review }: { review: Review }) {
  const [state, formAction, pending] = useActionState(
    setReviewDeadline,
    initialState,
  );
  const [localValue, setLocalValue] = useState(
    review.upload_deadline ? isoToLocalInputValue(review.upload_deadline) : "",
  );
  const [lastHandledState, setLastHandledState] = useState(state);
  const [dismissed, setDismissed] = useState(false);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    setDismissed(false);
  }

  const dismiss = useCallback(() => setDismissed(true), []);
  const status = reviewStatus(review.upload_deadline);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border-subtle/50 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">
            Stage {review.review_number}
          </span>
          <h3 className="text-base font-bold text-primary tracking-tight">
            {review.title}
          </h3>
        </div>
        <div>
          <StatusPill status={status} />
        </div>
      </div>

      <div className="text-xs text-secondary flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-muted" />
        <span>Current Active Deadline:</span>
        {review.upload_deadline ? (
          <span className="font-mono text-primary font-medium">
            <ClientOnlyDateTime iso={review.upload_deadline} />
          </span>
        ) : (
          <span className="text-muted italic">No cutoff configured</span>
        )}
      </div>

      <form
        action={(formData) => {
          const intent = formData.get("intent");
          if (intent === "clear") {
            formData.set("upload_deadline", "");
          } else {
            const local = formData.get("upload_deadline");
            if (typeof local === "string" && local !== "") {
              formData.set("upload_deadline", new Date(local).toISOString());
            }
          }
          formAction(formData);
        }}
        className="space-y-4 pt-1"
      >
        <input type="hidden" name="review_number" value={review.review_number} />

        <div>
          <Label htmlFor={`deadline_${review.review_number}`}>
            Select Upload Deadline
          </Label>
          <input
            id={`deadline_${review.review_number}`}
            type="datetime-local"
            name="upload_deadline"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface px-3.5 py-2 text-sm text-primary font-mono focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors"
          />
        </div>

        {state && "error" in state ? (
          <FieldError>{state.error}</FieldError>
        ) : null}
        {!pending && !dismissed && state && "ok" in state && state.ok ? (
          <SuccessToast message="Review deadline updated." onDismiss={dismiss} />
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <Button
            type="submit"
            name="intent"
            value="save"
            variant="primary"
            size="sm"
            loading={pending}
            icon={<Save className="h-3.5 w-3.5" />}
          >
            {pending ? "Saving…" : "Save Deadline"}
          </Button>

          <Button
            type="submit"
            name="intent"
            value="clear"
            variant="ghost"
            size="sm"
            disabled={pending || !review.upload_deadline}
            onClick={() => setLocalValue("")}
            icon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Clear Cutoff
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ReviewDeadlines({ reviews }: { reviews: Review[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {reviews.map((review) => (
        <ReviewDeadlineCard key={review.review_number} review={review} />
      ))}
    </div>
  );
}
