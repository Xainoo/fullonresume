import type { Transaction, BudgetRecord } from "../services/finance";
import type { Rates } from "../services/rates";
import { convertAmount } from "../services/rates";

type BudgetsMap = Record<string, BudgetRecord> | undefined;

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmt(v: number, currency?: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return v.toFixed(2);
  }
}

export default function MonthlySummary({
  transactions,
  months = 6,
  budgets,
  rates,
  displayCurrency = "EUR",
  convertedTransactions,
}: {
  transactions: Transaction[];
  months?: number;
  budgets?: BudgetsMap;
  rates?: Rates;
  displayCurrency?: string;
  convertedTransactions?: Array<{ date: string; convertedAmount: number }>;
}) {
  if (!transactions || transactions.length === 0)
    return <div className="text-muted">No monthly data</div>;

  // compute totals per month (year-month)
  // keep both net totals and expense totals (sum of negative amounts)
  const netMap = new Map<string, number>();
  const expenseMap = new Map<string, number>();
  // Use precomputed convertedTransactions when available to avoid races
  if (convertedTransactions && convertedTransactions.length > 0) {
    convertedTransactions.forEach((ct) => {
      const d = new Date(ct.date);
      const k = monthKey(d);
      const amt = ct.convertedAmount;
      netMap.set(k, (netMap.get(k) || 0) + amt);
      if (amt < 0) {
        expenseMap.set(k, (expenseMap.get(k) || 0) + Math.abs(amt));
      }
    });
  } else {
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const k = monthKey(d);
      // convert amount to display currency when rates are available
      const amt = rates
        ? convertAmount(t.amount, t.currency, displayCurrency, rates)
        : t.amount;
      netMap.set(k, (netMap.get(k) || 0) + amt);
      if (amt < 0) {
        expenseMap.set(k, (expenseMap.get(k) || 0) + Math.abs(amt));
      }
    });
  }

  // pick last N months
  // ensure contiguous months up to latest
  const latest = new Date();
  const monthsArr: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(latest.getFullYear(), latest.getMonth() - i, 1);
    monthsArr.push(monthKey(d));
  }

  const expenseValues = monthsArr.map((k) => expenseMap.get(k) || 0);
  const netValues = monthsArr.map((k) => netMap.get(k) || 0);
  const max = Math.max(...expenseValues, 1);

  return (
    <div className="card p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="fw-bold">Last {months} months</div>
        <div className="small text-muted">{/* placeholder */}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "end", height: 96 }}>
        {expenseValues.map((expense, i) => {
          const m = monthsArr[i];
          let budget = 0;
          if (budgets && budgets[m]) {
            const b = budgets[m];
            if (rates) {
              budget = convertAmount(
                b.amount,
                b.currency,
                displayCurrency,
                rates
              );
            } else if (b.currency === displayCurrency) {
              budget = b.amount;
            } else {
              budget = b.amount; // no rates available; show raw
            }
          }
          return (
            <div key={m} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ position: "relative", height: 64 }}>
                {/* budget background */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 8,
                    right: 8,
                    height: `${
                      (Math.min(budget, Math.max(max, budget)) /
                        Math.max(max, budget)) *
                        60 +
                      8
                    }px`,
                    background: "#e9ecef",
                    borderRadius: 4,
                    opacity: 0.7,
                  }}
                />
                {/* expense foreground */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 8,
                    right: 8,
                    height: `${(expense / Math.max(max, budget)) * 60 + 8}px`,
                    background: expense > (budget || 0) ? "#f8d7da" : "#d1e7dd",
                    color: expense > (budget || 0) ? "#842029" : "#0f5132",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    padding: 4,
                  }}
                  title={`${fmt(expense, displayCurrency)}${
                    budget ? ` / ${fmt(budget, displayCurrency)}` : ""
                  }`}
                >
                  {fmt(expense, displayCurrency)}
                </div>
              </div>

              <div className="small text-muted mt-1">
                {monthsArr[i].slice(0, 7)}
              </div>
              <div className="small">
                <span className="text-muted">Net: </span>
                <strong>{fmt(netValues[i], displayCurrency)}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
