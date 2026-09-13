import { forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`w-full min-h-[80px] rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-border-strong focus:ring-1 focus:ring-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover transition-colors duration-150 ${className}`}
      {...props}
    />
  );
});
