import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

type Props = { children: ReactNode };

export default function RequireAuth({ children }: Props) {
  const location = useLocation();
  const { token } = useAuth();

  if (!token) {
    // Redirect to /auth, preserve the attempted location in state so UI can redirect back after login if desired.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
