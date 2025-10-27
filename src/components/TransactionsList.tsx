import React from "react";
import type { Transaction } from "../services/finance";

export default function TransactionsList({
  transactions,
  loading,
}: {
  transactions: Transaction[];
  loading?: boolean;
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
              {new Date(t.date).toLocaleDateString()} • {t.category}
            </div>
          </div>
          <div className={t.amount < 0 ? "text-danger" : "text-success"}>
            {t.amount < 0 ? "-" : "+"}
            {Math.abs(t.amount).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
