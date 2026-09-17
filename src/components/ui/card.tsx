import { forwardRef } from "react";

export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }
>(function Card({ className = "", hoverable = false, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`rounded-xl border border-border-subtle bg-surface transition-all duration-200 ${
        hoverable ? "hover:border-border-strong hover:bg-surface-hover" : ""
      } ${className}`}
      {...props}
    />
  );
});

export function CardHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col gap-1.5 p-5 md:p-6 border-b border-border-subtle/50 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-base md:text-lg font-semibold text-primary tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-secondary leading-relaxed ${className}`} {...props} />
  );
}

export function CardContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 md:p-6 ${className}`} {...props} />;
}

export function CardFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center gap-3 p-5 md:p-6 pt-0 ${className}`}
      {...props}
    />
  );
}
