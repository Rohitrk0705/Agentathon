import { forwardRef } from "react";

export type BadgeVariant =
  | "default"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-secondary border-border-subtle",
  neutral: "bg-surface-elevated text-secondary border-border-subtle",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  info: "bg-info/15 text-info border-info/30",
  accent: "bg-accent-muted text-accent border-accent/30 font-semibold",
};

export const Badge = forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: BadgeVariant;
    dot?: boolean;
  }
>(function Badge(
  { variant = "default", dot = false, className = "", children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === "success"
              ? "bg-success"
              : variant === "warning"
                ? "bg-warning"
                : variant === "danger"
                  ? "bg-danger"
                  : variant === "info"
                    ? "bg-info"
                    : variant === "accent"
                      ? "bg-accent"
                      : "bg-muted"
          }`}
        />
      )}
      {children}
    </span>
  );
});
