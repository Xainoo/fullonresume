// intentionally no hooks required here
import type { Transaction } from "../services/finance";
import type { Rates } from "../services/rates";
import { convertAmount } from "../services/rates";
import { useTranslation } from "../i18n";

function miniSparkline(values: number[]) {
  const pad = 4;
  const w = Math.max(120, values.length * 12);
  const h = 48;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - pad * 2) + pad;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return { w, h, points };
}

export default function BalanceChart({
  transactions,
  rates,
  displayCurrency = "EUR",
  convertedTransactions,
}: {
  transactions: Transaction[];
  rates?: Rates;
  displayCurrency?: string;
  convertedTransactions?: Array<{ date: string; convertedAmount: number }>;
}) {
  const { t } = useTranslation();
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let balance = 0;
  const series = (
    convertedTransactions
      ? // build series from precomputed converted transactions
        [...(convertedTransactions || [])]
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .map((ct) => (balance += ct.convertedAmount))
      : // fallback: compute from raw transactions using rates
        sorted.map((t) => {
          const amt = rates
            ? convertAmount(t.amount, t.currency, displayCurrency, rates)
            : t.amount;
          return (balance += amt);
        })
  ) as number[];
  if (series.length === 0)
    return <div className="text-muted">No chart data</div>;
  const latest = series[series.length - 1] || 0;
  const fmt = (v: number) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: displayCurrency || "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(v);
    } catch {
      return v.toFixed(2);
    }
  };
  const { w, h, points } = miniSparkline(series);
  const trend = series.length > 1 ? series[series.length - 1] - series[0] : 0;
  const color = trend >= 0 ? "#198754" : "#dc3545";
  // Build area points for fill
  const areaPoints = `${points} ${w - 4},${h - 4} 4,${h - 4}`;

  return (
    <div className="card p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="fw-bold">{t("balance") || "Balance"}</div>
        <div
          className="fw-bold"
          title={`${displayCurrency} ${latest.toFixed(2)}`}
        >
          {fmt(latest)}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: "100%", height: 64 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline fill="url(#g1)" stroke="none" points={areaPoints} />
        <polyline fill="none" stroke={color} strokeWidth={2} points={points} />
      </svg>
    </div>
  );
}
