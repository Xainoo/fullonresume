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
    nav_portfolio: "Portfolio",
    nav_projects: "Projects",
    home_title: "Hi, I'm Krzysztof — Frontend Developer",
    home_lead:
      "I build clean, accessible, and performant web apps using modern React and TypeScript.",
    cta_work: "See my work",
    cta_projects: "Projects",
    skills: "Skills",
    featured_project: "Featured project",
    about: "About me",
    footer_cta: "Interested in a CV or a quick walkthrough? Let's connect.",
  },
  pl: {
    brand: "Krzysztof Przystaś",
    nav_home: "Strona główna",
    nav_portfolio: "Portfolio",
    nav_projects: "Projekty",
    home_title: "Cześć, jestem Krzysztof — Frontend Developer",
    home_lead:
      "Tworzę czytelne, dostępne i wydajne aplikacje webowe w nowoczesnym React i TypeScript.",
    cta_work: "Zobacz moje prace",
    cta_projects: "Projekty",
    skills: "Umiejętności",
    featured_project: "Projekt wyróżniony",
    about: "O mnie",
    footer_cta: "Zainteresowany CV lub krótkim przeglądem? Skontaktuj się.",
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
