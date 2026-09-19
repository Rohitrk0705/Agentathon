"use client";

import { useActionState, useCallback, useState } from "react";
import { SuccessToast } from "@/components/success-toast";
import { scoreSubmission, type ScoreActionResult } from "./actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/input";
import { Award, Check } from "lucide-react";
import { maxScoreFor } from "@/lib/scoring";

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
  teamId,
  reviewNumber,
  initialScore,
  initialRemarks,
}: {
  teamId: string;
  reviewNumber: 1 | 2 | 3;
  initialScore: number | null;
  initialRemarks: string | null;
}) {
  // A submission row may not exist yet, so the field id is keyed on the pair
  // the form actually saves against.
  const fieldId = `score_${teamId}_${reviewNumber}`;
  // R2 is scored out of 50, R1 and R3 out of 10. The server re-derives this
  // from review_number; the input attributes are only a typing aid.
  const maxScore = maxScoreFor(reviewNumber);
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
    if (Number.isNaN(num) || num < 0 || num > maxScore) {
      setClientError(`Score must be between 0 and ${maxScore}.`);
      return;
    }

    setClientError(null);
  }

  return (
    <form
      action={formAction}
      className="space-y-2.5"
      onSubmit={(e) => {
        if (clientError) e.preventDefault();
      }}
    >
      <input type="hidden" name="team_id" value={teamId} />
      <input type="hidden" name="review_number" value={reviewNumber} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2.5 py-1">
          <Award className="h-3.5 w-3.5 text-accent shrink-0" />
          <label
            className="text-xs font-semibold text-secondary uppercase tracking-wider"
            htmlFor={fieldId}
          >
            Score:
          </label>
          <input
            id={fieldId}
            name="score"
            type="number"
            step="0.1"
            min="0"
            max={maxScore}
            placeholder={`0–${maxScore}`}
            value={scoreValue}
            onChange={(e) => handleScoreChange(e.target.value)}
            className="w-14 bg-transparent text-sm font-mono font-semibold text-primary tabular-nums text-center focus:outline-none"
          />
          <span className="text-xs text-muted font-mono">/ {maxScore}</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={pending}
          disabled={pending || !!clientError}
          icon={<Check className="h-3.5 w-3.5" />}
          className="text-xs h-7 px-3"
        >
          {pending ? "Saving…" : "Save Score"}
        </Button>
      </div>

      <textarea
        name="remarks"
        rows={2}
        maxLength={2000}
        defaultValue={initialRemarks ?? ""}
        placeholder="Judge remarks & constructive feedback (optional)..."
        className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-xs text-primary placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors duration-150 resize-y min-h-[50px] leading-relaxed"
      />

      {clientError ? <FieldError>{clientError}</FieldError> : null}
      {state && "error" in state ? (
        <FieldError>{state.error}</FieldError>
      ) : null}
      {!pending && !toast.dismissed && state && "ok" in state && state.ok ? (
        <SuccessToast message="Evaluation score & remarks recorded." onDismiss={toast.dismiss} />
      ) : null}
    </form>
  );
}
