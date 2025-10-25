import { useState } from "react";
import ExpenseTracker from "../components/ExpenseTracker";
import SavingsSimulator from "../components/SavingsSimulator";
import InvestmentAnalyzer from "../components/InvestmentAnalyzer";
import { useTranslation } from "../i18n";

export default function FinancePage() {
  const { t } = useTranslation();
  const [country, setCountry] = useState("US");

  return (
    <div className="container py-4">
      <h1>{t("nav_finance")}</h1>

      <div className="row">
        <div className="col-md-6">
          <h3 className="mb-2">{t("expenses")}</h3>
          <ExpenseTracker />
        </div>
        <div className="col-md-6">
          <h3 className="mb-2">{t("savings")}</h3>
          <SavingsSimulator />
        </div>
      </div>

      <hr />
      <div className="mt-4">
        <div className="d-flex gap-2 align-items-center mb-3">
          <label className="mb-0">{t("country")}: </label>
          <select
            className="form-select form-select-sm w-auto"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="US">United States</option>
            <option value="PL">Poland</option>
            <option value="DK">Denmark</option>
            <option value="GB">United Kingdom</option>
            <option value="DE">Germany</option>
          </select>
        </div>

        <InvestmentAnalyzer country={country} />
      </div>
    </div>
  );
}
