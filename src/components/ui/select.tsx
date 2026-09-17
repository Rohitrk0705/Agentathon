import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className = "", hasError = false, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none rounded-lg border bg-surface px-3.5 py-2 pr-9 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover transition-colors duration-150 cursor-pointer ${
            hasError
              ? "border-danger focus:border-danger focus:ring-danger"
              : "border-border-subtle hover:border-border-strong"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted shrink-0"
          aria-hidden="true"
        />
      </div>
    );
  },
);
