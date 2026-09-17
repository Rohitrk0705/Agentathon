export function Divider({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  if (label) {
    return (
      <div className={`relative flex items-center justify-center my-6 ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <span className="relative bg-surface px-3 text-xs uppercase tracking-wider text-muted font-medium">
          {label}
        </span>
      </div>
    );
  }

  return <hr className={`border-t border-border-subtle my-6 ${className}`} />;
}
