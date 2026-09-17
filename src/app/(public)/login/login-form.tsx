"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn, type SignInResult } from "./actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";

const initialState: SignInResult | null = null;

export function LoginForm({ registrationOpen = true }: { registrationOpen?: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      {/* Segmented Auth Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-elevated border border-border-subtle text-xs font-semibold">
        <div className="flex items-center justify-center py-2 px-3 rounded-lg bg-surface text-primary shadow-sm border border-border-subtle/80">
          Sign In
        </div>
        {registrationOpen ? (
          <Link
            href="/register"
            className="flex items-center justify-center py-2 px-3 rounded-lg text-secondary hover:text-primary transition-colors"
          >
            Register Team
          </Link>
        ) : (
          <div className="flex items-center justify-center py-2 px-3 text-muted/60 cursor-not-allowed">
            Registration Closed
          </div>
        )}
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="email" requiredBadge>
            Team Lead / Admin Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="lead@team.com"
            icon={<Mail className="h-4 w-4" />}
            hasError={!!state?.error}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" requiredBadge className="mb-0">
              Password
            </Label>
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            hasError={!!state?.error}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-muted hover:text-primary p-1 rounded-md transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />
        </div>

        {state?.error ? <FieldError>{state.error}</FieldError> : null}

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={pending}
          className="w-full mt-2 h-11 text-sm font-semibold"
          icon={<LogIn className="h-4 w-4" />}
        >
          {pending ? "Authenticating…" : "Sign In to Workspace"}
        </Button>
      </form>

      {/* Footer helper */}
      {registrationOpen ? (
        <div className="pt-2 text-center">
          <p className="text-xs text-secondary">
            Don&apos;t have a team account yet?{" "}
            <Link
              href="/register"
              className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-hover hover:underline"
            >
              <span>Register here</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
