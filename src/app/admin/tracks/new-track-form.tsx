"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTrack, type TrackActionResult } from "./actions";

const initialState: TrackActionResult | null = null;

export function NewTrackForm() {
  const [state, formAction, pending] = useActionState(
    createTrack,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const inputClasses =
    "w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none transition-colors duration-150";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-lg border border-border-subtle bg-surface p-6 space-y-4"
    >
      <h2 className="text-base font-semibold text-primary">Add a track</h2>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-secondary mb-1.5">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1.5">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          className={`${inputClasses} min-h-[80px]`}
        />
      </div>

      {state && "error" in state ? (
        <p role="alert" className="text-sm text-danger">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent text-accent-text px-4 py-2 text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {pending ? "Adding…" : "Add track"}
      </button>
    </form>
  );
}
