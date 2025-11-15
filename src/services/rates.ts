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

export function convertAmount(amount: number, from: string | undefined, to: string, rates: Rates) {
  if (!from) from = rates.base || "EUR";
  from = from.toUpperCase();
  to = to.toUpperCase();
  if (from === to) return amount;
  // convert from -> EUR -> to using rates where rates[currency] = 1 unit of currency per base? Our rates are relative to base
  const rateFrom = rates[from] ?? (DEFAULT_RATES[from] ?? 1);
  const rateTo = rates[to] ?? (DEFAULT_RATES[to] ?? 1);
  // amount expressed in 'from' -> convert to base: value_in_base = amount / rateFrom; then to target: value_in_to = value_in_base * rateTo
  const valueInBase = amount / rateFrom;
  const valueInTo = valueInBase * rateTo;
  return valueInTo;
}

export { SUPPORTED as SUPPORTED_CURRENCIES };
