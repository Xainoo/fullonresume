import { useTranslation } from "../i18n";
import { useAuth } from "../auth/AuthProvider";

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    // atob returns a binary string; try to decode safely
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(b64), function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  } catch {
    void 0;
    return null;
  }
}

export default function Greeting() {
  const { t } = useTranslation();

  const { user: ctxUser } = useAuth();
  let user: { role?: string; name?: string; email?: string } | null =
    (ctxUser as { role?: string; name?: string; email?: string } | null) ??
    null;
  // fallback: try decode token if context empty
  if (!user) {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const payload = decodeJwtPayload(token);
        if (payload) user = payload;
      }
    } catch {
      void 0;
    }
  }

  if (!user) return null;

  const role = user.role || "user";
  const name =
    user.name || (user.email ? String(user.email).split("@")[0] : "");

  if (role === "guest")
    return <div className="greeting-bubble">{t("greeting_guest")}</div>;
  if (role === "admin")
    return (
      <div className="greeting-bubble">
        {t("greeting_admin_prefix")}
        {name ? ` ${name}` : ""}
      </div>
    );
  return (
    <div className="greeting-bubble">
      {t("greeting_user_prefix")}
      {name ? ` ${name}` : ""}
    </div>
  );
}
