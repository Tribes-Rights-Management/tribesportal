import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import App from "./App.tsx";
import "./index.css";

// Apply persisted density preference on boot (before render)
const storedDensity = localStorage.getItem("tribes:density");
const density = storedDensity === "compact" ? "compact" : "comfortable";
document.documentElement.dataset.density = density;

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
