import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * SCROLL RESET HOOK — CENTRALIZED ROUTE CHANGE HANDLER
 * 
 * Purpose: Ensure every route change resets scroll position to top.
 * 
 * Rules (from Navigation Enforcement Spec):
 * - Every route change must reset scroll to top of primary content container
 * - No page may inherit scroll position from previous route
 * - This is enforced centrally at router/layout level, not per-page
 * 
 * Design invariant:
 * "Every page load must feel intentional, anchored, and composed."
 */
export function useScrollReset(containerRef?: React.RefObject<HTMLElement>) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll on route change
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (containerRef?.current) {
        containerRef.current.scrollTop = 0;
      }
      // Fallback to window scroll
      window.scrollTo(0, 0);
    });
  }, [pathname, containerRef]);
}

/**
 * Scroll Reset Component — For use in layouts
 * 
 * Renders nothing, just handles scroll reset on route changes.
 * Include in layout components to ensure scroll reset.
 */
export function ScrollReset({ containerRef }: { containerRef?: React.RefObject<HTMLElement> }) {
  useScrollReset(containerRef);
  return null;
}
