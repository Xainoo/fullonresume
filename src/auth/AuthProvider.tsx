/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

type User = { id: number; email?: string; role?: string; name?: string } | null;

type AuthContextValue = {
  user: User;
  token: string | null;
  setAuth: (token: string | null, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  setAuth: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("auth_token");
    } catch {
      void 0;
      return null;
    }
  });
  const [user, setUser] = useState<User>(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      void 0;
      return null;
    }
  });

  useEffect(() => {
    try {
      if (token) localStorage.setItem("auth_token", token);
      else localStorage.removeItem("auth_token");
    } catch {
      void 0;
    }
  }, [token]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem("auth_user", JSON.stringify(user));
      else localStorage.removeItem("auth_user");
    } catch {
      void 0;
    }
  }, [user]);

  const setAuth = (t: string | null, u: User) => {
    setToken(t);
    setUser(u);
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    } catch {
      void 0;
    }
    navigate("/auth");
  }, [navigate]);

  // include logout in deps to satisfy exhaustive-deps and keep value accurate
  const value = useMemo(
    () => ({ user, token, setAuth, logout }),
    [user, token, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
