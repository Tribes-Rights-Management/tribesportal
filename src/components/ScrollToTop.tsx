import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * SCROLL TO TOP ON NAVIGATION — TRIBES STANDARD (LOCKED)
 * 
 * Forces scroll position to reset to top on every route change.
 * Respects hash anchors (e.g., /page#section) for explicit anchor navigation.
 * 
 * Must be placed inside BrowserRouter.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // If there's a hash anchor, let browser handle it
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "instant" });
        return;
      }
    }

    // Otherwise, scroll to top immediately
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
