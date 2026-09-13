"use client";

import { useActionState, useCallback, useState } from "react";
import { reviewStatus } from "@/lib/deadlines";
import { SuccessToast } from "@/components/success-toast";
import { setReviewDeadline, type SettingsActionResult } from "./actions";

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

const STATUS_LABEL: Record<ReturnType<typeof reviewStatus>, string> = {
  not_open: "Not open",
  open: "Open",
  locked: "Locked",
};

const STATUS_CLASS: Record<ReturnType<typeof reviewStatus>, string> = {
  not_open: "bg-gray-100 text-gray-700",
  open: "bg-green-100 text-green-700",
  locked: "bg-red-100 text-red-700",
};

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
    <div className="rounded-md border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">{review.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
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
        className="mt-3 space-y-2"
      >
        <input type="hidden" name="review_number" value={review.review_number} />

        <input
          type="datetime-local"
          name="upload_deadline"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />

        {state && "error" in state ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}
        {!pending && !dismissed && state && "ok" in state && state.ok ? (
          <SuccessToast message="Saved." onDismiss={dismiss} />
        ) : null}

        <div className="flex gap-2">
          <button
            type="submit"
            name="intent"
            value="save"
            disabled={pending}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save deadline"}
          </button>
          <button
            type="submit"
            name="intent"
            value="clear"
            disabled={pending}
            onClick={() => setLocalValue("")}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Clear deadline
          </button>
        </div>
      </form>
    </div>
  );
}

export function ReviewDeadlines({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewDeadlineCard key={review.review_number} review={review} />
      ))}
    </div>
  );
}
