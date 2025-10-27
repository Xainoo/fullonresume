import { useEffect, useState } from "react";
import { fetchCurrentWeather } from "../services/weather";
import type { WeatherApiResponse } from "../services/weather";
import { useTranslation } from "../i18n";

type Props = {
  city?: string;
  onLoaded?: (city: string) => void;
};

export default function WeatherWidget({ city = "London", onLoaded }: Props) {
  const { t, lang } = useTranslation();
  const [data, setData] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedDirectFallback, setUsedDirectFallback] = useState(false);

  async function load(c: string) {
    setLoading(true);
    setError(null);
    try {
      const w = await fetchCurrentWeather(c, lang);
      setData(w);
      try {
        onLoaded?.(w.name ?? c);
      } catch {
        void 0;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setData(null);
      try {
        type GlobalWithFlag = typeof globalThis & {
          __WEATHER_DIRECT_FALLBACK_USED?: boolean;
        };
        const g = globalThis as unknown as GlobalWithFlag;
        if (g && g.__WEATHER_DIRECT_FALLBACK_USED) {
          setUsedDirectFallback(true);
        }
      } catch {
        void 0;
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, lang]);

  return (
    <div className="card hover-card weather-card p-3">
      {loading && <div className="text-muted">{t("weather_loading")}</div>}
      {error && <div className="text-danger">{error}</div>}
      {usedDirectFallback && (
        <div className="text-warning small mb-2">
          {t("weather_using_client_fallback")}
        </div>
      )}

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
                {t("weather_feels_like")}{" "}
                {Math.round(data.main.feels_like ?? data.main.temp)}°C
              </div>
            </div>
          </div>

          <hr />

          <div className="d-flex flex-wrap gap-3">
            <div className="text-muted">
              {t("weather_humidity")}: <strong>{data.main.humidity}%</strong>
            </div>

            {typeof data.main.pressure !== "undefined" && (
              <div className="text-muted">
                {t("weather_pressure")}:{" "}
                <strong>{data.main.pressure} hPa</strong>
              </div>
            )}

            {typeof data.wind?.speed !== "undefined" && (
              <div className="text-muted">
                {t("weather_wind")}:
                <strong>
                  {" "}
                  {data.wind!.speed.toFixed(1)} m/s (
                  {Math.round((data.wind!.speed ?? 0) * 3.6)} km/h)
                </strong>
              </div>
            )}

            {typeof data.visibility !== "undefined" && (
              <div className="text-muted">
                {t("weather_visibility")}:{" "}
                <strong>{(data.visibility / 1000).toFixed(1)} km</strong>
              </div>
            )}

            {typeof data.sys?.sunrise !== "undefined" &&
              typeof data.timezone !== "undefined" && (
                <div className="text-muted">
                  {t("weather_sun")}:{" "}
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
