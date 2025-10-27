import { Routes, Route } from "react-router-dom";
import Layout from "./components/LayoutFixed";
import Home from "./pages/Home";
import AuthPage from "./pages/Auth";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
// Portfolio / Projects pages removed from routes — showcased on Home instead
import Weather from "./pages/Weather";
import Finance from "./pages/Finance";
import AdminUsers from "./pages/AdminUsers";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route path="auth" element={<AuthPage />} />
        {/* Portfolio and Projects routes intentionally removed — featured on Home */}
        <Route path="weather" element={<Weather />} />
        <Route path="finance" element={<Finance />} />
        <Route
          path="admin"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AdminUsers />
              </RequireAdmin>
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
