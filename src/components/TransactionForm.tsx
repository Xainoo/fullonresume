import { useState, type FormEvent } from "react";
import type { Transaction } from "../services/finance";

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
  const [amount, setAmount] = useState(initial?.amount ?? 0);
  const [date, setDate] = useState(() =>
    initial?.date
      ? new Date(initial.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [category, setCategory] = useState(initial?.category ?? "General");

  function submit(e: FormEvent) {
    e.preventDefault();
    const tx: Transaction = {
      id: (initial && initial.id) || `tx_${Date.now()}`,
      description: description || "(no description)",
      amount: Number(amount),
      date: new Date(date).toISOString(),
      category,
    };
    onSave(tx);
    if (!initial) {
      setDescription("");
      setAmount(0);
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
        <input
          className="form-control form-control-sm"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          className="form-control form-control-sm"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
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
