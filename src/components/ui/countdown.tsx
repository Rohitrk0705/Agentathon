"use client";

import { useEffect, useState } from "react";
import { Timer, Lock } from "lucide-react";

export function Countdown({
  deadline,
  compact = false,
}: {
  deadline: string;
  compact?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState<number>(() => calcTimeLeft(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (timeLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-danger bg-danger/10 border border-danger/20 rounded-md px-2 py-0.5">
        <Lock className="h-3 w-3" />
        <span>Deadline passed</span>
      </span>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  if (!compact || (days === 0 && hours === 0)) {
    parts.push(`${seconds}s`);
  }

  const isUrgent = days === 0 && hours < 2;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold tabular-nums rounded-md px-2 py-0.5 border transition-colors ${
        isUrgent
          ? "bg-warning/15 border-warning/30 text-warning animate-pulse"
          : "bg-accent-muted border-accent/25 text-accent"
      }`}
      title={`Deadline: ${new Date(deadline).toLocaleString()}`}
    >
      <Timer className="h-3.5 w-3.5 shrink-0" />
      <span>{parts.join(" ")}</span>
    </span>
  );
}

function calcTimeLeft(deadline: string): number {
  return new Date(deadline).getTime() - Date.now();
}
