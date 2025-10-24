import { useEffect, useState } from "react";
import WeatherWidget from "../components/WeatherWidget";
import { useTranslation } from "../i18n";

const HISTORY_KEY = "weather.recentCities";

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(h: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {}
}

export default function WeatherPage() {
  const { t } = useTranslation();
  const [city, setCity] = useState<string>(() => {
    try {
      const h = loadHistory();
      return h[0] ?? "London";
    } catch {
      return "London";
    }
  });
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>(() => loadHistory());

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  function doSearch() {
    if (query.trim()) {
      setCity(query.trim());
      setQuery("");
    }
  }

  function onLoaded(newCity: string) {
    // Maintain most-recent-first, unique list up to 5 items
    setHistory((prev) => {
      const copy = prev.filter(
        (c) => c.toLowerCase() !== newCity.toLowerCase()
      );
      copy.unshift(newCity);
      const truncated = copy.slice(0, 5);
      saveHistory(truncated);
      return truncated;
    });
  }

  function selectHistory(c: string) {
    setCity(c);
    setQuery("");
  }

  function clearHistory() {
    setHistory([]);
    saveHistory([]);
  }

  return (
    <div className="container py-4">
      <h1>{t("nav_weather")}</h1>

      <div className="mb-3 d-flex gap-2">
        <input
          className="form-control"
          placeholder={t("weather_enter_city")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doSearch();
          }}
        />
        <button className="btn btn-primary" onClick={doSearch}>
          {t("weather_search")}
        </button>
      </div>

      <div className="mb-3 d-flex gap-2 align-items-center">
        {history.length > 0 ? (
          <div className="d-flex gap-2 flex-wrap">
            {history.map((c) => (
              <button
                key={c}
                className="btn btn-sm btn-outline-secondary"
                onClick={() => selectHistory(c)}
              >
                {c}
              </button>
            ))}
            <button
              className="btn btn-sm btn-link text-danger"
              onClick={clearHistory}
            >
              {t("weather_clear")}
            </button>
          </div>
        ) : (
          <div className="text-muted">{t("weather_no_recent")}</div>
        )}
      </div>

      <WeatherWidget city={city} onLoaded={onLoaded} />
    </div>
  );
}
