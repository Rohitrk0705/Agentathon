import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";
import {
  Bot,
  ShieldCheck,
  Timer,
  FileCheck2,
  Sparkles,
  Users,
} from "lucide-react";

export default async function LoginPage() {
  const result = await getUserAndProfile();

  if (result) {
    redirect(result.profile.role === "admin" ? "/admin" : "/dashboard");
  }

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("app_settings")
    .select("registration_open")
    .eq("id", 1)
    .single();
  const registrationOpen = settings?.registration_open ?? false;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Product Value & Platform Showcase */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-muted px-3.5 py-1 text-xs font-semibold text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Agentathon 2026 Evaluation Engine</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-primary leading-tight">
              Welcome back to your{" "}
              <span className="bg-gradient-to-r from-accent via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                agent workspace
              </span>
            </h1>
            <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-lg">
              Sign in to manage team submissions, track upcoming stage deadlines, review judge feedback, and monitor your leaderboard standings.
            </p>
          </div>

          {/* Feature Specs Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface/60 p-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-accent border border-border-subtle shrink-0">
                <Timer className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary">Strict Cutoffs</p>
                <p className="text-[11px] text-muted leading-tight mt-0.5">
                  Automated stage submission locks
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface/60 p-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-accent border border-border-subtle shrink-0">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary">Private Decks</p>
                <p className="text-[11px] text-muted leading-tight mt-0.5">
                  Signed, encrypted storage (.pptx / .pdf)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface/60 p-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-accent border border-border-subtle shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary">Official Scoring</p>
                <p className="text-[11px] text-muted leading-tight mt-0.5">
                  Multi-judge evaluation /10 per stage
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface/60 p-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-accent border border-border-subtle shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary">Multi-Member</p>
                <p className="text-[11px] text-muted leading-tight mt-0.5">
                  Up to 10 builders per team profile
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High-End Auth Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
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
                  Sign In
                </h2>
                <p className="text-xs text-secondary">
                  Enter your credentials to continue
                </p>
              </div>
            </div>

            <LoginForm registrationOpen={registrationOpen} />
          </div>
        </div>
      </div>
    </div>
  );
}
