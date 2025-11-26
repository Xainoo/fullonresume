import { useEffect, useMemo, useState } from "react";
import {
  fetchBudgets,
  saveBudget,
  deleteBudget,
  type BudgetRecord,
} from "../services/finance";
import { SUPPORTED_CURRENCIES } from "../services/rates";
import { useTranslation } from "../i18n";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function BudgetEditor({
  months = 6,
  onChange,
}: {
  months?: number;
  onChange?: (b: Record<string, BudgetRecord>) => void;
}) {
  const [budgets, setBudgets] = useState<Record<string, BudgetRecord>>({});
  const [selected, setSelected] = useState<string>(() => monthKey(new Date()));
  const [amount, setAmount] = useState<string>("");

  const [currency, setCurrency] = useState<string>("EUR");
  const { t } = useTranslation();
  // persist preferred budget currency
  useEffect(() => {
    try {
      const pref = localStorage.getItem("budget_currency_pref");
      if (pref) setCurrency(pref);
    } catch {
      void 0;
    }
  }, []);
  useEffect(() => {
    fetchBudgets().then((b) => {
      setBudgets(b || {});
    });
  }, [selected]);

  useEffect(() => {
    const v = budgets[selected];
    setAmount(v !== undefined ? String(v.amount ?? v) : "");
    setCurrency(v !== undefined && v.currency ? v.currency : "EUR");
  }, [selected, budgets]);

  const monthsArr = useMemo(() => {
    const latest = new Date();
    const out: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(latest.getFullYear(), latest.getMonth() - i, 1);
      out.push(monthKey(d));
    }
    return out;
  }, [months]);

  async function doSave() {
    const num = Number(String(amount).replace(/,/g, ".") || 0);
    await saveBudget(selected, num, currency);
    const b = await fetchBudgets();
    setBudgets(b);
    if (onChange) onChange(b);
    try {
      localStorage.setItem("budget_currency_pref", currency);
    } catch {
      void 0;
    }
  }

  async function doClear() {
    await deleteBudget(selected);
    const b = await fetchBudgets();
    setBudgets(b);
    if (onChange) onChange(b);
  }

  return (
    <div className="card p-3 mb-3">
      <div className="fw-bold mb-2">{t("budgets")}</div>
      <div className="mb-2">
        <select
          className="form-select form-select-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {monthsArr.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2 d-flex gap-2">
        <input
          className="form-control form-control-sm"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Monthly budget (e.g. 1200)"
        />
        <select
          className="form-select form-select-sm"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="btn btn-sm btn-primary" onClick={doSave}>
          Save
        </button>
        <button className="btn btn-sm btn-outline-secondary" onClick={doClear}>
          Clear
        </button>
      </div>
      <div className="small text-muted">
        {t("budget_help") || "Set a monthly spending budget (expenses only)."}
      </div>
    </div>
  );
}
