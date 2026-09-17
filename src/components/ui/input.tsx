import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

export const Label = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { requiredBadge?: boolean }
>(function Label({ className = "", requiredBadge = false, children, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={`block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {requiredBadge ? <span className="text-accent ml-1">*</span> : null}
    </label>
  );
});

export const FieldError = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function FieldError({ className = "", children, ...props }, ref) {
  if (!children) return null;
  return (
    <p
      ref={ref}
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-1.5 text-xs text-danger font-medium mt-1.5 animate-in fade-in duration-150 ${className}`}
      {...props}
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
});

export function FormRow({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className = "",
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label ? (
        <Label htmlFor={htmlFor} requiredBadge={required}>
          {label}
        </Label>
      ) : null}
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted mt-1 leading-normal">{hint}</p>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = "", hasError = false, icon, rightElement, ...props }, ref) {
    if (icon || rightElement) {
      return (
        <div className="relative flex items-center w-full">
          {icon ? (
            <span className="pointer-events-none absolute left-3.5 text-muted shrink-0 z-10">
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            className={`w-full rounded-lg border bg-surface py-2.5 text-sm text-primary placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover transition-all duration-150 ${
              icon ? "pl-10" : "pl-3.5"
            } ${rightElement ? "pr-10" : "pr-3.5"} ${
              hasError
                ? "border-danger focus:border-danger focus:ring-danger"
                : "border-border-subtle hover:border-border-strong"
            } ${className}`}
            {...props}
          />
          {rightElement ? (
            <div className="absolute right-2.5 flex items-center z-10">
              {rightElement}
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-primary placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover transition-all duration-150 ${
          hasError
            ? "border-danger focus:border-danger focus:ring-danger"
            : "border-border-subtle hover:border-border-strong"
        } ${className}`}
        {...props}
      />
    );
  },
);
