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
export async function fetchCurrentWeather(city: string) {
  const useProxy = import.meta.env.VITE_USE_PROXY === "true";

  if (useProxy) {
    // Call the Netlify Function proxy
    const res = await fetch(`/.netlify/functions/weather?city=${encodeURIComponent(city)}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Weather proxy error: ${res.status}`);
    }
    const json = (await res.json()) as WeatherApiResponse;
    return json;
  }

  const key = import.meta.env.VITE_OPENWEATHER_KEY as string | undefined;
  if (!key) {
    throw new Error("Missing VITE_OPENWEATHER_KEY environment variable.");
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${key}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Weather API error: ${res.status}`);
  }

  const json = (await res.json()) as WeatherApiResponse;
  return json;
}
