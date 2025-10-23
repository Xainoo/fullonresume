import { Outlet, NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "../i18n";

/**
 * ThemeToggle
 * - Displays a small button in the navbar that toggles between 'light' and 'dark'.
 * - Persists the selection to localStorage and sets `data-theme` on <html> so
 *   CSS variables can react to the current theme.
 * - Accessible: uses aria-pressed and aria-label.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => {
    try {
      // Prefer explicit user choice; fall back to system preference.
      return (
        localStorage.getItem("theme") ||
        (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light")
      );
    } catch {
      // If localStorage is unavailable, default to light.
      return "light";
    }
  });

  // Apply the chosen theme to the document root and persist the choice.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore write errors (e.g., privacy mode) */
    }
  }, [theme]);

  return (
    <button
      className="btn btn-sm btn-outline-secondary"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-pressed={theme === "dark"}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      {/* Emoji used as concise visual indicator; assistive tech reads aria-label. */}
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}

/**
 * Language toggle: small flag button that switches between English and Polish.
 * - Uses the i18n provider's setLang and reflects the current language.
 */
function LanguageToggle() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="btn-group" role="group" aria-label="Language selector">
      <button
        className={`btn btn-sm ${
          lang === "en" ? "btn-primary" : "btn-outline-secondary"
        }`}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        title="English"
      >
        🇬🇧
      </button>
      <button
        className={`btn btn-sm ${
          lang === "pl" ? "btn-primary" : "btn-outline-secondary"
        }`}
        onClick={() => setLang("pl")}
        aria-pressed={lang === "pl"}
        title="Polski"
      >
        🇵🇱
      </button>
    </div>
  );
}

/**
 * Layout
 * - Application wrapper including the top navigation bar and routing outlet.
 * - Keeps structure minimal: brand, theme-toggle, and route links.
 */
export default function Layout() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Use a neutral class 'app-navbar' so we can control colors via CSS variables */}
      <nav className="navbar navbar-expand-lg app-navbar">
        <div className="container-fluid">
          {/* Brand / home link with compact avatar + text */}
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <span className="brand-avatar" aria-hidden="true">
              KP
            </span>
            <span className="brand-text">{t("brand")}</span>
          </Link>

          {/* Small controls area (theme toggle and language selector) */}
          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>

          {/* Primary navigation links (collapsible for smaller screens) */}
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end>
                  {t("nav_home")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/portfolio">
                  {t("nav_portfolio")}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/projects">
                  {t("nav_projects")}
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Outlet renders the matched route's component inside the main layout. */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
