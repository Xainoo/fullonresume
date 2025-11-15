import { useState, type FormEvent } from "react";
import type { Transaction } from "../services/finance";
import { SUPPORTED_CURRENCIES } from "../services/rates";

export default function TransactionForm({
  onSave,
  initial,
  onCancel,
}: {
  onSave: (t: Transaction) => void;
  initial?: Partial<Transaction>;
  onCancel?: () => void;
}) {
  const [description, setDescription] = useState(initial?.description ?? "");
  // keep input as string so user can delete the default 0 and type freely
  const [amount, setAmount] = useState<string>(
    initial?.amount !== undefined ? String(initial.amount) : ""
  );
  const [type, setType] = useState<"income" | "expense">(() =>
    initial && initial.amount !== undefined
      ? initial.amount < 0
        ? "expense"
        : "income"
      : "expense"
  );
  const [currency, setCurrency] = useState<string>(initial?.currency ?? "PLN");
  const [date, setDate] = useState(() =>
    initial?.date
      ? new Date(initial.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [category, setCategory] = useState(initial?.category ?? "General");

  function submit(e: FormEvent) {
    e.preventDefault();
    const num = Number(String(amount).replace(/,/g, ".") || 0);
    const signed = type === "expense" ? -Math.abs(num) : Math.abs(num);
    const tx: Transaction = {
      id: (initial && initial.id) || `tx_${Date.now()}`,
      description: description || "(no description)",
      // accept both comma and dot as decimal separator
      amount: signed,
      currency,
      date: new Date(date).toISOString(),
      category,
    };
    onSave(tx);
    if (!initial) {
      setDescription("");
      setAmount("");
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="mb-2">
        <input
          className="form-control form-control-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
      </div>

      <div className="mb-2 d-flex gap-2">
        <select
          className="form-select form-select-sm"
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
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
        <input
          className="form-control form-control-sm"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          className="form-control form-control-sm"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          aria-label="Amount"
        />
      </div>

      <div className="mb-2">
        <input
          className="form-control form-control-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
        />
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-sm btn-primary" type="submit">
          {initial ? "Save" : "Add"}
        </button>
        {initial && onCancel && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
