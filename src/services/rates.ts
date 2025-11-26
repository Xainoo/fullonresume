const SUPPORTED = ["PLN", "USD", "EUR", "DKK", "GBP"];

// Default static rates relative to EUR (1 EUR = X currency)
const DEFAULT_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.1,
  PLN: 4.6,
  DKK: 7.44,
  GBP: 0.86,
};

export type Rates = Record<string, number> & { base?: string };

export async function fetchRates(base = "EUR"): Promise<Rates> {
  try {
    const symbols = SUPPORTED.join(",");
    const res = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${symbols}`);
    if (!res.ok) throw new Error("rates fetch failed");
    const json = await res.json();
    const rates: Rates = json.rates || {};
    rates.base = json.base || base;
    // ensure base present
    rates[base] = 1;
    return rates;
  } catch {
    // fall back to defaults, adjust if base is different
    const out: Rates = {} as Rates;
    Object.keys(DEFAULT_RATES).forEach((k) => (out[k] = DEFAULT_RATES[k]));
    if (base !== "EUR") {
      // convert DEFAULT_RATES (which are EUR-based) into new base
      const baseRate = out[base] || 1;
      Object.keys(out).forEach((k) => (out[k] = out[k] / baseRate));
    }
    out.base = base;
    return out;
  }
}

export function convertAmount(
  amount: number,
  from: string | undefined,
  to: string,
  rates?: Rates | null
) {
  // normalize
  from = (from || (rates && rates.base) || "EUR").toUpperCase();
  to = (to || "EUR").toUpperCase();
  if (from === to) return amount;

  // If rates are not provided, fall back to DEFAULT_RATES (EUR-based)
  if (!rates) {
    const rateFrom = DEFAULT_RATES[from] ?? 1;
    const rateTo = DEFAULT_RATES[to] ?? 1;
    const valueInBase = amount / rateFrom;
    return valueInBase * rateTo;
  }

  // convert using provided rates (rates are relative to rates.base)
  const rateFrom = rates[from] ?? (DEFAULT_RATES[from] ?? 1);
  const rateTo = rates[to] ?? (DEFAULT_RATES[to] ?? 1);
  const valueInBase = amount / rateFrom;
  const valueInTo = valueInBase * rateTo;
  return valueInTo;
}

export { SUPPORTED as SUPPORTED_CURRENCIES };
