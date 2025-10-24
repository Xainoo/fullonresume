// Netlify Function: proxies requests to OpenWeatherMap and returns a sanitized response
// Deploy with Netlify; set OPENWEATHER_KEY in Netlify Site > Settings > Build & deploy > Environment

exports.handler = async function (event) {
  const city = (event.queryStringParameters && event.queryStringParameters.city) || "London";

  const key = process.env.OPENWEATHER_KEY;
  if (!key) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server missing OPENWEATHER_KEY" }),
    };
  }

  // Ensure fetch is available in this runtime. If not, return a helpful message.
  if (typeof fetch === "undefined") {
    const msg = "fetch is not available in this runtime. Use Node 18+ or run via `netlify dev` which provides a fetch polyfill.";
    console.error(msg);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: msg }),
    };
  }

  // Respect optional language parameter so OpenWeather returns localized descriptions
  const lang = (event.queryStringParameters && event.queryStringParameters.lang) || null;
  const langParam = lang ? `&lang=${encodeURIComponent(lang)}` : "";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${key}${langParam}`;

  try {
    const res = await fetch(url);
    let payload;
    try {
      payload = await res.json();
    } catch (jsonErr) {
      console.error("Failed to parse JSON from OpenWeather response", jsonErr);
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid response from upstream weather API" }),
      };
    }

    if (!res.ok) {
      console.error("OpenWeather API returned error", res.status, payload);
      return {
        statusCode: res.status || 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: payload }),
      };
    }

    const out = {
      name: payload.name,
      timezone: payload.timezone,
      sys: {
        country: payload.sys?.country,
        sunrise: payload.sys?.sunrise,
        sunset: payload.sys?.sunset,
      },
      main: {
        temp: payload.main?.temp,
        feels_like: payload.main?.feels_like,
        humidity: payload.main?.humidity,
        pressure: payload.main?.pressure,
      },
      weather: payload.weather?.map((w) => ({ description: w.description, icon: w.icon })),
      wind: payload.wind,
      visibility: payload.visibility,
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(out),
    };
  } catch (err) {
    console.error("Weather function error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
