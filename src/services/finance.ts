export type Transaction = {
  id: string;
  description: string;
  amount: number; // positive = income, negative = expense
  date: string; // ISO
  category?: string;
};

const KEY = "finance_transactions_v1";

export async function fetchTransactions(): Promise<Transaction[]> {
  // If auth token present, call serverless function
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const res = await fetch('/.netlify/functions/finance?op=list', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      return (json.records || []) as Transaction[];
    }
  } catch {
    // fall back to localStorage
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

export async function saveTransaction(tx: Transaction): Promise<Transaction> {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const res = await fetch('/.netlify/functions/finance?op=add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(tx),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.record as Transaction;
  }
  const list = await fetchTransactions();
  const next = [tx, ...list];
  localStorage.setItem(KEY, JSON.stringify(next));
  return tx;
}

export async function importCsv(file: File): Promise<Transaction[]> {
  const text = await file.text();
  const token = localStorage.getItem('auth_token');
  if (token) {
    const res = await fetch('/.netlify/functions/finance?op=import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ csv: text }),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.records as Transaction[];
  }
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  // Expect header like: date,description,amount,category
  const head = lines[0].split(',').map((s) => s.trim().toLowerCase());
  const idxDate = head.indexOf('date');
  const idxDesc = head.indexOf('description');
  const idxAmount = head.indexOf('amount');
  const idxCat = head.indexOf('category');
  const out: Transaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const date = cols[idxDate] || new Date().toISOString().slice(0, 10);
    const description = cols[idxDesc] || 'Imported';
    const amount = Number(cols[idxAmount] || 0);
    const category = idxCat >= 0 ? cols[idxCat] : 'Imported';
    out.push({ id: `imp_${Date.now()}_${i}`, date: new Date(date).toISOString(), description, amount, category });
  }
  const existing = await fetchTransactions();
  const merged = [...out, ...existing];
  localStorage.setItem(KEY, JSON.stringify(merged));
  return out;
}

export async function deleteTransaction(id: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const res = await fetch('/.netlify/functions/finance?op=delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error(await res.text());
    return;
  }
  const list = await fetchTransactions();
  const next = list.filter((t) => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export async function updateTransaction(tx: Transaction): Promise<Transaction> {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const res = await fetch('/.netlify/functions/finance?op=edit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(tx)
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.record as Transaction;
  }
  const list = await fetchTransactions();
  const next = list.map((t) => (t.id === tx.id ? tx : t));
  localStorage.setItem(KEY, JSON.stringify(next));
  return tx;
}
