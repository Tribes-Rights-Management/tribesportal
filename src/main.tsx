import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import App from "./App.tsx";
import "./index.css";

// Apply default density on boot (will be overridden by AppUiBoot after auth)
document.documentElement.dataset.uiDensity = "comfortable";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);
