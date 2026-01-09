/**
 * Global Theme Zone System
 * 
 * This system defines authoritative background colors and ensures
 * consistent dark/light transitions across the entire site.
 * 
 * NON-REGRESSION RULES:
 * - Dark zones use THEME_DARK_BG (#0B0E11) exclusively
 * - Light zones use THEME_LIGHT_BG (#FFFFFF) exclusively
 * - No arbitrary background colors in page components
 * - Theme transitions happen ONLY at explicit section boundaries
 */

/** Primary dark background - used for hero, marketing, and dark sections */
export const THEME_DARK_BG = "#0B0E11";

/** Primary light background - used for body pages and light sections */
export const THEME_LIGHT_BG = "#FFFFFF";

/** Tailwind class for dark theme zone background */
export const THEME_DARK_CLASS = "bg-[#0B0E11]";

/** Tailwind class for light theme zone background */
export const THEME_LIGHT_CLASS = "bg-white";

/** Overlay backdrop color with blur - institutional standard */
export const OVERLAY_BACKDROP = {
  color: "rgba(0, 0, 0, 0.40)",
  blur: "14px",
};

/** Motion timing - institutional standard (Apple-grade) */
export const MOTION_TIMING = {
  enter: 200, // 180-220ms enter
  exit: 160,  // 140-180ms exit
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
};

/** Footer spacer heights (responsive) */
export const FOOTER_SPACER = {
  mobile: 80,   // 64-96px
  desktop: 100, // 80-120px
};
