export default function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-header d-flex align-items-start justify-content-between mb-3">
      <div>
        <h1 className="mb-1">{title}</h1>
        {subtitle && <div className="text-muted small">{subtitle}</div>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
