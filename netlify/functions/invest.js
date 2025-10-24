// Simple invest analysis function. If OPENINVEST_KEY is provided it can call
// an external provider. Otherwise it returns deterministic mock data.

// Module-scope cache so consecutive cold-started invocations in the same
// function instance can reuse results (reduces API calls).
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes
const cache = new Map();

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function cacheSet(key, value) {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL });
}

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const symbol = (params.symbol || "SPY").toUpperCase();
  const amount = parseFloat(params.amount || "0") || 0;
  const country = (params.country || "US").toUpperCase();
  const years = 5;

  const OPENINVEST_KEY = process.env.OPENINVEST_KEY; // Finnhub or other provider

  // Simple tax rates (approximate). These are placeholders and should be
  // reviewed with a tax advisor for production use.
  const taxRates = {
    US: 15,
    PL: 19,
    GB: 20,
    DE: 25,
    DK: 27,
  };

  const cacheKey = `invest:${symbol}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    const { annualReturnPct } = cached;
    const years = 5;
    const projectedValue = amount * Math.pow(1 + annualReturnPct / 100, years);
    const gain = Math.max(0, projectedValue - amount);
    const estimatedTax = (gain * (taxRates[country] ?? 15)) / 100;
    return {
      statusCode: 200,
      body: JSON.stringify({ projectedValue, annualReturnPct, estimatedTax, source: cached.source }),
    };
  }

  // If no provider key, return a deterministic fallback
  if (!OPENINVEST_KEY) {
    const baseReturn = symbol.startsWith("S") ? 7 : 5;
    const years = 5;
    const annualReturnPct = baseReturn;
    const projectedValue = amount * Math.pow(1 + annualReturnPct / 100, years);
    const gain = Math.max(0, projectedValue - amount);
    const estimatedTax = (gain * (taxRates[country] ?? 15)) / 100;
    return {
      statusCode: 200,
      body: JSON.stringify({ projectedValue, annualReturnPct, estimatedTax, source: "mock" }),
    };
  }

  try {
    // Use Finnhub candle endpoint to get 5 years of daily data
    const now = Math.floor(Date.now() / 1000);
    const fiveYears = now - 5 * 365 * 24 * 60 * 60;
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${fiveYears}&to=${now}&token=${encodeURIComponent(OPENINVEST_KEY)}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      // fallback to mock
      const baseReturn = symbol.startsWith("S") ? 7 : 5;
      const years = 5;
      const annualReturnPct = baseReturn;
      const projectedValue = amount * Math.pow(1 + annualReturnPct / 100, years);
      const gain = Math.max(0, projectedValue - amount);
      const estimatedTax = (gain * (taxRates[country] ?? 15)) / 100;
      return {
        statusCode: 200,
        body: JSON.stringify({ projectedValue, annualReturnPct, estimatedTax, source: "mock" }),
      };
    }

    const data = await resp.json();
    // Finnhub returns { s: 'ok', c: [...], t: [...] }
    if (data && data.s === "ok" && Array.isArray(data.c) && data.c.length >= 2) {
      const prices = data.c;
      const first = prices[0];
      const last = prices[prices.length - 1];
      const yearsSpan = 5;
      const annualReturnPct = ((Math.pow(last / first, 1 / yearsSpan) - 1) * 100) || 0;

      // Cache the computed return to avoid frequent API calls
      cacheSet(cacheKey, { annualReturnPct, source: "finnhub" });

      const projectedValue = amount * Math.pow(1 + annualReturnPct / 100, years);
      const gain = Math.max(0, projectedValue - amount);
      const estimatedTax = (gain * (taxRates[country] ?? 15)) / 100;

      return {
        statusCode: 200,
        body: JSON.stringify({ projectedValue, annualReturnPct, estimatedTax, source: "finnhub" }),
      };
    }

    // fallback
    const baseReturn = symbol.startsWith("S") ? 7 : 5;
    const years = 5;
    const annualReturnPct = baseReturn;
    const projectedValue = amount * Math.pow(1 + annualReturnPct / 100, years);
    const gain = Math.max(0, projectedValue - amount);
    const estimatedTax = (gain * (taxRates[country] ?? 15)) / 100;
    return {
      statusCode: 200,
      body: JSON.stringify({ projectedValue, annualReturnPct, estimatedTax, source: "mock" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
