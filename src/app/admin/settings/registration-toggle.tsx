"use client";

import { useActionState, useCallback, useState } from "react";
import { SuccessToast } from "@/components/success-toast";
import { setRegistrationOpen, type SettingsActionResult } from "./actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/input";
import { UserCheck, UserX, Shield } from "lucide-react";

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
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <h2 className="text-base font-semibold text-primary">
              Cohort Registration Access
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-xl">
            When registration is open, new teams can register via the public portal. When closed,
            registration is gated and visitors are redirected to login.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border ${
              open
                ? "bg-success/15 border-success/30 text-success"
                : "bg-danger/10 border-danger/25 text-danger"
            }`}
          >
            {open ? (
              <>
                <span className="h-2 w-2 rounded-full bg-success animate-ping" />
                <span>Open</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-danger" />
                <span>Closed</span>
              </>
            )}
          </span>

          <form action={formAction}>
            <input type="hidden" name="open" value={open ? "false" : "true"} />

            <Button
              type="submit"
              variant={open ? "destructive" : "primary"}
              size="sm"
              loading={pending}
              disabled={pending}
              icon={open ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            >
              {pending
                ? "Saving…"
                : open
                  ? "Close Registration"
                  : "Open Registration"}
            </Button>
          </form>
        </div>
      </div>

      {state && "error" in state ? (
        <div className="mt-3">
          <FieldError>{state.error}</FieldError>
        </div>
      ) : null}

      {showToast ? (
        <div className="mt-3">
          <SuccessToast message="Registration status saved." onDismiss={dismiss} />
        </div>
      ) : null}
    </div>
  );
}
