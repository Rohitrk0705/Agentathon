import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-text hover:bg-accent-hover font-medium",
  secondary:
    "bg-surface text-primary border border-border-subtle hover:bg-surface-hover hover:border-border-strong",
  ghost:
    "bg-transparent text-primary hover:bg-surface-hover",
  danger:
    "bg-transparent text-danger border border-danger/40 hover:bg-danger hover:text-white hover:border-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  href?: undefined;
};

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  href: string;
};

type Props = ButtonProps | AnchorProps;

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  Props
>(function Button(props, ref) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    className = "",
    children,
    ...rest
  } = props;

  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-md transition-colors duration-150",
    variantClasses[variant],
    sizeClasses[size],
    (rest as ButtonProps).disabled || loading
      ? "opacity-50 cursor-not-allowed pointer-events-none"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as AnchorProps;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...anchorRest}
      >
        {loading && <Spinner />}
        {children}
      </a>
    );
  }

  const { disabled, ...buttonRest } = rest as ButtonProps;

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      disabled={disabled || loading}
      {...buttonRest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});
