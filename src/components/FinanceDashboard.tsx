import { useEffect, useState } from "react";
import PageHeader from "./PageHeader";
import TransactionsList from "./TransactionsList";
import TransactionForm from "./TransactionForm";
import BalanceChart from "./BalanceChart";
import {
  fetchTransactions,
  saveTransaction,
  importCsv,
  deleteTransaction,
  updateTransaction,
} from "../services/finance";
import type { Transaction } from "../services/finance";
import { useTranslation } from "../i18n";
import ConfirmModal from "./ConfirmModal";

export default function FinanceDashboard() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTransactions()
      .then((r) => setTransactions(r))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  function scrollToForm() {
    const el = document.getElementById("txn-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function exportCsv() {
    const header = ["date", "description", "amount", "category"];
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = transactions.map((r) =>
      [
        escape((r.date || "").slice(0, 10)),
        escape(r.description || ""),
        escape(String(r.amount)),
        escape(r.category || ""),
      ].join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function onSave(tx: Transaction) {
    setLoading(true);
    try {
      let saved: Transaction;
      // if editing existing transaction (id present in list), update
      const exists = transactions.some((t) => t.id === tx.id);
      if (exists) {
        saved = await updateTransaction(tx);
        setTransactions((s) =>
          s.map((it) => (it.id === saved.id ? saved : it))
        );
        setEditing(null);
      } else {
        saved = await saveTransaction(tx);
        setTransactions((s) => [saved, ...s]);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    // open confirm modal instead
    setConfirmDeleteId(id);
  }

  async function doConfirmDelete() {
    if (!confirmDeleteId) return;
    setLoading(true);
    try {
      await deleteTransaction(confirmDeleteId);
      setTransactions((s) => s.filter((t) => t.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  function onEdit(tx: Transaction) {
    setEditing(tx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onImport(file: File) {
    setLoading(true);
    try {
      const imported = await importCsv(file);
      setTransactions((s) => [...imported, ...s]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <PageHeader title={t("finance_dashboard") || "Finance Dashboard"} />

      <div className="row">
        <div className="col-md-8">
          <div className="mb-3">
            <BalanceChart transactions={transactions} />
          </div>

          <TransactionsList
            transactions={transactions}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h6 className="mb-3">
              {t("add_transaction") || "Add transaction"}
            </h6>
            <div id="txn-form">
              <TransactionForm
                onSave={onSave}
                initial={editing ?? undefined}
                onCancel={() => setEditing(null)}
              />
            </div>
          </div>

          <div className="card p-3">
            <h6 className="mb-2">{t("import_csv") || "Import CSV"}</h6>
            <input
              type="file"
              accept="text/csv"
              className="form-control form-control-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
              }}
            />
            <div className="mt-2 d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={exportCsv}
              >
                {t("export_csv") || "Export CSV"}
              </button>
              <button className="btn btn-sm btn-primary" onClick={scrollToForm}>
                {t("new_transaction") || "New transaction"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <ConfirmModal
        open={!!confirmDeleteId}
        title={t("confirm_delete") || "Delete transaction"}
        message={
          t("confirm_delete_msg") ||
          "Do you really want to delete this transaction? This cannot be undone."
        }
        confirmLabel={t("delete") || "Delete"}
        cancelLabel={t("cancel") || "Cancel"}
        onConfirm={doConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
