import { forwardRef } from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className = "", hasError = false, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={`w-full min-h-[90px] rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-primary placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover transition-colors duration-150 resize-y leading-relaxed ${
          hasError
            ? "border-danger focus:border-danger focus:ring-danger"
            : "border-border-subtle hover:border-border-strong"
        } ${className}`}
        {...props}
      />
    );
  },
);
