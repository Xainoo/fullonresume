import {
  Outlet,
  NavLink,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import Greeting from "./Greeting";
import { useTranslation } from "../i18n";
import { useAuth } from "../auth/AuthProvider";

export default function LayoutFixed(): ReactElement {
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
        return "dark";
      return "light";
    } catch {
      return "light";
    }
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout, user: authUser } = useAuth();

  // apply persisted theme on mount / when theme changes
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => setNavOpen(false), [location.pathname]);

  const role = (authUser as { role?: string } | null)?.role ?? null;

  function NavBrand() {
    const { t } = useTranslation();
    return (
      <div className="brand-block d-flex align-items-center gap-2">
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          to="/"
          aria-label={t("brand")}
        >
          <span className="brand-avatar" aria-hidden>
            KP
          </span>
          <span className="brand-text">{t("brand")}</span>
        </Link>
      </div>
    );
  }

  function ContactLinks() {
    return (
      <div className="contact-links">
        <div className="small">📞 +48 695 795 268</div>
        <div className="small">✉️ krzysztof.przystas@gmail.com</div>
        <div className="d-flex gap-2 mt-2">
          <a
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2"
            href="https://github.com/Xainoo"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.1 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2.01-.27c.68 0 1.36.09 2.01.27 1.53-1.04 2.2-.82 2.2-.82.44 1.09.16 1.9.08 2.1.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="d-none d-md-inline">GitHub</span>
          </a>
          <a
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2"
            href="https://instagram.com/_pprst_krzychu"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM18.5 6a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" />
            </svg>
            <span className="d-none d-md-inline">IG</span>
          </a>
        </div>
      </div>
    );
  }

  function ContactButton() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      function onDocClick(e: MouseEvent) {
        if (!open) return;
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      }
      function onKey(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
      }
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("click", onDocClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);

    return (
      <div
        ref={ref}
        className="d-flex align-items-center ms-2 position-relative"
      >
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary contact-btn d-none d-md-inline-flex"
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-controls="brand-contact-dropdown"
          title={t("contact_title")}
        >
          <span aria-hidden>📫</span>
          <span className="ms-2">Contact & Socials</span>
        </button>
        {open && (
          <div
            id="brand-contact-dropdown"
            className={`brand-contact-dropdown card shadow-sm p-2 ${
              open ? "brand-contact--open" : "brand-contact--closed"
            }`}
          >
            <ContactLinks />
          </div>
        )}
      </div>
    );
  }

  function NavCenter() {
    const { t } = useTranslation();
    return (
      <div
        id="main-navbar"
        className={`navbar-collapse collapse ${navOpen ? "show" : ""}`}
      >
        <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <NavLink className="nav-link" to="/" end>
              {t("nav_home")}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/finance">
              {t("nav_finance")}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/weather">
              {t("nav_weather")}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/image-analyzer">
              {t("nav_image_analyzer")}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/chat">
              {t("nav_chat")}
            </NavLink>
          </li>
          <li className="nav-item d-lg-none">
            <div className="p-2">
              <ContactLinks />
            </div>
          </li>
          {role === "admin" && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin">
                {t("nav_admin")}
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    );
  }

  function NavControls() {
    const { t, setLang } = useTranslation();
    return (
      <div className="navbar-end d-flex align-items-center gap-3 ms-auto">
        <div className="me-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            aria-pressed={theme === "dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            🌓
          </button>
        </div>
        {token && (
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              try {
                logout();
              } catch {
                navigate("/auth");
              }
            }}
          >
            {t("logout")}
          </button>
        )}
        <div className="lang-wrap">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary me-1"
            onClick={() => setLang("en")}
            aria-pressed={false}
          >
            EN
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setLang("pl")}
            aria-pressed={false}
          >
            PL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <a href="#main-content" className="visually-hidden-focusable skip-link">
        Skip to content
      </a>
      <nav className="navbar navbar-expand-lg app-navbar">
        <div className="container-fluid d-flex align-items-center">
          <NavBrand />
          <ContactButton />
          <button
            className="navbar-toggler btn btn-sm btn-outline-secondary"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
            aria-controls="main-navbar"
            onClick={() => setNavOpen((s) => !s)}
          >
            ☰
          </button>
          <div className="navbar-collapse-wrapper d-flex align-items-center">
            <NavCenter />
            <div className="navbar-center d-none d-lg-flex align-items-center">
              <Greeting />
            </div>
            <NavControls />
          </div>
        </div>
      </nav>

      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
