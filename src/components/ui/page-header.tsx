export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-secondary">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="mt-3 sm:mt-0">{actions}</div> : null}
    </div>
  );
}
