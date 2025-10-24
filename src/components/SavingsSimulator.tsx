import { useState } from "react";
import { useTranslation } from "../i18n";

export default function SavingsSimulator() {
  const { t } = useTranslation();
  const [initial, setInitial] = useState("1000");
  const [monthly, setMonthly] = useState("200");
  const [rate, setRate] = useState("5");
  const [years, setYears] = useState("5");

  const p0 = parseFloat(initial || "0");
  const m = parseFloat(monthly || "0");
  const r = parseFloat(rate || "0") / 100;
  const n = parseInt(years || "0");

  let balance = p0;
  const timeline: { year: number; balance: number }[] = [];
  for (let y = 1; y <= n; y++) {
    // monthly contributions compounded monthly
    for (let mth = 0; mth < 12; mth++) {
      balance += m;
      balance *= 1 + r / 12;
    }
    timeline.push({ year: y, balance });
  }

  return (
    <div>
      <div className="mb-2">
        <label className="form-label">{t("initial")}</label>
        <input
          className="form-control"
          value={initial}
          onChange={(e) => setInitial(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="form-label">{t("monthly_contribution")}</label>
        <input
          className="form-control"
          value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
        />
      </div>
      <div className="mb-2 d-flex gap-2">
        <div className="flex-grow-1">
          <label className="form-label">{t("annual_rate")}</label>
          <input
            className="form-control"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <div style={{ width: 110 }}>
          <label className="form-label">{t("years")}</label>
          <input
            className="form-control"
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-muted">{t("projected_balance")}</div>
        <div className="h4">
          $
          {timeline.length
            ? timeline[timeline.length - 1].balance.toFixed(2)
            : balance.toFixed(2)}
        </div>
        <div className="mt-2 small text-muted">{t("breakdown_by_year")}</div>
        <ul>
          {timeline.map((t) => (
            <li key={t.year}>
              {t.year}: ${t.balance.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
