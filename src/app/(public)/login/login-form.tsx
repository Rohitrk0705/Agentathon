"use client";

import { useActionState } from "react";
import { signIn, type SignInResult } from "./actions";

const initialState: SignInResult | null = null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-secondary mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none transition-colors duration-150"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-secondary mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none transition-colors duration-150"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent text-accent-text px-4 py-2 text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
