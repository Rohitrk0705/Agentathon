"use client";

import { useActionState, useCallback, useState } from "react";
import { SuccessToast } from "@/components/success-toast";
import { scoreSubmission, type ScoreActionResult } from "./actions";

const initialState: ScoreActionResult | null = null;

function useDismissableSuccess(state: ScoreActionResult | null) {
  const [lastHandledState, setLastHandledState] = useState(state);
  const [dismissed, setDismissed] = useState(false);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    setDismissed(false);
  }

  const dismiss = useCallback(() => setDismissed(true), []);
  return { dismissed, dismiss };
}

export function ScoreForm({
  submissionId,
  initialScore,
  initialRemarks,
}: {
  submissionId: string;
  initialScore: number | null;
  initialRemarks: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    scoreSubmission,
    initialState,
  );
  const toast = useDismissableSuccess(state);

  const [scoreValue, setScoreValue] = useState(
    initialScore === null ? "" : String(initialScore),
  );
  const [clientError, setClientError] = useState<string | null>(null);

  function handleScoreChange(value: string) {
    setScoreValue(value);

    if (value === "") {
      setClientError(null);
      return;
    }

    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || num > 10) {
      setClientError("Score must be between 0 and 10.");
      return;
    }

    setClientError(null);
  }

  return (
    <form
      action={formAction}
      className="space-y-3"
      onSubmit={(e) => {
        if (clientError) e.preventDefault();
      }}
    >
      <input type="hidden" name="submission_id" value={submissionId} />

      <div className="flex flex-wrap items-center gap-3">
        <label
          className="text-xs text-muted"
          htmlFor={`score_${submissionId}`}
        >
          Score
        </label>
        <input
          id={`score_${submissionId}`}
          name="score"
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={scoreValue}
          onChange={(e) => handleScoreChange(e.target.value)}
          className="w-20 rounded-md border border-border-subtle bg-surface px-2 py-1.5 text-sm text-primary font-[family-name:var(--font-geist-mono)] tabular-nums focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none transition-colors duration-150"
        />

        <button
          type="submit"
          disabled={pending || !!clientError}
          className="rounded-md border border-border-subtle bg-transparent px-3 py-1.5 text-sm text-primary hover:bg-surface-hover hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {pending ? "Saving…" : "Save score"}
        </button>
      </div>

      <textarea
        name="remarks"
        rows={2}
        maxLength={2000}
        defaultValue={initialRemarks ?? ""}
        placeholder="Remarks (optional)"
        className="w-full min-h-[60px] rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none transition-colors duration-150"
      />

      {clientError ? (
        <p role="alert" className="text-sm text-danger">{clientError}</p>
      ) : null}
      {state && "error" in state ? (
        <p role="alert" className="text-sm text-danger">{state.error}</p>
      ) : null}
      {!pending && !toast.dismissed && state && "ok" in state && state.ok ? (
        <SuccessToast message="Saved" onDismiss={toast.dismiss} />
      ) : null}
    </form>
  );
}
