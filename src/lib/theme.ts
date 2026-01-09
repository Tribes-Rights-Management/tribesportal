/**
 * Global Theme Zone System
 * 
 * This system defines authoritative background colors and ensures
 * consistent dark/light transitions across the entire site.
 * 
 * NON-REGRESSION RULES:
 * - Dark zones use THEME_DARK_BG (#0B0F14) exclusively
 * - Light zones use THEME_LIGHT_BG (#F5F5F7) exclusively
 * - No arbitrary background colors in page components
 * - Theme transitions happen ONLY at explicit section boundaries
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * FORM ZONE SYSTEM (LOCKED)
 * 
 * All intake and transactional pages use THEME_LIGHT_BG (neutral gray #F5F5F7)
 * with white input fields (bg-white). This creates clear affordance and
 * distinguishes form pages from marketing content.
 * 
 * FORM PAGES (gray background + white inputs):
 * - Contact (/contact)
 * - Licensing Account (/licensing-account)
 * - Service Inquiry (/services/inquiry)
 * - Auth/Login (/auth)
 * 
 * MARKETING PAGES (white or dark backgrounds only):
 * - All explanatory and promotional content
 * - Legal pages (Privacy, Terms)
 * - Services overview
 * 
 * DO NOT mix white background + white inputs (low affordance).
 * DO NOT use multiple grays across different forms.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/** Primary dark background - used for hero, marketing, and dark sections */
export const THEME_DARK_BG = "#0B0F14";

/** Primary light background - used for form pages, body pages, and light sections */
export const THEME_LIGHT_BG = "#F5F5F7";

/** Section padding - consistent vertical rhythm */
export const SECTION_PADDING = {
  mobile: "py-16 md:py-24",
  desktop: "py-24 md:py-32",
};

/** Tailwind class for dark theme zone background */
export const THEME_DARK_CLASS = "bg-[#0B0F14]";

/** Tailwind class for light theme zone background (form zone) */
export const THEME_LIGHT_CLASS = "bg-[#F5F5F7]";

/** Overlay backdrop - institutional standard (light glass, Apple-grade) */
export const OVERLAY_BACKDROP = {
  color: "rgba(0, 0, 0, 0.12)",
  blur: "3px",
};

/** Motion timing - institutional standard (firm, restrained) */
export const MOTION_TIMING = {
  enter: 180, // Fast, restrained
  exit: 140,  // Slightly faster than enter
  easing: "cubic-bezier(0.25, 0.1, 0.25, 1)", // Standard ease-out, no spring
};

/** Footer spacer heights (responsive) */
export const FOOTER_SPACER = {
  mobile: 80,   // 64-96px
  desktop: 100, // 80-120px
};

/** Header height CSS variable name */
export const HEADER_HEIGHT_VAR = "--header-h";
