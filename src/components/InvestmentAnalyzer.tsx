import { useState } from "react";
import InfoIcon from "./InfoIcon";
import { useTranslation } from "../i18n";

type Props = {
  country: string;
};

type InvestResult = {
  projectedValue: number;
  annualReturnPct: number;
  estimatedTax: number;
};

export default function InvestmentAnalyzer({ country }: Props) {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState("SPY");
  const [amount, setAmount] = useState("1000");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Helper to perform fetch and return parsed result or info when non-JSON
      async function fetchInvest(url: string) {
        const r = await fetch(url);
        const ct = r.headers.get("content-type") || "";
        const txt = await r.text();
        return { res: r, contentType: ct, text: txt };
      }

      const query = `?symbol=${encodeURIComponent(
        symbol
      )}&amount=${encodeURIComponent(amount)}&country=${encodeURIComponent(
        country
      )}`;

      // Primary (relative) request (works when netlify dev or deployed proxy active)
      const primaryUrl = `/.netlify/functions/invest${query}`;
      let attempt = await fetchInvest(primaryUrl);

      // helper: try parse JSON safely
      function tryParseJson(text: string) {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      }

      // If primary returned JSON in body even when content-type is missing/wrong, use it
      const primaryParsed = tryParseJson(attempt.text);
      if (attempt.res.ok && primaryParsed) {
        setResult(primaryParsed as InvestResult);
        return;
      }

      // If primary returned error or couldn't parse JSON, try fallbacks
      if (
        !attempt.res.ok ||
        !attempt.contentType.includes("application/json")
      ) {
        // Try VITE_FUNCTIONS_URL (if set) then localhost:8888
        const envUrl = (import.meta as any).env?.VITE_FUNCTIONS_URL;
        const fallbacks: string[] = [];
        if (envUrl)
          fallbacks.push(`${envUrl}/.netlify/functions/invest${query}`);
        fallbacks.push(
          `http://localhost:8888/.netlify/functions/invest${query}`
        );
        fallbacks.push(
          `http://127.0.0.1:8888/.netlify/functions/invest${query}`
        );

        let successJson: any = null;
        for (const fb of fallbacks) {
          try {
            const a = await fetchInvest(fb);
            const parsed = tryParseJson(a.text);
            if (a.res.ok && parsed) {
              successJson = parsed;
              setResult(successJson as InvestResult);
              break;
            }
          } catch (e) {
            // ignore and try next
          }
        }
        if (successJson) return;

        // If no fallback worked, build a helpful error message from primary attempt
        const snippet = attempt.text.slice(0, 300);
        const ct = attempt.contentType || "text/html";
        throw new Error(
          `Expected JSON response from server but received: ${ct}.\nResponse snippet: ${snippet}\nHint: run \`netlify dev\` or set VITE_FUNCTIONS_URL to your functions host.`
        );
      }

      // Primary succeeded and content-type said JSON: parse
      const parsed = tryParseJson(attempt.text);
      if (!parsed) throw new Error("Failed to parse JSON response from server");
      setResult(parsed as InvestResult);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-3 hover-card">
      <div className="row g-2 align-items-end mb-3">
        <div className="col-sm">
          <label className="form-label">{t("amount_label")}</label>
          <div className="d-flex gap-2">
            <input
              className="form-control"
              aria-label={t("amount_label")}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <InfoIcon id="info-amount" title={t("amount_label") + " info"}>
              {t("amount_label")} — enter the investment amount. The analyzer
              will project this amount using historical returns for the selected
              symbol.
            </InfoIcon>
          </div>
        </div>
        <div className="col-sm">
          <label className="form-label">{t("symbol_label")}</label>
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select w-auto"
              aria-label={t("symbol_label")}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            >
              <option value="SPY">SPY</option>
              <option value="AAPL">AAPL</option>
              <option value="MSFT">MSFT</option>
              <option value="GOOGL">GOOGL</option>
              <option value="AMZN">AMZN</option>
              <option value="TSLA">TSLA</option>
              <option value="NVDA">NVDA</option>
              <option value="OTHER">{t("other") ?? "Other"}</option>
            </select>
            <InfoIcon id="info-symbol" title={t("symbol_label") + " info"}>
              {t("symbol_label")} —{" "}
              {t("symbol_desc_" + (symbol === "OTHER" ? "other" : symbol))}
            </InfoIcon>
          </div>
          {symbol === "OTHER" && (
            <div className="mt-2">
              <input
                className="form-control"
                placeholder={t("symbol_label")}
                value={symbol === "OTHER" ? "" : symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>
          )}
          {/* short description below select */}
          <div className="small text-muted mt-2">
            {(() => {
              const key =
                "symbol_desc_" + (symbol === "OTHER" ? "other" : symbol);
              const txt = t(key);
              return txt === key ? t("symbol_desc_other") : txt;
            })()}
          </div>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={analyze}
            disabled={loading}
          >
            {loading ? t("analyzing") : t("analyze")}
          </button>
        </div>
      </div>

      {error && <div className="text-danger mb-2">{error}</div>}

      {result && (
        <div>
          <div className="mb-1 text-muted">{t("projected_value")}</div>
          <div className="h4">${result.projectedValue.toFixed(2)}</div>
          <div className="small text-muted">
            {t("estimated_annual_return")}: {result.annualReturnPct}%
          </div>
          <div className="mt-2">
            {t("estimated_tax")} ({country}):{" "}
            <strong>${result.estimatedTax.toFixed(2)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
