import { CheckCircle2, Clock, Lock, AlertCircle, Award } from "lucide-react";

export type ReviewState =
  | "not_open"
  | "Not open"
  | "open"
  | "Open"
  | "locked"
  | "Locked"
  | "not_submitted"
  | "Not submitted"
  | "submitted"
  | "Submitted"
  | "scored"
  | "Scored";

export function StatusPill({
  status,
  className = "",
}: {
  status: ReviewState;
  className?: string;
}) {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");

  switch (normalized) {
    case "open":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-success/15 border border-success/30 px-2.5 py-0.5 text-xs font-semibold text-success ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          Open
        </span>
      );

    case "locked":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-danger/10 border border-danger/25 px-2.5 py-0.5 text-xs font-medium text-danger ${className}`}
        >
          <Lock className="h-3 w-3" />
          Locked
        </span>
      );

    case "submitted":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-info/15 border border-info/30 px-2.5 py-0.5 text-xs font-semibold text-info ${className}`}
        >
          <CheckCircle2 className="h-3 w-3" />
          Submitted
        </span>
      );

    case "scored":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-accent-muted border border-accent/30 px-2.5 py-0.5 text-xs font-semibold text-accent ${className}`}
        >
          <Award className="h-3 w-3" />
          Scored
        </span>
      );

    case "not_submitted":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-warning/10 border border-warning/25 px-2.5 py-0.5 text-xs font-medium text-warning ${className}`}
        >
          <AlertCircle className="h-3 w-3" />
          Not submitted
        </span>
      );

    case "not_open":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-surface-elevated border border-border-subtle px-2.5 py-0.5 text-xs font-medium text-muted ${className}`}
        >
          <Clock className="h-3 w-3" />
          Not open
        </span>
      );
  }
}
