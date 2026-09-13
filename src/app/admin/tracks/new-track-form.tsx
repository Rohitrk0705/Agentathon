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

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 rounded-md border border-gray-200 p-4"
    >
      <h2 className="text-sm font-medium text-gray-900">Add a track</h2>

      <div>
        <label htmlFor="title" className="block text-sm text-gray-700">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm text-gray-700">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      {state && "error" in state ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add track"}
      </button>
    </form>
  );
}
