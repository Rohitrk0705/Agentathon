import { forwardRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "danger"
  | "outline";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-text hover:bg-accent-hover active:brightness-95 shadow-sm font-semibold",
  secondary:
    "bg-surface text-primary border border-border-subtle hover:bg-surface-hover hover:border-border-strong active:bg-surface-elevated font-medium",
  ghost:
    "bg-transparent text-secondary hover:text-primary hover:bg-surface-hover font-medium",
  destructive:
    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white active:brightness-90 font-medium",
  danger:
    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white active:brightness-90 font-medium",
  outline:
    "bg-transparent text-primary border border-border-subtle hover:bg-surface-hover hover:border-border-strong font-medium",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-9 px-4 text-sm rounded-lg gap-2",
  lg: "h-11 px-5 text-base rounded-lg gap-2.5",
  icon: "h-9 w-9 p-0 rounded-lg justify-center",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  CommonProps & {
    href?: undefined;
  };

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  CommonProps & {
    href: string;
  };

type Props = ButtonProps | AnchorProps;

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  Props
>(function Button(props, ref) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    className = "",
    icon,
    children,
    ...rest
  } = props;

  const baseStyles =
    "inline-flex items-center justify-center select-none text-center cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const classes = [
    baseStyles,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as AnchorProps;
    const isExternal = href.startsWith("http") || href.startsWith("//");

    if (isExternal) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          rel="noopener noreferrer"
          target="_blank"
          {...anchorRest}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : icon}
          {children}
        </a>
      );
    }

    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...anchorRest}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : icon}
        {children}
      </Link>
    );
  }

  const { disabled, type = "button", ...buttonRest } = rest as ButtonProps;

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...buttonRest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : icon}
      {children}
    </button>
  );
});
