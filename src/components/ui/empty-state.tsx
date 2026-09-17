import { forwardRef } from "react";

export const EmptyState = forwardRef<
  HTMLDivElement,
  {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
  }
>(function EmptyState(
  { icon, title, description, action, className = "" },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface/40 px-6 py-14 text-center ${className}`}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated text-muted border border-border-subtle shadow-inner">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-primary tracking-tight">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-secondary leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
});
