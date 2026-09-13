"use client";

import { useEffect } from "react";

export function SuccessToast({
  message,
  onDismiss,
  durationMs = 3000,
}: {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <p className="text-sm text-success">
      {message}
    </p>
  );
}
