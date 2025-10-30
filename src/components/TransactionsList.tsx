// lightweight presentational component - no React default import needed with JSX transform
import type { Transaction } from "../services/finance";

export default function TransactionsList({
  transactions,
  loading,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  loading?: boolean;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
}) {
  if (loading) return <div className="text-muted">Loading...</div>;
  if (!transactions || transactions.length === 0)
    return <div className="text-muted">No transactions yet.</div>;

  return (
    <div className="list-group">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <div className="fw-bold">{t.description}</div>
            <div className="small text-muted">
              {new Date(t.date).toLocaleDateString()} •{" "}
              <div className="small text-muted">
                {new Date(t.date).toLocaleDateString()}
              </div>
              {t.category && (
                <div className="mt-1">
                  <span className="badge bg-secondary small">{t.category}</span>
                </div>
              )}
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className={t.amount < 0 ? "text-danger" : "text-success"}>
              {t.amount < 0 ? "-" : "+"}
              {Math.abs(t.amount).toFixed(2)}
            </div>
            {onEdit && (
              <button
                className="btn btn-sm btn-link"
                onClick={() => onEdit(t)}
                aria-label={`Edit ${t.description}`}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                className="btn btn-sm btn-link text-danger"
                onClick={() => onDelete(t.id)}
                aria-label={`Delete ${t.description}`}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
