import React from "react";
import type { Transaction } from "../services/finance";

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
}: {
  transactions: Transaction[];
}) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let balance = 0;
  const series = sorted.map((t) => (balance += t.amount));
  if (series.length === 0)
    return <div className="text-muted">No chart data</div>;
  const { w, h, points } = miniSparkline(series);
  return (
    <div className="card p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="fw-bold">Balance</div>
        <div className="fw-bold">
          {series.length ? series[series.length - 1].toFixed(2) : "0.00"}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: "100%", height: 48 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          points={points}
        />
      </svg>
    </div>
  );
}
