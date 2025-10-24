import React, { useState } from "react";
import { useTranslation } from "../i18n";

type Expense = {
  id: string;
  description: string;
  amount: number;
};

export default function ExpenseTracker() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Expense[]>([]);
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");

  function add() {
    const a = parseFloat(amt || "0");
    if (!desc || isNaN(a)) return;
    setItems((s) => [
      { id: String(Date.now()), description: desc, amount: a },
      ...s,
    ]);
    setDesc("");
    setAmt("");
  }

  function remove(id: string) {
    setItems((s) => s.filter((i) => i.id !== id));
  }

  const total = items.reduce((acc, it) => acc + it.amount, 0);

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
        <button className="btn btn-primary" onClick={add} type="button">
          {t("add")}
        </button>
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
              <span className="me-3">${it.amount.toFixed(2)}</span>
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

      <div className="d-flex justify-content-between">
        <div className="text-muted">{t("total")}</div>
        <div className="fw-bold">${total.toFixed(2)}</div>
      </div>
    </div>
  );
}
