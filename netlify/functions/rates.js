// Clean ESM Netlify function: proxy exchange rates using exchangerate.host (with key) or frankfurter.app fallback.

let cache = {
  ts: 0,
  ttl: 5 * 60 * 1000, // 5 minutes
  data: null,
};

export const handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const base = qs.base || "USD";
    const symbols = qs.symbols || "PLN,USD,EUR,GBP";
    const force = qs.force === "true";

    const now = Date.now();
    if (!force && cache.data && now - cache.ts < cache.ttl) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates: cache.data, timestamp: cache.ts }),
      };
    }

    if (typeof fetch !== "function") {
      if (cache.data) {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rates: cache.data, timestamp: cache.ts }),
        };
      }
      return { statusCode: 500, body: "Fetch not available in runtime" };
    }

    // Try exchangerate.host if an access key is provided
    let rates = null;
    if (process.env.EXCHANGERATE_HOST_KEY) {
      try {
        const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(
          symbols
        )}&access_key=${encodeURIComponent(process.env.EXCHANGERATE_HOST_KEY)}`;
        const res = await fetch(url);
        if (res.ok) {
          const j = await res.json();
          rates = j.rates || null;
        }
      } catch (e) {
        rates = null;
      }
    }

    // Fallback to frankfurter.app if needed
    if (!rates) {
      try {
        const to = symbols.split(",").filter(Boolean).join(",");
        const fUrl = `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(to)}`;
        const fres = await fetch(fUrl);
        if (fres.ok) {
          const fj = await fres.json();
          rates = fj.rates || {};
          if (base) rates[base] = 1;
        }
      } catch (e) {
        rates = null;
      }
    }

    if (!rates) {
      if (cache.data) {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rates: cache.data, timestamp: cache.ts }),
        };
      }
      return { statusCode: 502, body: "Failed to fetch rates" };
    }

    const wanted = symbols.split(",");
    const normalized = {};
    for (const s of wanted) {
      normalized[s] = rates[s] != null ? rates[s] : null;
    }

    cache = { ts: now, ttl: cache.ttl, data: normalized };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rates: normalized, timestamp: now }),
    };
  } catch (err) {
    if (cache.data) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates: cache.data, timestamp: cache.ts }),
      };
    }
    return { statusCode: 500, body: String(err) };
  }
};
