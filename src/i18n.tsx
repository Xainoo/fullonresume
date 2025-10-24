import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Lang = "en" | "pl";

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const translations: Record<Lang, Record<string, string>> = {
  en: {
    brand: "Krzysztof Przystaś",
    nav_home: "Home",
    nav_weather: "Weather",
    nav_portfolio: "Portfolio",
    nav_projects: "Projects",
    nav_finance: "Finance",
    home_title: "Hi, I'm Krzysztof — Frontend Developer",
    home_lead:
      "I build clean, accessible, and performant web apps using modern React and TypeScript.",
    cta_work: "See my work",
    cta_projects: "Projects",
    skills: "Skills",
    featured_project: "Featured project",
    about: "About me",
    footer_cta: "Interested in a CV or a quick walkthrough? Let's connect.",
    weather_loading: "Loading…",
    weather_using_client_fallback:
      "Using client-side OpenWeather key (insecure). For a secure setup, add OPENWEATHER_KEY to your functions env and run Netlify Dev or set the env on Netlify.",
    weather_humidity: "Humidity",
    weather_pressure: "Pressure",
    weather_wind: "Wind",
    weather_visibility: "Visibility",
    weather_sun: "Sun",
    weather_feels_like: "Feels like",
    weather_enter_city: "Enter city, e.g. London",
    weather_no_recent: "No recent cities",
    weather_search: "Search",
    weather_clear: "Clear",
    /* Finance translations */
    expenses: "Expenses",
    savings: "Savings",
    country: "Country",
    amount_label: "Amount",
    symbol_label: "Symbol",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    projected_value: "Projected value",
    estimated_annual_return: "Estimated annual return",
    estimated_tax: "Estimated tax",
    monthly_contribution: "Monthly contribution",
    initial: "Initial",
    annual_rate: "Annual rate (%)",
    years: "Years",
    projected_balance: "Projected balance",
    breakdown_by_year: "Breakdown by year",
    remove: "Remove",
    add: "Add",
    total: "Total",
    description: "Description",
    /* symbol descriptions */
    symbol_desc_SPY: "SPY — S&P 500 ETF (broad US market exposure)",
    symbol_desc_AAPL: "AAPL — Apple Inc., maker of iPhone and digital services",
    symbol_desc_MSFT: "MSFT — Microsoft Corporation, software and cloud leader",
    symbol_desc_GOOGL: "GOOGL — Alphabet (Google), search and online ads",
    symbol_desc_AMZN: "AMZN — Amazon.com, e-commerce and AWS cloud",
    symbol_desc_TSLA: "TSLA — Tesla, electric vehicles and energy",
    symbol_desc_NVDA: "NVDA — NVIDIA, GPUs for AI and gaming",
    symbol_desc_other:
      "Choose a symbol from the list or pick 'Other' to type your own ticker.",
    other: "Other",
    other_projects: "Other projects",
    view_project: "View project",
  },
  pl: {
    brand: "Krzysztof Przystaś",
    nav_home: "Strona główna",
    nav_weather: "Pogoda",
    nav_portfolio: "Portfolio",
    nav_projects: "Projekty",
    nav_finance: "Finanse",
    home_title: "Cześć, jestem Krzysztof — Frontend Developer",
    home_lead:
      "Tworzę czytelne, dostępne i wydajne aplikacje webowe w nowoczesnym React i TypeScript.",
    cta_work: "Zobacz moje prace",
    cta_projects: "Projekty",
    skills: "Umiejętności",
    featured_project: "Projekt wyróżniony",
    about: "O mnie",
    footer_cta: "Zainteresowany CV lub krótkim przeglądem? Skontaktuj się.",
    weather_loading: "Ładowanie…",
    weather_using_client_fallback:
      "Używany jest klucz OpenWeather po stronie klienta (niebezpieczne). Dla bezpiecznej konfiguracji dodaj OPENWEATHER_KEY do zmiennych środowiskowych funkcji i uruchom Netlify Dev lub ustaw tę zmienną na Netlify.",
    weather_humidity: "Wilgotność",
    weather_pressure: "Ciśnienie",
    weather_wind: "Wiatr",
    weather_visibility: "Widoczność",
    weather_sun: "Słońce",
    weather_feels_like: "Odczuwalna temperatura",
    weather_enter_city: "Wpisz miasto, np. Warszawa",
    weather_no_recent: "Brak ostatnich miast",
    weather_search: "Szukaj",
    weather_clear: "Wyczyść",
    /* Finance translations */
    expenses: "Wydatki",
    savings: "Oszczędności",
    country: "Kraj",
    amount_label: "Kwota",
    symbol_label: "Symbol",
    analyze: "Analizuj",
    analyzing: "Analizowanie...",
    projected_value: "Wartość prognozowana",
    estimated_annual_return: "Szacowany roczny zwrot",
    estimated_tax: "Szacowany podatek",
    monthly_contribution: "Wpłata miesięczna",
    initial: "Początkowa",
    annual_rate: "Roczna stopa (%)",
    years: "Lata",
    projected_balance: "Prognozowane saldo",
    breakdown_by_year: "Rozbicie według roku",
    remove: "Usuń",
    add: "Dodaj",
    total: "Suma",
    description: "Opis",
    /* symbol descriptions */
    symbol_desc_SPY:
      "SPY — ETF śledzący indeks S&P 500 (szeroka ekspozycja na rynek USA)",
    symbol_desc_AAPL:
      "AAPL — Apple Inc., producent iPhone'ów i usług cyfrowych",
    symbol_desc_MSFT:
      "MSFT — Microsoft Corporation, lider oprogramowania i chmury",
    symbol_desc_GOOGL:
      "GOOGL — Alphabet (Google), wyszukiwarka i reklamy online",
    symbol_desc_AMZN: "AMZN — Amazon.com, handel elektroniczny i chmura AWS",
    symbol_desc_TSLA:
      "TSLA — Tesla, producent pojazdów elektrycznych oraz energii",
    symbol_desc_NVDA: "NVDA — NVIDIA, producent układów GPU dla AI i gier",
    symbol_desc_other:
      "Wybierz symbol z listy lub wybierz 'Inny' i wpisz własny ticker.",
    other: "Inny",
    other_projects: "Inne projekty",
    view_project: "Zobacz projekt",
  },
};

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setLang: () => {},
  t: (k: string) => k,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem("lang");
      return (
        (stored as Lang) || (navigator.language?.startsWith("pl") ? "pl" : "en")
      );
    } catch {
      return navigator.language?.startsWith("pl") ? "pl" : "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {}
    // set html lang attribute for accessibility and SEO
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(
    () => (key: string) => {
      return translations[lang][key] ?? key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}

export default I18nContext;
