/* eslint-disable react-refresh/only-export-components */
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
    ai_playground: "AI playground",
    classifier_title: "Image Analizer (browser)",
    classifier_desc:
      "Uses TensorFlow.js MobileNet in the browser — works on Netlify free.",
    classifier_confidence: "Confidence threshold:",
    classifier_live: "Live",
    classifier_no_predictions: "No predictions yet",
    smoke_test_title: "Classifier smoke test",
    smoke_test_desc: "Run a quick smoke test against a sample image (remote).",
    chat_title: "Realtime chat (Pusher WebSocket)",
    chat_desc:
      "Uses Pusher channels for WebSocket-style realtime messaging. You need to set VITE_PUSHER_KEY and VITE_PUSHER_CLUSTER in your env.",
    realtime_disabled: "Realtime disabled (no Pusher key). Local-only chat.",
    run_smoke_test: "Run smoke test",
    open_sample_image: "Open sample image",
    no_messages_yet: "No messages yet",
    type_message_placeholder: "Type a message",
    send: "Send",
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
    about_me_paragraph:
      "Programming is my passion, not just a career plan. I’m most excited about frontend development — I love building apps that are fast, accessible, and pleasant to use. I work mainly with React, JavaScript, TypeScript, Node.js, Python, HTML, and CSS, and I care about performance, accessibility, and clean code. Before switching to tech, I worked in various roles — from assisting visitors at a zoo to helping set up concert stages — experiences that taught me teamwork, responsibility, and working under pressure. Now I’m looking for my first opportunity in IT to learn, grow, and build projects I can be proud of.",
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
    expenses_view_separate: "Separate (per currency)",
    expenses_view_convert: "Convert to single currency",
    refresh_rates: "Refresh rates",
    rates_unavailable: "Rates unavailable",
    loading_rates: "Loading rates…",
    rates_last_updated: "Rates updated",
    view_project: "View project",
    project_portfolio_title: "Portfolio site",
    project_portfolio_description:
      "A responsive portfolio showcasing selected projects, written with React & TypeScript. Includes accessibility and performance optimizations.",
    project_portfolio_long:
      "This portfolio demonstrates component-driven design, accessible markup, responsive layouts, and careful performance tradeoffs. Built with React, TypeScript, and Vite. Includes light/dark themes and i18n.",
    project_weather_title: "Weather app",
    project_weather_description:
      "A small weather dashboard with serverless proxy for API keys and graceful fallbacks. Theme-aware and localized.",
    project_weather_long:
      "Uses a Netlify Function to proxy OpenWeather API calls so API keys remain server-side. The UI gracefully falls back to a client key in local dev and shows warnings. Supports language localization and theme-aware styles.",
    project_finance_title: "Finance analyzer",
    project_finance_description:
      "Savings & investment tools with projection charts and country tax estimates. Built with small serverless functions.",
    project_finance_long:
      "Includes an expense tracker, savings simulator, and an investment analyzer that fetches historical data and estimates growth and taxes. Designed for clarity and quick what-if analysis.",
    // Finance dashboard friendly labels
    finance_dashboard: "Personal Finance",
    add_transaction: "Record a transaction",
    import_csv: "Import transactions (CSV)",
    export_csv: "Export transactions (CSV)",
    project_ui_title: "Interactive UI components",
    project_ui_description:
      "Reusable components (InfoIcon, SkillPill, ProjectCard) designed for accessibility and small bundle size.",
    project_ui_long:
      "A small library of focused UI components: accessible info tooltips, keyboard-friendly skill pills, and composable cards. Each component prioritizes semantics and minimal styling.",
    // Auth translations
    auth_choose_action: "Choose an action",
    auth_action_login: "Sign in",
    auth_action_register: "Register",
    auth_action_guest: "Enter as Guest",
    guest_label: "Guest",
    logged_in_as: "Logged in as:",
    auth_label_name: "Name",
    auth_label_email: "Email",
    auth_label_password: "Password",
    auth_back: "Back",
    auth_confirm_password: "Confirm password",
    auth_admin_code_prompt: "Have an admin code?",
    auth_admin_code_label: "Admin code",
    greeting_user_prefix: "Hi",
    greeting_guest: "Hi guest",
    greeting_admin_prefix: "Hi admin",
    logout: "Logout",
    nav_admin: "Admin",
    contact_title: "Contact & Socials",
    admin_users_title: "User management",
    admin_confirm_delete: "Are you sure you want to delete this user?",
    admin_cannot_delete_admin: "Cannot delete admin user",
    admin_delete: "Delete",
    loading: "Loading...",
  },
  pl: {
    ai_playground: "Przestrzeń AI",
    classifier_title: "Klasyfikator zwierząt (w przeglądarce)",
    classifier_desc:
      "Używa TensorFlow.js MobileNet po stronie klienta — działa na Netlify Free.",
    classifier_confidence: "Próg pewności:",
    classifier_live: "Na żywo",
    classifier_no_predictions: "Brak przewidywań",
    smoke_test_title: "Test dymny klasyfikatora",
    smoke_test_desc: "Uruchom szybki test na przykładowym obrazie (lokalny).",
    chat_title: "Czat w czasie rzeczywistym (Pusher WebSocket)",
    chat_desc:
      "Używa kanałów Pusher do komunikacji w czasie rzeczywistym. Ustaw VITE_PUSHER_KEY i VITE_PUSHER_CLUSTER w swoim env.",
    realtime_disabled: "Realtime wyłączony (brak klucza Pusher). Czat lokalny.",
    run_smoke_test: "Uruchom test dymny",
    open_sample_image: "Otwórz przykładowy obraz",
    no_messages_yet: "Brak wiadomości",
    type_message_placeholder: "Wpisz wiadomość",
    send: "Wyślij",
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
    about_me_paragraph:
      "Programowanie to moja pasja, a nie tylko plan na karierę. Najlepiej czuję się w świecie frontendu — lubię tworzyć aplikacje, które są nie tylko szybkie, ale też przyjazne dla użytkownika. Pracuję głównie z Reactem, JavaScriptem, TypeScriptem, Node.js, Pythonem, HTML-em i CSS-em. Zwracam uwagę na wydajność, dostępność i czysty kod. Wcześniej pracowałem w różnych środowiskach — od obsługi zwiedzających w zoo po montaż scen na koncertach — dzięki czemu nauczyłem się pracy zespołowej, odpowiedzialności i działania pod presją czasu. Teraz szukam swojej pierwszej szansy w IT, żeby dalej się uczyć, rozwijać i tworzyć projekty, z których będę dumny.",
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
    expenses_view_separate: "Osobno (według waluty)",
    expenses_view_convert: "Przelicz do jednej waluty",
    refresh_rates: "Odśwież kursy",
    rates_unavailable: "Kursy niedostępne",
    loading_rates: "Ładowanie kursów…",
    rates_last_updated: "Kursy zaktualizowano",
    view_project: "Zobacz projekt",
    project_portfolio_title: "Strona portfolio",
    project_portfolio_description:
      "Responsywne portfolio prezentujące wybrane projekty, napisane w React i TypeScript. Zawiera optymalizacje dostępności i wydajności.",
    project_portfolio_long:
      "To portfolio pokazuje projektowanie zorientowane na komponenty, semantyczny kod, responsywne układy i przemyślane kompromisy wydajnościowe. Zbudowane z React, TypeScript i Vite. Zawiera motywy jasny/ciemny oraz i18n.",
    project_weather_title: "Aplikacja pogodowa",
    project_weather_description:
      "Mały pulpit pogodowy z serwerową proxy dla kluczy API i łagodnymi mechanizmami zapasowymi. Obsługuje motywy i lokalizację.",
    project_weather_long:
      "Używa funkcji Netlify jako proxy do OpenWeather, aby klucze API pozostały po stronie serwera. Interfejs użytkownika w razie potrzeby korzysta z bezpiecznego fallbacku i pokazuje ostrzeżenia. Wspiera lokalizację i motywy.",
    project_finance_title: "Analizator finansowy",
    project_finance_description:
      "Narzędzia do oszczędzania i inwestycji z wykresami prognoz i szacunkami podatkowymi dla wybranych krajów. Zbudowane z użyciem małych funkcji serverless.",
    project_finance_long:
      "Zawiera tracker wydatków, symulator oszczędności i analizator inwestycji, który pobiera dane historyczne i szacuje wzrost oraz podatki. Zaprojektowany z myślą o czytelności i szybkiej analizie scenariuszy.",
    // Przyjazne etykiety dla modułu finansowego
    finance_dashboard: "Finanse osobiste",
    add_transaction: "Zarejestruj transakcję",
    import_csv: "Importuj transakcje (CSV)",
    export_csv: "Eksportuj transakcje (CSV)",
    project_ui_title: "Interaktywne komponenty UI",
    project_ui_description:
      "Zestaw komponentów (InfoIcon, SkillPill, ProjectCard) zaprojektowanych pod kątem dostępności i małego rozmiaru pakietu.",
    project_ui_long:
      "Mała biblioteka wyspecjalizowanych komponentów: dostępne podpowiedzi, pigułki umiejętności przyjazne klawiaturze i kompozycyjne karty. Każdy komponent stawia na semantykę i minimalne style.",
    // Auth translations
    auth_choose_action: "Wybierz akcję",
    auth_action_login: "Zaloguj się",
    auth_action_register: "Zarejestruj się",
    auth_action_guest: "Wejdź jako gość",
    guest_label: "Gość",
    logged_in_as: "Zalogowany jako:",
    auth_label_name: "Imię",
    auth_label_email: "Email",
    auth_label_password: "Hasło",
    auth_back: "Wstecz",
    auth_confirm_password: "Potwierdź hasło",
    auth_admin_code_prompt: "Masz kod administratora?",
    auth_admin_code_label: "Kod administratora",
    greeting_user_prefix: "Cześć",
    greeting_guest: "Cześć gość",
    greeting_admin_prefix: "Cześć admin",
    logout: "Wyloguj",
    nav_admin: "Administracja",
    contact_title: "Kontakt i social media",
    admin_users_title: "Zarządzanie użytkownikami",
    admin_confirm_delete: "Czy na pewno chcesz usunąć tego użytkownika?",
    admin_cannot_delete_admin: "Nie można usunąć administratora",
    admin_delete: "Usuń",
    loading: "Ładowanie...",
  },
};

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
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
      void 0;
      return navigator.language?.startsWith("pl") ? "pl" : "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {
      void 0;
    }
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

// Note: do not default-export non-component values in files that also export
// components — keep only named exports to satisfy fast-refresh rules.
