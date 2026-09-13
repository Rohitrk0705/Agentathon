export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon ? (
        <div className="mb-4 text-muted">{icon}</div>
      ) : null}
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-secondary">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
