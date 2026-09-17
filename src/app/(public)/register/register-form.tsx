"use client";

import { useActionState, useCallback, useState } from "react";
import Link from "next/link";
import { SuccessToast } from "@/components/success-toast";
import { registerTeam, type RegisterActionResult } from "./actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Users,
  Mail,
  Phone,
  Lock,
  Shield,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Compass,
  ArrowRight,
} from "lucide-react";

const initialState: RegisterActionResult | null = null;

export function RegisterForm({
  tracks,
}: {
  tracks: Array<{ id: string; title: string; description?: string | null }>;
}) {
  const [state, formAction, pending] = useActionState(
    registerTeam,
    initialState,
  );
  const [memberCount, setMemberCount] = useState(1);
  const [memberNames, setMemberNames] = useState<string[]>([""]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lastHandledState, setLastHandledState] = useState(state);
  const [dismissed, setDismissed] = useState(false);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    setDismissed(false);
  }

  const dismiss = useCallback(() => setDismissed(true), []);

  function addMember() {
    if (memberCount < 10) {
      const nextCount = memberCount + 1;
      setMemberCount(nextCount);
      setMemberNames((prev) => [...prev, ""]);
    }
  }

  function removeMember(index: number) {
    if (memberCount > 1) {
      const nextCount = memberCount - 1;
      setMemberCount(nextCount);
      setMemberNames((prev) => prev.filter((_, i) => i !== index));
    }
  }

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const isPasswordValid = password.length >= 8;

  return (
    <div className="space-y-6">
      {/* Segmented Auth Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-elevated border border-border-subtle text-xs font-semibold">
        <Link
          href="/login"
          className="flex items-center justify-center py-2 px-3 rounded-lg text-secondary hover:text-primary transition-colors"
        >
          Sign In
        </Link>
        <div className="flex items-center justify-center py-2 px-3 rounded-lg bg-surface text-primary shadow-sm border border-border-subtle/80">
          Register Team
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Section 1: Team & Track */}
        <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface/60 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle/60">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-muted text-accent font-mono text-xs font-bold">
              01
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Team & Track Selection</span>
            </div>
          </div>

          <div>
            <Label htmlFor="team_name" requiredBadge>
              Official Team Name
            </Label>
            <Input
              id="team_name"
              name="team_name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              placeholder="e.g. DeepAgent Architectures"
            />
          </div>

          <div>
            <Label htmlFor="track_id" requiredBadge>
              Challenge Track
            </Label>
            <Select
              id="track_id"
              name="track_id"
              required
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
            >
              <option value="" disabled>
                Select a problem statement domain
              </option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.title}
                </option>
              ))}
            </Select>

            {/* Dynamic Track Preview card */}
            {selectedTrack ? (
              <div className="mt-2.5 rounded-xl border border-accent/25 bg-accent-muted/20 p-3.5 text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 font-semibold text-accent mb-1">
                  <Compass className="h-3.5 w-3.5 shrink-0" />
                  <span>Track Overview: {selectedTrack.title}</span>
                </div>
                {selectedTrack.description ? (
                  <p className="text-secondary leading-relaxed mt-1">
                    {selectedTrack.description}
                  </p>
                ) : (
                  <p className="text-muted italic">General challenge problem domain.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Section 2: Members */}
        <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface/60 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle/60">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-muted text-accent font-mono text-xs font-bold">
                02
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <Users className="h-3.5 w-3.5 text-accent" />
                <span>Team Roster</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted">
                {memberCount} of 10 slots
              </span>
              <input
                id="member_count"
                name="member_count"
                type="hidden"
                value={memberCount}
              />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {memberNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-xs font-mono font-semibold text-secondary border border-border-subtle">
                    {i + 1}
                  </span>
                </div>

                <div className="flex-1 relative">
                  <Input
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
                    placeholder={i === 0 ? "Team Lead Full Name" : `Member ${i + 1} Name`}
                    className={i === 0 ? "pr-24" : ""}
                  />
                  {i === 0 ? (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider bg-accent-muted text-accent px-2 py-0.5 rounded border border-accent/30 pointer-events-none">
                      Team Lead
                    </span>
                  ) : null}
                </div>

                {i > 0 ? (
                  <button
                    type="button"
                    onClick={() => removeMember(i)}
                    aria-label={`Remove member ${i + 1}`}
                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {memberCount < 10 ? (
            <div className="pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addMember}
                icon={<Plus className="h-4 w-4" />}
                className="w-full border border-dashed border-border-subtle hover:border-border-strong hover:bg-surface-elevated text-xs"
              >
                Add Another Member ({10 - memberCount} remaining)
              </Button>
            </div>
          ) : null}
        </div>

        {/* Section 3: Contact & Authentication */}
        <div className="space-y-4 rounded-2xl border border-border-subtle bg-surface/60 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle/60">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-muted text-accent font-mono text-xs font-bold">
              03
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span>Team Lead Credentials</span>
            </div>
          </div>

          <div>
            <Label htmlFor="contact_email" requiredBadge>
              Lead Contact Email
            </Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              required
              autoComplete="email"
              placeholder="lead@example.com"
              icon={<Mail className="h-4 w-4" />}
            />
            <p className="mt-1 text-[11px] text-muted">
              Used to sign in to your team dashboard and receive review notifications.
            </p>
          </div>

          <div>
            <Label htmlFor="contact_phone" requiredBadge>
              Contact Phone Number
            </Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              type="tel"
              required
              placeholder="+1 (555) 000-0000"
              icon={<Phone className="h-4 w-4" />}
            />
          </div>

          <div>
            <Label htmlFor="password" requiredBadge>
              Workspace Password
            </Label>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              icon={<Lock className="h-4 w-4" />}
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

            {/* Live password requirement pill */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px]">
              <CheckCircle2
                className={`h-3.5 w-3.5 transition-colors ${
                  isPasswordValid ? "text-success" : "text-muted"
                }`}
              />
              <span
                className={`transition-colors ${
                  isPasswordValid ? "text-success font-medium" : "text-muted"
                }`}
              >
                Minimum 8 characters requirement {isPasswordValid ? "satisfied" : ""}
              </span>
            </div>
          </div>
        </div>

        {state && "error" in state ? (
          <FieldError className="text-sm">{state.error}</FieldError>
        ) : null}

        {!pending && !dismissed && state && "ok" in state && state.ok ? (
          <SuccessToast
            message="Account created successfully — redirecting to workspace..."
            onDismiss={dismiss}
          />
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={pending}
          className="w-full text-base font-semibold h-12 shadow-lg shadow-accent/15"
          icon={<ArrowRight className="h-4 w-4" />}
        >
          {pending ? "Creating team workspace…" : "Complete Team Registration"}
        </Button>
      </form>

      {/* Footer login helper */}
      <div className="pt-2 text-center">
        <p className="text-xs text-secondary">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-accent hover:text-accent-hover hover:underline"
          >
            Sign in to existing account
          </Link>
        </p>
      </div>
    </div>
  );
}
