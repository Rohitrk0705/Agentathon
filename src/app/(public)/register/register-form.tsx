"use client";

import { useActionState, useCallback, useState } from "react";
import { SuccessToast } from "@/components/success-toast";
import { registerTeam, type RegisterActionResult } from "./actions";

const initialState: RegisterActionResult | null = null;

export function RegisterForm({
  tracks,
}: {
  tracks: Array<{ id: string; title: string }>;
}) {
  const [state, formAction, pending] = useActionState(
    registerTeam,
    initialState,
  );
  const [memberCount, setMemberCount] = useState(1);
  const [memberNames, setMemberNames] = useState<string[]>([""]);
  const [lastHandledState, setLastHandledState] = useState(state);
  const [dismissed, setDismissed] = useState(false);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    setDismissed(false);
  }

  const dismiss = useCallback(() => setDismissed(true), []);

  function handleMemberCountChange(value: number) {
    const count = Math.min(10, Math.max(1, value));
    setMemberCount(count);
    setMemberNames((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill("")];
      }
      return prev.slice(0, count);
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="team_name" className="block text-sm font-medium text-gray-700">
          Team name
        </label>
        <input
          id="team_name"
          name="team_name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="track_id" className="block text-sm font-medium text-gray-700">
          Track
        </label>
        <select
          id="track_id"
          name="track_id"
          required
          defaultValue=""
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="" disabled>
            Select a track
          </option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="member_count" className="block text-sm font-medium text-gray-700">
          Number of members
        </label>
        <input
          id="member_count"
          name="member_count"
          type="number"
          min={1}
          max={10}
          value={memberCount}
          onChange={(e) => handleMemberCountChange(Number(e.target.value))}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {memberNames.map((name, i) => (
          <div key={i}>
            <label htmlFor={`member_name_${i}`} className="block text-sm text-gray-700">
              Member {i + 1}
            </label>
            <input
              id={`member_name_${i}`}
              name="member_names"
              type="text"
              required
              maxLength={80}
              value={name}
              onChange={(e) =>
                setMemberNames((prev) => {
                  const next = [...prev];
                  next[i] = e.target.value;
                  return next;
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
          Contact email
        </label>
        <input
          id="contact_email"
          name="contact_email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">This is also your login email</p>
      </div>

      <div>
        <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
          Contact phone
        </label>
        <input
          id="contact_phone"
          name="contact_phone"
          type="tel"
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
      </div>

      {state && "error" in state ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      {!pending && !dismissed && state && "ok" in state && state.ok ? (
        <SuccessToast
          message="Account created — signing you in..."
          onDismiss={dismiss}
        />
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
