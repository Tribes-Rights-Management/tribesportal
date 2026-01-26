import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import App from "./App.tsx";
import "./index.css";

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLERS — CATCH CRASHES BEFORE REACT MOUNTS
// ═══════════════════════════════════════════════════════════════════════════

const bootDebug = document.getElementById("boot-debug");

function updateBootDebug(message: string, isError = false) {
  if (bootDebug) {
    bootDebug.textContent = message;
    if (isError) {
      bootDebug.style.background = "rgba(220, 38, 38, 0.9)";
    }
  }
}

// Catch synchronous errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error("[Global Error Handler]", { message, source, lineno, colno, error });
  updateBootDebug(`Fatal error: ${message}`, true);
  return false; // Let browser handle it too
};

// Catch async/promise rejections
window.onunhandledrejection = (event) => {
  console.error("[Unhandled Rejection]", event.reason);
  updateBootDebug(`Promise error: ${event.reason?.message || event.reason}`, true);
};

// ═══════════════════════════════════════════════════════════════════════════

// Apply default density on boot (will be overridden by AppUiBoot after auth)
// This prevents a flash of unstyled content
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

// React successfully mounted
setTimeout(() => {
  updateBootDebug("React mounted");
  // Hide debug overlay after 2 seconds if no errors
  setTimeout(() => {
    if (bootDebug && !bootDebug.textContent?.includes("error")) {
      bootDebug.style.display = "none";
    }
  }, 2000);
}, 100);
