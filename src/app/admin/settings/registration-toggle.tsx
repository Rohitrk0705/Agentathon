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
    <section className="rounded-md border border-gray-200 p-4">
      <h2 className="text-sm font-medium text-gray-900">Registration</h2>
      <p className="mt-1 text-sm text-gray-600">
        Registration is{" "}
        <span className={open ? "font-semibold text-green-700" : "font-semibold text-red-700"}>
          {open ? "OPEN" : "CLOSED"}
        </span>
      </p>

      <form action={formAction} className="mt-3">
        <input type="hidden" name="open" value={open ? "false" : "true"} />

        {state && "error" in state ? (
          <p className="mb-2 text-sm text-red-600">{state.error}</p>
        ) : null}
        {showToast ? (
          <div className="mb-2">
            <SuccessToast message="Saved." onDismiss={dismiss} />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
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
