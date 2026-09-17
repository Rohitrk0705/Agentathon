import Link from "next/link";
import {
  Layers,
  Settings,
  Users,
  Trophy,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const cards = [
  {
    href: "/admin/tracks",
    title: "Tracks",
    description: "Manage problem statements and competition domains teams can pick",
    icon: Layers,
    accent: "text-accent",
  },
  {
    href: "/admin/settings",
    title: "Settings & Deadlines",
    description: "Control registration gate and set precise upload deadlines for reviews",
    icon: Settings,
    accent: "text-info",
  },
  {
    href: "/admin/teams",
    title: "Teams & Submissions",
    description: "Review registered cohorts, download slide decks, and enter judge scores /10",
    icon: Users,
    accent: "text-warning",
  },
  {
    href: "/admin/leaderboard",
    title: "Live Leaderboard",
    description: "Inspect live team rankings across all three reviews and export CSV data",
    icon: Trophy,
    accent: "text-accent",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
              Admin Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            Platform Command Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-secondary">
            Configure tracks, manage review cutoffs, evaluate submissions, and audit leaderboard
          </p>
        </div>
      </div>

      {/* Grid of Section Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group relative flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface p-6 transition-all duration-200 hover:border-accent/50 hover:bg-surface-hover hover:shadow-lg shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-elevated border border-border-subtle group-hover:border-accent/30 transition-colors">
                    <Icon className={`h-5 w-5 ${card.accent}`} />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-semibold text-primary group-hover:text-accent transition-colors">
                  {card.title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-secondary leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border-subtle/50 flex items-center gap-1 text-xs font-medium text-muted group-hover:text-primary transition-colors">
                <span>Manage section</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
