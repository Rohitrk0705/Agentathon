"use client";

import { useEffect, useState } from "react";

export function Countdown({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(deadline));
    }, 60_000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (timeLeft <= 0) {
    return (
      <span className="font-[family-name:var(--font-geist-mono)] text-xs text-danger">
        Locked
      </span>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return (
    <span className="font-[family-name:var(--font-geist-mono)] text-xs text-accent tabular-nums">
      {parts.join(" ")}
    </span>
  );
}

function calcTimeLeft(deadline: string): number {
  return new Date(deadline).getTime() - Date.now();
}
