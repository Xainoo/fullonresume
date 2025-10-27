import { useEffect, useState } from "react";
import { useTranslation } from "../i18n";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";
import PageHeader from "../components/PageHeader";

type User = {
  id: number;
  email?: string;
  role?: string;
  name?: string;
  created_at?: number;
};

export default function AdminUsers() {
  const { t } = useTranslation();
  const { token, user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/.netlify/functions/auth?op=list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to load users");
      setUsers(j.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // perform the actual delete (no confirmation here)
  const doDelete = async (id: number) => {
    const isSelf = currentUser?.id === id;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/.netlify/functions/auth?op=delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Delete failed");
      // if the current admin deleted themselves, log out and go to auth
      if (isSelf) {
        try {
          logout();
        } catch {
          try {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
          } catch {
            void 0;
          }
        }
        navigate("/auth");
        return;
      }
      // refresh list
      await fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  function askDelete(id: number) {
    setConfirmTarget(id);
    setConfirmOpen(true);
  }

  function onConfirmDelete() {
    if (confirmTarget != null) {
      setConfirmOpen(false);
      const id = confirmTarget;
      setConfirmTarget(null);
      void doDelete(id);
    }
  }

  function onCancelDelete() {
    setConfirmOpen(false);
    setConfirmTarget(null);
  }

  return (
    <div className="container py-4 admin-users">
      <PageHeader
        title={t("admin_users_title") || "Users"}
        actions={loading ? <Spinner /> : null}
      />
      {error && (
        <div className="alert alert-danger" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      {loading && (
        <div className="alert alert-info" role="status" aria-live="polite">
          {t("loading") || "Loading..."}
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t("auth_label_email")}</th>
              <th>{t("auth_label_name")}</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="text-center empty-state py-3">
                  {t("admin_users_empty") || "No users to display"}
                </td>
              </tr>
            )}
            {users.map((u) => {
              const currentUserId = currentUser?.id ?? null;
              const adminCount = users.filter((x) => x.role === "admin").length;
              const isOtherAdmin = u.role === "admin" && u.id !== currentUserId;
              const isOnlyAdminSelf =
                u.role === "admin" &&
                u.id === currentUserId &&
                adminCount === 1;

              return (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => askDelete(u.id)}
                      disabled={isOtherAdmin || isOnlyAdminSelf || loading}
                      title={
                        isOtherAdmin
                          ? t("admin_cannot_delete_admin") ||
                            "Cannot delete other admin"
                          : isOnlyAdminSelf
                          ? t("admin_cannot_delete_last_self") ||
                            "Cannot delete the last admin"
                          : t("admin_delete")
                      }
                    >
                      {t("admin_delete")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title={t("admin_confirm_title") || "Confirm delete"}
        message={
          confirmTarget
            ? users.find((x) => x.id === confirmTarget)?.email ||
              "Confirm delete"
            : undefined
        }
        confirmLabel={t("admin_delete")}
        cancelLabel={t("cancel") || "Cancel"}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </div>
  );
}
