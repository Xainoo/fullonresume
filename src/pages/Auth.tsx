import React, { useState } from "react";
import { useTranslation } from "../i18n";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

function useAuthFetch() {
  const login = async (email: string, password: string) => {
    const res = await fetch("/.netlify/functions/auth?op=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  };
  const register = async (
    email: string,
    password: string,
    secretCode?: string,
    name?: string
  ) => {
    const res = await fetch("/.netlify/functions/auth?op=register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, secretCode, name }),
    });
    return res.json();
  };
  const guest = async () => {
    const res = await fetch("/.netlify/functions/auth?op=guest", {
      method: "POST",
    });
    return res.json();
  };
  return { login, register, guest };
}

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"choice" | "login" | "register">("choice");
  const [showAdminField, setShowAdminField] = useState(false);
  const { login, register, guest } = useAuthFetch();
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await login(email, password);
    if (r.token) {
      // update context (also persists to localStorage via provider)
      try {
        setAuth(r.token, r.user || null);
      } catch {
        void 0;
      }
      setMessage("Logged in");
      navigate("/");
    } else {
      setMessage(r.error || "Login failed");
    }
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation to give immediate feedback
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const normalized = String(email).trim().toLowerCase();
    if (!emailRe.test(normalized)) {
      setMessage("Invalid email format");
      return;
    }
    if (!pwdRe.test(String(password))) {
      setMessage(
        "Password must be at least 8 characters and include lower, upper and number"
      );
      return;
    }
    if (!name || String(name).trim().length < 2) {
      setMessage("Name is required (min 2 characters)");
      return;
    }
    if (String(password) !== String(confirmPassword)) {
      setMessage("Passwords do not match");
      return;
    }
    const r = await register(
      normalized,
      password,
      showAdminField ? secretCode || undefined : undefined,
      name.trim()
    );
    if (r.token) {
      try {
        setAuth(r.token, r.user || null);
      } catch {
        void 0;
      }
      setMessage("Registered and logged in");
      navigate("/");
    } else {
      setMessage(r.error || "Register failed");
    }
  };

  const doGuest = async () => {
    const r = await guest();
    if (r.token) {
      try {
        setAuth(r.token, r.user || null);
      } catch {
        void 0;
      }
      setMessage("Entered as guest");
      navigate("/");
    } else setMessage(r.error || "Guest login failed");
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-3">
            <h3>{t("auth_choose_action")}</h3>
            {message && <div className="alert alert-info">{message}</div>}

            {mode === "choice" && (
              <div className="mb-3">
                <h5>{t("auth_choose_action")}</h5>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => setMode("login")}
                  >
                    {t("auth_action_login")}
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => setMode("register")}
                  >
                    {t("auth_action_register")}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={doGuest}
                  >
                    {t("auth_action_guest")}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <form onSubmit={doLogin}>
                <div className="mb-2">
                  <label className="form-label">{t("auth_label_email")}</label>
                  <input
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">
                    {t("auth_label_password")}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary" type="submit">
                    {t("auth_action_login")}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setMode("choice")}
                    type="button"
                  >
                    {t("auth_back")}
                  </button>
                </div>
              </form>
            )}

            <hr />

            {mode === "register" && (
              <form onSubmit={doRegister}>
                <h5>{t("auth_action_register")}</h5>
                <div className="mb-2">
                  <label className="form-label">{t("auth_label_name")}</label>
                  <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">{t("auth_label_email")}</label>
                  <input
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">
                    {t("auth_label_password")}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">
                    {t("auth_confirm_password")}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  {/* secret/admin code is hidden behind a reveal toggle */}
                  {!showAdminField && (
                    <div>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0"
                        onClick={() => setShowAdminField(true)}
                      >
                        {t("auth_admin_code_prompt")}
                      </button>
                    </div>
                  )}
                  {showAdminField && (
                    <>
                      <label className="form-label">
                        {t("auth_admin_code_label")}
                      </label>
                      <input
                        className="form-control"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                      />
                    </>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-success" type="submit">
                    {t("auth_action_register")}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setMode("choice")}
                  >
                    {t("auth_back")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
