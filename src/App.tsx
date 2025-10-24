import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
// Portfolio / Projects pages removed from routes — showcased on Home instead
import Weather from "./pages/Weather";
import Finance from "./pages/Finance";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* Portfolio and Projects routes intentionally removed — featured on Home */}
          <Route path="weather" element={<Weather />} />
          <Route path="finance" element={<Finance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
