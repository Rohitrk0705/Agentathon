import { forwardRef } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`w-full appearance-none rounded-md border border-border-subtle bg-surface px-3 py-2 pr-8 text-sm text-primary focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover transition-colors duration-150 ${className}`}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
});
