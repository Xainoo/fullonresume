// lightweight presentational component - no React default import needed with JSX transform
import type { Transaction } from "../services/finance";
import type { Rates } from "../services/rates";
import { convertAmount } from "../services/rates";
import { useTranslation } from "../i18n";

export default function TransactionsList({
  transactions,
  loading,
  onEdit,
  onDelete,
  rates,
  displayCurrency,
}: {
  transactions: Transaction[];
  loading?: boolean;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
  rates?: Rates;
  displayCurrency?: string;
}) {
  const { t } = useTranslation();
  if (loading) return <div className="text-muted">Loading...</div>;
  if (!transactions || transactions.length === 0)
    return (
      <div className="text-muted">
        {t("no_transactions") || "No transactions yet."}
      </div>
    );

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
            <div
              className={t.amount < 0 ? "text-danger" : "text-success"}
              title={(() => {
                const orig = `${t.currency || "PLN"} ${Math.abs(
                  t.amount
                ).toFixed(2)}`;
                if (rates && displayCurrency) {
                  try {
                    const conv = convertAmount(
                      t.amount,
                      t.currency,
                      displayCurrency,
                      rates
                    );
                    return `${orig} → ${displayCurrency} ${Math.abs(
                      conv
                    ).toFixed(2)}`;
                  } catch {
                    return orig;
                  }
                }
                return orig;
              })()}
            >
              {t.amount < 0 ? "-" : "+"}
              {rates && displayCurrency
                ? (() => {
                    const display = convertAmount(
                      t.amount,
                      t.currency,
                      displayCurrency,
                      rates
                    );
                    try {
                      return new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: displayCurrency || t.currency || "PLN",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Math.abs(display));
                    } catch {
                      return Math.abs(display).toFixed(2);
                    }
                  })()
                : (() => {
                    try {
                      return new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: t.currency || "PLN",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(Math.abs(t.amount));
                    } catch {
                      return Math.abs(t.amount).toFixed(2);
                    }
                  })()}
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
