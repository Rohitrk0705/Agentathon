"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

export function Toast({
  message,
  variant = "success",
  onDismiss,
  durationMs = 3500,
}: {
  message: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!onDismiss) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  const variantStyles = {
    success: "border-success/30 bg-surface text-primary shadow-success/5",
    error: "border-danger/30 bg-surface text-primary shadow-danger/5",
    info: "border-info/30 bg-surface text-primary shadow-info/5",
  };

  const iconStyles = {
    success: <CheckCircle2 className="h-4 w-4 text-success shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-danger shrink-0" />,
    info: <Info className="h-4 w-4 text-info shrink-0" />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${variantStyles[variant]}`}
    >
      {iconStyles[variant]}
      <p className="text-sm font-medium">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="ml-2 rounded-md p-1 text-muted hover:text-primary hover:bg-surface-hover transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
