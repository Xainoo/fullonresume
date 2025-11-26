import { useEffect, useState, useRef } from "react";
import PageHeader from "./PageHeader";
import TransactionsList from "./TransactionsList";
import TransactionForm from "./TransactionForm";
import BalanceChart from "./BalanceChart";
import MonthlySummary from "./MonthlySummary";
import BudgetEditor from "./BudgetEditor";
import {
  fetchTransactions,
  saveTransaction,
  importCsv,
  deleteTransaction,
  updateTransaction,
} from "../services/finance";
import type { Transaction } from "../services/finance";
import { fetchBudgets, type BudgetRecord } from "../services/finance";
import { convertAmount } from "../services/rates";
import { fetchRates, SUPPORTED_CURRENCIES } from "../services/rates";
import type { Rates } from "../services/rates";
import { useTranslation } from "../i18n";
import ConfirmModal from "./ConfirmModal";

export default function FinanceDashboard() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Record<string, BudgetRecord> | null>(
    null
  );
  const [rates, setRates] = useState<Rates | null>(null);
  const [ratesLoading, setRatesLoading] = useState<boolean>(false);
  const [ratesError, setRatesError] = useState<boolean>(false);
  const [displayCurrency, setDisplayCurrency] = useState<string>(() => {
    try {
      return (localStorage.getItem("display_currency") as string) || "EUR";
    } catch {
      return "EUR";
    }
  });
  const [showDebug, setShowDebug] = useState(false);
  const fetchIdRef = useRef(0);

  // local fallback rates (kept in-sync with services/rates DEFAULT_RATES)
  const LOCAL_DEFAULT_RATES: Record<string, number> = {
    EUR: 1,
    USD: 1.1,
    PLN: 4.6,
    DKK: 7.44,
    GBP: 0.86,
  };

  function normalizeRatesToBase(
    input: Rates | Record<string, number>,
    base: string
  ): Rates {
    const out: Rates = {} as Rates;
    const baseUp = base.toUpperCase();
    // copy and uppercase keys, coerce to number
    Object.keys(input).forEach((k) => {
      const key = k.toUpperCase();
      // @ts-ignore - input can be Rates or simple record
      const val = (input as any)[k];
      out[key] = typeof val === "number" ? val : Number(val || NaN);
    });

    // try to determine the source base (if provided on the input)
    const sourceBase = ((input as Rates).base || undefined) as
      | string
      | undefined;

    // ensure base value present (if not, we'll create it as 1)
    out[baseUp] = out[baseUp] ?? 1;

    // If the rates were provided relative to a different base, normalize them
    // so that `out` becomes relative to `baseUp` (i.e. out[baseUp] === 1).
    if (sourceBase && sourceBase.toUpperCase() !== baseUp) {
      // prefer the direct value for the desired base if present, otherwise
      // derive a divisor from the source base value.
      const src = sourceBase.toUpperCase();
      const divisor = out[baseUp] ?? out[src] ?? 1;
      Object.keys(out).forEach((k) => {
        if (k === "base") return;
        out[k] = out[k] / divisor;
      });
    } else if (!sourceBase) {
      // No declared source base — assume the input rates were already
      // expressed in their own base and just ensure numeric values.
      // If the desired base isn't present we'll keep out[baseUp] === 1
      // and other values will be interpreted relative to that.
    }

    out.base = baseUp;
    return out;
  }

  useEffect(() => {
    setLoading(true);
    fetchTransactions()
      .then((r) => setTransactions(r || []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // fetch budgets and rates when displayCurrency changes (or on mount)
  useEffect(() => {
    fetchBudgets().then((b) => setBudgets(b));
    setRatesLoading(true);
    const hadRatesBefore = !!rates;
    setRatesError(false);

    // optimistic: compute an immediate, normalized rates object so UI can
    // convert consistently right away while we fetch the authoritative rates.
    try {
      if (rates) {
        const immediate = normalizeRatesToBase(rates, displayCurrency);
        setRates(immediate);
      } else {
        // build from local defaults
        const fallback: Record<string, number> = {};
        Object.keys(LOCAL_DEFAULT_RATES).forEach((k) => {
          fallback[k] =
            LOCAL_DEFAULT_RATES[k as keyof typeof LOCAL_DEFAULT_RATES];
        });
        const immediate = normalizeRatesToBase(
          fallback as Rates,
          displayCurrency
        );
        setRates(immediate);
      }
    } catch (err) {
      console.debug(
        "FinanceDashboard: immediate rates normalization failed",
        err
      );
    }

    const thisFetchId = ++fetchIdRef.current;
    (async () => {
      try {
        const r = await fetchRates(displayCurrency);
        if (fetchIdRef.current !== thisFetchId) {
          console.debug("FinanceDashboard: ignored out-of-date rates result", {
            for: displayCurrency,
          });
          return;
        }
        // normalize fetched rates into numeric, uppercase keys and ensure base
        let normalized: Rates;
        try {
          normalized = normalizeRatesToBase(r, displayCurrency);
        } catch (err) {
          console.warn(
            "FinanceDashboard: failed to normalize fetched rates, keeping previous",
            err
          );
          if (!hadRatesBefore) setRatesError(true);
          return;
        }

        // validate normalized rates: ensure we have the displayCurrency and at least
        // one other supported currency present as numeric values.
        const present = SUPPORTED_CURRENCIES.filter(
          (c) => typeof normalized[c] === "number" && !isNaN(normalized[c])
        );
        if (!present.includes(displayCurrency) || present.length < 2) {
          console.warn(
            "FinanceDashboard: fetched rates seem incomplete, keeping previous rates",
            {
              displayCurrency,
              present,
              normalized,
            }
          );
          if (!hadRatesBefore) setRatesError(true);
          return;
        }

        setRates(normalized);
        setRatesError(false);
      } catch (e) {
        if (fetchIdRef.current !== thisFetchId) return;
        // keep the immediate/local rates instead of clearing them
        console.warn(
          "FinanceDashboard: rates fetch failed, keeping immediate rates",
          e
        );
        if (!hadRatesBefore) setRatesError(true);
      } finally {
        if (fetchIdRef.current !== thisFetchId) return;
        setRatesLoading(false);
      }
    })();
    return () => {
      // invalidate this fetch
      fetchIdRef.current++;
    };
  }, [displayCurrency]);

  function scrollToForm() {
    const el = document.getElementById("txn-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function exportCsv() {
    const header = ["date", "description", "amount", "currency", "category"];
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = transactions.map((r) =>
      [
        escape((r.date || "").slice(0, 10)),
        escape(r.description || ""),
        escape(String(r.amount)),
        escape(r.currency || ""),
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
        // ensure currency preserved immediately
        saved.currency =
          saved.currency ?? tx.currency ?? displayCurrency ?? "EUR";
        setTransactions((s) =>
          s.map((it) => (it.id === saved.id ? saved : it))
        );
        setEditing(null);
      } else {
        saved = await saveTransaction(tx);
        // ensure saved record has currency (some backends may omit it)
        saved.currency =
          saved.currency ?? tx.currency ?? displayCurrency ?? "EUR";
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
      const normalized = imported.map((tx) => ({
        ...tx,
        currency: tx.currency ?? displayCurrency ?? "EUR",
      }));
      setTransactions((s) => [...normalized, ...s]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  // precompute converted amounts for balance/summary to avoid races
  const convertedTransactions = transactions.map((t) => {
    let converted = t.amount;
    try {
      converted = convertAmount(
        t.amount,
        t.currency,
        displayCurrency,
        rates ?? undefined
      );
    } catch {
      converted = t.amount;
    }
    return { ...t, convertedAmount: converted } as Transaction & {
      convertedAmount: number;
    };
  });

  return (
    <div className="container py-4">
      <PageHeader title={t("finance_dashboard") || "Finance Dashboard"} />

      <div className="row">
        <div className="col-md-8">
          <div className="mb-3">
            <BalanceChart
              transactions={transactions}
              rates={rates ?? undefined}
              displayCurrency={displayCurrency}
              convertedTransactions={convertedTransactions}
            />
          </div>

          <div className="mb-3 d-flex justify-content-end gap-2 align-items-center">
            <div className="small text-muted align-self-center">
              {t("display")}
            </div>
            <select
              className="form-select form-select-sm w-auto"
              value={displayCurrency}
              onChange={(e) => {
                const v = e.target.value;
                setDisplayCurrency(v);
                try {
                  localStorage.setItem("display_currency", v);
                } catch {
                  void 0;
                }
              }}
            >
              <option value="PLN">PLN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="DKK">DKK</option>
              <option value="GBP">GBP</option>
            </select>
            {ratesLoading ? (
              <div className="small text-muted">Loading rates…</div>
            ) : ratesError ? (
              <div className="small text-danger">{t("rates_unavailable")}</div>
            ) : (
              <div className="small text-muted">{t("rates_last_updated")}</div>
            )}
          </div>

          <div className="mb-3">
            <MonthlySummary
              transactions={transactions}
              months={6}
              budgets={budgets ?? undefined}
              rates={rates ?? undefined}
              displayCurrency={displayCurrency}
              convertedTransactions={convertedTransactions}
            />
          </div>

          {/* Debug panel: temporary, helps diagnose conversion / rates */}
          <div className="mb-3">
            <button
              className="btn btn-sm btn-outline-secondary mb-2"
              onClick={() => setShowDebug((s) => !s)}
            >
              {showDebug ? "Hide debug" : "Show debug"}
            </button>
            {showDebug && (
              <div className="card p-2">
                <div className="small text-muted mb-1">
                  Display currency: {displayCurrency}
                </div>
                <div className="small text-muted mb-1">Rates:</div>
                <pre style={{ maxHeight: 120, overflow: "auto" }}>
                  {JSON.stringify(rates ?? null, null, 2)}
                </pre>
                <div className="small text-muted mt-2">
                  Per-transaction conversion (to {displayCurrency}):
                </div>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Orig</th>
                      <th>Rate</th>
                      <th>Converted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const conv = (() => {
                        try {
                          return rates
                            ? convertAmount(
                                tx.amount,
                                tx.currency,
                                displayCurrency,
                                rates
                              )
                            : NaN;
                        } catch {
                          return NaN;
                        }
                      })();
                      // compute per-unit conversion (1 orig -> X display)
                      const perUnit = (() => {
                        try {
                          return rates
                            ? convertAmount(
                                1,
                                tx.currency,
                                displayCurrency,
                                rates
                              )
                            : NaN;
                        } catch {
                          return NaN;
                        }
                      })();
                      if (
                        !isNaN(perUnit) &&
                        tx.currency?.toUpperCase() !==
                          displayCurrency?.toUpperCase() &&
                        Math.abs(perUnit - 1) < 1e-8
                      ) {
                        console.warn(
                          "FinanceDashboard: suspicious per-unit conversion (≈1)",
                          {
                            tx,
                            perUnit,
                            conv,
                            displayCurrency,
                          }
                        );
                      }
                      return (
                        <tr key={tx.id}>
                          <td>{(tx.date || "").slice(0, 10)}</td>
                          <td>{`${tx.currency || "PLN"} ${tx.amount.toFixed(
                            2
                          )}`}</td>
                          <td>
                            {isNaN(perUnit)
                              ? "(no rate)"
                              : `1 ${
                                  tx.currency || "(unknown)"
                                } → ${displayCurrency} ${perUnit.toFixed(6)}`}
                          </td>
                          <td>
                            {isNaN(conv)
                              ? "(no rates)"
                              : `${displayCurrency} ${conv.toFixed(2)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="small text-muted">
                  Total converted:{" "}
                  {(() => {
                    try {
                      if (!rates) return "(no rates)";
                      const total = transactions.reduce((acc, tx) => {
                        const v = convertAmount(
                          tx.amount,
                          tx.currency,
                          displayCurrency,
                          rates
                        );
                        return acc + v;
                      }, 0);
                      return `${displayCurrency} ${total.toFixed(2)}`;
                    } catch {
                      return "(error)";
                    }
                  })()}
                </div>
              </div>
            )}
          </div>

          <TransactionsList
            transactions={transactions}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            rates={rates ?? undefined}
            displayCurrency={displayCurrency}
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

          <BudgetEditor months={6} onChange={(b) => setBudgets(b)} />

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
