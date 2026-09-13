"use client";

import { useActionState, useCallback, useState } from "react";
import { SuccessToast } from "@/components/success-toast";
import { setRegistrationOpen, type SettingsActionResult } from "./actions";

const initialState: SettingsActionResult | null = null;

export function RegistrationToggle({ open }: { open: boolean }) {
  const [state, formAction, pending] = useActionState(
    setRegistrationOpen,
    initialState,
  );
  const [lastHandledState, setLastHandledState] = useState(state);
  const [dismissed, setDismissed] = useState(false);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    setDismissed(false);
  }

  const dismiss = useCallback(() => setDismissed(true), []);

  const showToast =
    !pending && !dismissed && state !== null && "ok" in state && state.ok;

  return (
    <section className="rounded-lg border border-border-subtle bg-surface p-6">
      <h2 className="text-base font-semibold text-primary">Registration</h2>
      <div className="mt-3">
        <span
          className={`text-2xl font-bold tracking-tight ${
            open ? "text-accent" : "text-danger"
          }`}
        >
          {open ? "OPEN" : "CLOSED"}
        </span>
      </div>

      <form action={formAction} className="mt-4">
        <input type="hidden" name="open" value={open ? "false" : "true"} />

        {state && "error" in state ? (
          <p role="alert" className="mb-3 text-sm text-danger">{state.error}</p>
        ) : null}
        {showToast ? (
          <div className="mb-3">
            <SuccessToast message="Saved." onDismiss={dismiss} />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
            open
              ? "bg-transparent text-danger border border-danger/40 hover:bg-danger hover:text-white hover:border-danger"
              : "bg-accent text-accent-text hover:bg-accent-hover"
          }`}
        >
          {pending
            ? "Saving…"
            : open
              ? "Close registration"
              : "Open registration"}
        </button>
      </form>
    </section>
  );
}
