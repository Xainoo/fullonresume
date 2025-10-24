export type WeatherApiResponse = {
  name: string;
  timezone?: number; // shift in seconds from UTC
  sys?: { country?: string; sunrise?: number; sunset?: number };
  main: { temp: number; feels_like?: number; humidity: number; pressure?: number };
  weather: { description: string; icon: string }[];
  wind?: { speed?: number; deg?: number };
  visibility?: number; // meters
};

/**
 * Fetch current weather from OpenWeatherMap.
 * Requires VITE_OPENWEATHER_KEY to be set in environment (.env).
 */
export async function fetchCurrentWeather(city: string, lang?: string) {
  const useProxy = import.meta.env.VITE_USE_PROXY === "true";

  if (useProxy) {
    // Call the Netlify Function proxy
  const langParam = lang ? `&lang=${encodeURIComponent(lang)}` : "";
  const res = await fetch(`/.netlify/functions/weather?city=${encodeURIComponent(city)}${langParam}`);
    const ct = res.headers.get("content-type") || "";
    const text = await res.text();

    // If proxy returned a JSON error body, try to parse it
    let proxyPayload: any = null;
    if (ct.includes("application/json")) {
      try {
        proxyPayload = JSON.parse(text);
      } catch {}
    }

    if (!res.ok) {
      // Recognize common upstream OpenWeather responses (e.g., invalid API key)
      const clientKey = import.meta.env.VITE_OPENWEATHER_KEY as string | undefined;

      // If upstream explicitly says invalid API key (cod:401), surface a clear message
  const upstreamInvalidKey = proxyPayload && (proxyPayload.cod === 401 || (proxyPayload.error && proxyPayload.error.cod === 401));

      if (upstreamInvalidKey) {
        // If developer has a VITE client key available, fall back to client call (dev convenience)
        if (clientKey) {
          try {
            // Mark that we used a direct client fallback (only in browser).
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (typeof window !== "undefined") window.__WEATHER_DIRECT_FALLBACK_USED = true;
          } catch {}

          const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            city
          )}&units=metric&appid=${clientKey}${lang ? `&lang=${encodeURIComponent(lang)}` : ""}`;
          const r2 = await fetch(url);
          if (!r2.ok) {
            const t2 = await r2.text();
            throw new Error(t2 || `Weather API error: ${r2.status}`);
          }
          const json2 = (await r2.json()) as WeatherApiResponse;
          return json2;
        }

        // No client key available — instruct developer to add OPENWEATHER_KEY to functions env
        throw new Error(
          `Upstream OpenWeather error: Invalid API key. Set OPENWEATHER_KEY in your functions environment (used by Netlify functions) or provide a valid VITE_OPENWEATHER_KEY for local testing.`
        );
      }

      // Fallback: throw the proxy error (string or JSON)
      if (proxyPayload && proxyPayload.error) {
        // If proxy returned structured JSON error, include useful message
        const errMsg = typeof proxyPayload.error === "string" ? proxyPayload.error : JSON.stringify(proxyPayload.error);
        throw new Error(errMsg);
      }
      throw new Error(text || `Weather proxy error: ${res.status}`);
    }

    // res.ok — parse json
    const json = (ct.includes("application/json") ? JSON.parse(text) : null) as WeatherApiResponse;
    if (!json) throw new Error("Invalid JSON from weather proxy");
    return json;
  }

  const key = import.meta.env.VITE_OPENWEATHER_KEY as string | undefined;
  if (!key) {
    throw new Error("Missing VITE_OPENWEATHER_KEY environment variable.");
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${key}${lang ? `&lang=${encodeURIComponent(lang)}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Weather API error: ${res.status}`);
  }

  const json = (await res.json()) as WeatherApiResponse;
  return json;
}
