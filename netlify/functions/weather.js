// Netlify Function: proxies requests to OpenWeatherMap and returns a sanitized response
// Deploy with Netlify; set OPENWEATHER_KEY in Netlify Site > Settings > Build & deploy > Environment

exports.handler = async function (event) {
  const city = (event.queryStringParameters && event.queryStringParameters.city) || "London";

  const key = process.env.OPENWEATHER_KEY;
  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server missing OPENWEATHER_KEY" }),
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${key}`;

  try {
    const res = await fetch(url);
    const payload = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status || 500,
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
      body: JSON.stringify(out),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
