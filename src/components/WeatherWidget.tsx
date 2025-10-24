import { useEffect, useState } from "react";
import { fetchCurrentWeather } from "../services/weather";
import type { WeatherApiResponse } from "../services/weather";

type Props = {
  city?: string;
  onLoaded?: (city: string) => void;
};

export default function WeatherWidget({ city = "London", onLoaded }: Props) {
  const [data, setData] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(c: string) {
    setLoading(true);
    setError(null);
    try {
      const w = await fetchCurrentWeather(c);
      setData(w);
      // notify parent that we successfully loaded this city's data
      try {
        onLoaded?.(w.name ?? c);
      } catch {}
    } catch (err: any) {
      setError(err?.message || String(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  return (
    <div className="card hover-card weather-card p-3">
      {loading && <div className="text-muted">Loading…</div>}
      {error && <div className="text-danger">{error}</div>}

      {data && (
        <div>
          <div className="d-flex align-items-center gap-3">
            <div className="weather-icon d-flex align-items-center justify-content-center">
              <img
                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                alt={data.weather[0].description}
                width={72}
                height={72}
              />
            </div>
            <div>
              <div className="h5 mb-0">
                {data.name}
                {data.sys?.country ? `, ${data.sys.country}` : ""}
              </div>
              <div className="text-muted text-capitalize">
                {data.weather[0].description}
              </div>
              <div className="h3 fw-bold mt-1">
                {Math.round(data.main.temp)}°C
              </div>
              <div className="text-muted">
                Feels like {Math.round(data.main.feels_like ?? data.main.temp)}
                °C
              </div>
            </div>
          </div>

          <hr />

          <div className="d-flex flex-wrap gap-3">
            <div className="text-muted">
              Humidity: <strong>{data.main.humidity}%</strong>
            </div>
            {typeof data.main.pressure !== "undefined" && (
              <div className="text-muted">
                Pressure: <strong>{data.main.pressure} hPa</strong>
              </div>
            )}
            {typeof data.wind?.speed !== "undefined" && (
              <div className="text-muted">
                Wind:{" "}
                <strong>
                  {data.wind!.speed.toFixed(1)} m/s (
                  {Math.round((data.wind!.speed ?? 0) * 3.6)} km/h)
                </strong>
              </div>
            )}
            {typeof data.visibility !== "undefined" && (
              <div className="text-muted">
                Visibility:{" "}
                <strong>{(data.visibility / 1000).toFixed(1)} km</strong>
              </div>
            )}
            {typeof data.sys?.sunrise !== "undefined" &&
              typeof data.timezone !== "undefined" && (
                <div className="text-muted">
                  Sun:{" "}
                  <strong>
                    {formatTime(data.sys?.sunrise, data.timezone)} /{" "}
                    {formatTime(data.sys?.sunset, data.timezone)}
                  </strong>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(unixSec?: number, tzOffsetSec?: number) {
  if (typeof unixSec !== "number" || typeof tzOffsetSec !== "number")
    return "-";
  try {
    const d = new Date((unixSec + tzOffsetSec) * 1000);
    // Use UTC formatting because we've already applied the timezone offset to the epoch
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}
