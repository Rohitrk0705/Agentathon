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

  const inputClasses =
    "w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none transition-colors duration-150";
  const labelClasses = "block text-sm font-medium text-secondary mb-1.5";

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="team_name" className={labelClasses}>
          Team name
        </label>
        <input
          id="team_name"
          name="team_name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="track_id" className={labelClasses}>
          Track
        </label>
        <div className="relative">
          <select
            id="track_id"
            name="track_id"
            required
            defaultValue=""
            className={`${inputClasses} appearance-none pr-8`}
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
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <div>
        <label htmlFor="member_count" className={labelClasses}>
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
          className={`${inputClasses} max-w-[120px]`}
        />
      </div>

      {/* Members block */}
      <div className="rounded-md border border-border-subtle bg-background p-4">
        <p className="text-caption mb-3">Members</p>
        <div className="space-y-3">
          {memberNames.map((name, i) => (
            <div
              key={i}
              className="transition-opacity duration-200"
              style={{ opacity: 1 }}
            >
              <label
                htmlFor={`member_name_${i}`}
                className="block text-xs text-muted mb-1"
              >
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
                className={inputClasses}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="contact_email" className={labelClasses}>
          Contact email
        </label>
        <input
          id="contact_email"
          name="contact_email"
          type="email"
          required
          autoComplete="email"
          className={inputClasses}
        />
        <p className="mt-1 text-xs text-muted">This is also your login email</p>
      </div>

      <div>
        <label htmlFor="contact_phone" className={labelClasses}>
          Contact phone
        </label>
        <input
          id="contact_phone"
          name="contact_phone"
          type="tel"
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClasses}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClasses}
        />
        <p className="mt-1 text-xs text-muted">Minimum 8 characters</p>
      </div>

      {state && "error" in state ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
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
        className="w-full rounded-md bg-accent text-accent-text px-4 py-2 text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {pending ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
