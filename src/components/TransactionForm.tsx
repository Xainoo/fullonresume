import React, { useState } from "react";
import type { Transaction } from "../services/finance";

export default function TransactionForm({
  onSave,
}: {
  onSave: (t: Transaction) => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("General");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      description: description || "(no description)",
      amount: Number(amount),
      date: new Date(date).toISOString(),
      category,
    };
    onSave(tx);
    setDescription("");
    setAmount(0);
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

      <div>
        <button className="btn btn-sm btn-primary" type="submit">
          Add
        </button>
      </div>
    </form>
  );
}
