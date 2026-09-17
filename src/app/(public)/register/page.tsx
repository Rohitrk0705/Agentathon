import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "./register-form";
import {
  Bot,
  Lock,
  ArrowLeft,
  Users,
  Compass,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default async function RegisterPage() {
  const result = await getUserAndProfile();

  if (result) {
    redirect(result.profile.role === "admin" ? "/admin" : "/dashboard");
  }

  const supabase = await createClient();

  const [{ data: settings }, { data: tracks }] = await Promise.all([
    supabase.from("app_settings").select("registration_open").eq("id", 1).single(),
    supabase.from("tracks").select("id, title, description").order("title", { ascending: true }),
  ]);

  if (!settings?.registration_open) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16">
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-xl p-8 text-center shadow-2xl space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-border-subtle text-muted">
            <Lock className="h-6 w-6 text-muted" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Registration is currently closed
          </h1>
          <p className="text-sm text-secondary leading-relaxed max-w-xs mx-auto">
            The event organizers have closed public registration for this cohort. If your team is already registered, please sign in.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-text hover:bg-accent-hover transition-all shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Guidelines & Event Context */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-muted px-3.5 py-1 text-xs font-semibold text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open Cohort Registration</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary leading-tight">
              Assemble your{" "}
              <span className="bg-gradient-to-r from-accent via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                agent team
              </span>
            </h1>
            <p className="text-sm sm:text-base text-secondary leading-relaxed">
              Register your squad, select your challenge track, and unlock your milestone submission workspace.
            </p>
          </div>

          {/* Quick Guidelines Card */}
          <div className="rounded-2xl border border-border-subtle bg-surface/60 p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted font-mono">
              Registration Rules & Guidelines
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated text-accent border border-border-subtle shrink-0 mt-0.5">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Team Size (1–10 Members)</p>
                  <p className="text-secondary text-[11px] leading-relaxed mt-0.5">
                    Enter the names of all participants. Member #1 serves as the team lead.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated text-accent border border-border-subtle shrink-0 mt-0.5">
                  <Compass className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Track Specialization</p>
                  <p className="text-secondary text-[11px] leading-relaxed mt-0.5">
                    Teams pick one problem domain. Reviewers evaluate submissions relative to your track criteria.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated text-accent border border-border-subtle shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Instant Workspace Unlock</p>
                  <p className="text-secondary text-[11px] leading-relaxed mt-0.5">
                    Upon completion, your team lead account is immediately signed in to upload decks for Review 1.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Section Registration Form */}
        <div className="lg:col-span-7">
          <div className="relative rounded-2xl border border-border bg-surface/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            {/* Subtle top edge accent glow */}
            <div
              className="pointer-events-none absolute -top-px left-10 right-10 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--accent), transparent)",
              }}
            />

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-border-subtle shadow-inner">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-primary">
                  Team Registration
                </h2>
                <p className="text-xs text-secondary">
                  Complete the 3 steps below to initialize your team
                </p>
              </div>
            </div>

            <RegisterForm tracks={tracks ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
