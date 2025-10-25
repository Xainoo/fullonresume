import { useEffect, useState } from "react";
import { useTranslation } from "../i18n";

type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: "PLN" | "USD" | "EUR" | "GBP";
};

export default function ExpenseTracker() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Expense[]>([]);
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");
  const [currency, setCurrency] = useState<"PLN" | "USD" | "EUR" | "GBP">(
    "USD"
  );

  // view mode: 'separate' shows totals per currency, 'convert' shows all converted
  const [viewMode, setViewMode] = useState<"separate" | "convert">("separate");
  const [targetCurrency, setTargetCurrency] = useState<
    "PLN" | "USD" | "EUR" | "GBP"
  >("USD");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const STORAGE_KEY = "fullon_expenses_v2";
  const STORAGE_CURRENCY = "fullon_expenses_currency_v2";

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Expense[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore */
    }
    try {
      const cur = localStorage.getItem(STORAGE_CURRENCY) as string | null;
      if (
        cur &&
        (cur === "PLN" || cur === "USD" || cur === "EUR" || cur === "GBP")
      ) {
        setCurrency(cur as any);
        setTargetCurrency(cur as any);
      }
    } catch {}
  }

  useEffect(() => {
    loadFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items || []));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CURRENCY, currency);
    } catch {}
  }, [currency]);

  function add() {
    const a = parseFloat(amt || "0");
    if (!desc || isNaN(a)) return;
    const item: Expense = {
      id: String(Date.now()),
      description: desc,
      amount: a,
      currency,
    };
    setItems((s) => [item, ...s]);
    setDesc("");
    setAmt("");
  }

  function remove(id: string) {
    setItems((s) => s.filter((i) => i.id !== id));
  }

  // totals per currency
  const totals = items.reduce((acc: Record<string, number>, it) => {
    acc[it.currency] = (acc[it.currency] || 0) + it.amount;
    return acc;
  }, {} as Record<string, number>);

  // fetch exchange rates (base = USD) for the 4 currencies
  async function fetchRates(force: boolean = false) {
    setLoadingRates(true);
    try {
      const q = `base=USD&symbols=PLN,USD,EUR,GBP${force ? "&force=true" : ""}`;
      const res = await fetch(`/.netlify/functions/rates?${q}`);
      if (!res.ok) throw new Error("Failed to fetch rates");
      const json = await res.json();
      if (json && json.rates) {
        setRates(json.rates);
        // use server timestamp if available, otherwise use now
        setLastUpdated(json.timestamp ? json.timestamp : Date.now());
      }
    } catch (err) {
      // keep old rates if available; otherwise clear
      if (!rates) setRates(null);
    } finally {
      setLoadingRates(false);
    }
  }

  // convert an amount from `from` currency into `target` using rates (base USD)
  function convertToTarget(amount: number, from: string, target: string) {
    if (from === target) return amount;
    if (!rates) return NaN;
    const rFrom = rates[from] ?? 1; // 1 USD = rFrom FROM
    const rTarget = rates[target] ?? 1; // 1 USD = rTarget TARGET
    // amount_in_USD = amount / rFrom
    const amountUSD = amount / rFrom;
    // amount_in_target = amountUSD * rTarget
    return amountUSD * rTarget;
  }

  // compute converted total when in convert mode
  const convertedTotal =
    viewMode === "convert" && rates
      ? items.reduce((acc, it) => {
          const v = convertToTarget(it.amount, it.currency, targetCurrency);
          return acc + (isNaN(v) ? 0 : v);
        }, 0)
      : 0;

  function formatAmount(value: number, cur?: string) {
    const c = (cur || currency) as any;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: c,
      }).format(value);
    } catch {
      const sym =
        c === "PLN" ? "zł" : c === "EUR" ? "€" : c === "GBP" ? "£" : "$";
      return `${sym}${value.toFixed(2)}`;
    }
  }

  useEffect(() => {
    let timer: number | undefined;
    if (viewMode === "convert") {
      // fetch immediately and then poll every 60s while in convert mode
      fetchRates();
      timer = window.setInterval(() => {
        fetchRates();
      }, 60_000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, targetCurrency]);

  return (
    <div>
      <div className="input-group mb-2">
        <input
          className="form-control"
          placeholder={t("add") + " " + t("description")}
          aria-label={t("description")}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <input
          className="form-control"
          placeholder={t("amount_label")}
          aria-label={t("amount_label")}
          value={amt}
          onChange={(e) => setAmt(e.target.value)}
        />

        <select
          className="form-select form-select-sm w-auto me-2"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as any)}
          aria-label="Currency"
        >
          <option value="PLN">PLN</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>

        <button className="btn btn-primary" onClick={add} type="button">
          {t("add")}
        </button>
      </div>

      <div className="d-flex gap-2 align-items-center mb-2">
        <div className="form-check">
          <input
            id="view-separate"
            className="form-check-input"
            type="radio"
            name="viewMode"
            checked={viewMode === "separate"}
            onChange={() => setViewMode("separate")}
          />
          <label htmlFor="view-separate" className="form-check-label ms-2">
            {t("expenses_view_separate")}
          </label>
        </div>
        <div className="form-check">
          <input
            id="view-convert"
            className="form-check-input"
            type="radio"
            name="viewMode"
            checked={viewMode === "convert"}
            onChange={() => setViewMode("convert")}
          />
          <label htmlFor="view-convert" className="form-check-label ms-2">
            {t("expenses_view_convert")}
          </label>
        </div>

        {viewMode === "convert" && (
          <>
            <select
              className="form-select form-select-sm w-auto ms-3"
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value as any)}
            >
              <option value="PLN">PLN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <button
              className="btn btn-outline-secondary btn-sm ms-2"
              onClick={() => fetchRates(true)}
              disabled={loadingRates}
            >
              {loadingRates ? t("loading_rates") : t("refresh_rates")}
            </button>
          </>
        )}
      </div>

      <div className="list-group mb-2">
        {items.map((it) => (
          <div
            key={it.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <div className="fw-bold">{it.description}</div>
              <div className="text-muted small">{it.id}</div>
            </div>
            <div>
              <span className="me-3">
                {formatAmount(it.amount, it.currency)}
              </span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => remove(it.id)}
              >
                {t("remove")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-2">
        {viewMode === "separate" ? (
          <div>
            {Object.keys(totals).length === 0 ? (
              <div className="text-muted">
                {t("no_recent") ?? "No expenses"}
              </div>
            ) : (
              Object.entries(totals).map(([cur, val]) => (
                <div key={cur} className="d-flex justify-content-between">
                  <div className="text-muted">{cur}</div>
                  <div className="fw-bold">{formatAmount(val, cur)}</div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">{t("total")}</div>
            <div className="fw-bold">
              {rates
                ? formatAmount(convertedTotal, targetCurrency)
                : t("rates_unavailable")}
            </div>
          </div>
        )}
        {viewMode === "convert" && lastUpdated && (
          <div className="small text-muted mt-1">
            {t("rates_last_updated")}:{" "}
            {new Intl.DateTimeFormat(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).format(lastUpdated)}
          </div>
        )}
      </div>
    </div>
  );
}
