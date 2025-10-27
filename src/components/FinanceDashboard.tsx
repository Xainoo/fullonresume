import React, { useEffect, useState } from "react";
import PageHeader from "./PageHeader";
import TransactionsList from "./TransactionsList";
import TransactionForm from "./TransactionForm";
import BalanceChart from "./BalanceChart";
import {
  fetchTransactions,
  saveTransaction,
  importCsv,
} from "../services/finance";
import type { Transaction } from "../services/finance";
import { useTranslation } from "../i18n";

export default function FinanceDashboard() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTransactions()
      .then((r) => setTransactions(r))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function onSave(tx: Transaction) {
    setLoading(true);
    try {
      const saved = await saveTransaction(tx);
      setTransactions((s) => [saved, ...s]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
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

          <TransactionsList transactions={transactions} loading={loading} />
        </div>

        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h6 className="mb-3">
              {t("add_transaction") || "Add transaction"}
            </h6>
            <TransactionForm onSave={onSave} />
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
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}
