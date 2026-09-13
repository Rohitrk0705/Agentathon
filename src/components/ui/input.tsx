import { forwardRef } from "react";

export const Label = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(function Label({ className = "", ...props }, ref) {
  return (
    <label
      ref={ref}
      className={`block text-sm font-medium text-secondary mb-1.5 ${className}`}
      {...props}
    />
  );
});

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover transition-colors duration-150 ${className}`}
      {...props}
    />
  );
});
