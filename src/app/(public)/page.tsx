import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Timer,
  Layers,
  Trophy,
} from "lucide-react";

export default async function LandingPage() {
  const result = await getUserAndProfile();

  // If user is already authenticated, direct them to their portal
  if (result) {
    redirect(result.profile.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="w-full py-12 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-muted px-3.5 py-1 text-xs font-semibold text-accent mb-6 animate-in fade-in duration-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Agentathon 2026 Submission Portal</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-primary max-w-4xl leading-[1.1]">
            Build the future of{" "}
            <span className="bg-gradient-to-r from-accent via-emerald-400 to-sky-400 bg-clip-text text-transparent">
              autonomous agents
            </span>
          </h1>

          {/* One-line pitch */}
          <p className="mt-6 max-w-2xl text-base sm:text-xl text-secondary leading-relaxed font-normal">
            The precision platform for agentic workflows — submit milestone reviews,
            lock deadlines, and compete on the live leaderboard.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col xs:flex-row items-center gap-3.5 w-full xs:w-auto">
            <Link
              href="/register"
              className="w-full xs:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-text hover:bg-accent-hover active:brightness-95 transition-all duration-150 shadow-md shadow-accent/15"
            >
              <span>Register your team</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full xs:w-auto inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface px-6 py-3 text-sm font-medium text-primary hover:bg-surface-hover hover:border-border-strong transition-all duration-150"
            >
              Sign in to portal
            </Link>
          </div>
        </div>

        {/* How It Works Strip (3 Steps) */}
        <div className="mt-20 sm:mt-28">
          <div className="text-center mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-accent font-mono">
              Evaluation Flow
            </h2>
            <p className="mt-2 text-2xl font-bold tracking-tight text-primary">
              How Agentathon Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="relative flex flex-col rounded-xl border border-border-subtle bg-surface/60 p-6 md:p-8 transition-all duration-200 hover:border-border-strong hover:bg-surface">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-elevated border border-border-subtle text-accent mb-5 font-mono text-sm font-bold">
                01
              </div>
              <h3 className="text-lg font-semibold text-primary tracking-tight">
                Team & Track Selection
              </h3>
              <p className="mt-2 text-sm text-secondary leading-relaxed">
                Register up to 10 builders under a chosen problem statement. Your team
                dashboard instantly unlocks.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col rounded-xl border border-border-subtle bg-surface/60 p-6 md:p-8 transition-all duration-200 hover:border-border-strong hover:bg-surface">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-elevated border border-border-subtle text-accent mb-5 font-mono text-sm font-bold">
                02
              </div>
              <h3 className="text-lg font-semibold text-primary tracking-tight">
                3 Checkpoint Reviews
              </h3>
              <p className="mt-2 text-sm text-secondary leading-relaxed">
                Upload pitch decks (.pptx / .pdf up to 25MB) and attach GitHub repos & live
                demo links before strict deadlines.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col rounded-xl border border-border-subtle bg-surface/60 p-6 md:p-8 transition-all duration-200 hover:border-border-strong hover:bg-surface">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-elevated border border-border-subtle text-accent mb-5 font-mono text-sm font-bold">
                03
              </div>
              <h3 className="text-lg font-semibold text-primary tracking-tight">
                Live Scoring & Ranks
              </h3>
              <p className="mt-2 text-sm text-secondary leading-relaxed">
                Reviewers evaluate work with remarks and scores /10 per checkpoint.
                Follow your rank in real time on the live leaderboard.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 rounded-xl border border-border-subtle/70 bg-surface/40 p-4">
            <Timer className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary">Strict Deadlines</p>
              <p className="text-[11px] text-muted">Automated server locks</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-border-subtle/70 bg-surface/40 p-4">
            <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary">Signed Downloads</p>
              <p className="text-[11px] text-muted">Private encrypted storage</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-border-subtle/70 bg-surface/40 p-4">
            <Layers className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary">Multi-Track</p>
              <p className="text-[11px] text-muted">Flexible agent problem spaces</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-border-subtle/70 bg-surface/40 p-4">
            <Trophy className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary">CSV Export</p>
              <p className="text-[11px] text-muted">Transparent scoring exports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
