/**
 * TRIBES Brand System — Institutional Standards
 *
 * This file establishes locked rules for brand presentation.
 * These values are system-wide constants and should not be overridden.
 *
 * The TRIBES wordmark is treated as institutional signage:
 * - Always intentional, confident, and permanent
 * - Never incidental, decorative, or diminished
 */

export const BRAND = {
  /** Primary wordmark text */
  wordmark: "TRIBES",

  /** Primary slogan - LOCKED, do not modify */
  slogan: "Publishing administration, built for precision.",

  /** Full legal entity name */
  legalName: "Tribes Rights Management",

  /** Full legal entity with suffix */
  legalEntity: "Tribes Rights Management LLC",
} as const;

/**
 * Logo Sizing System — LOCKED BRAND CONSTRAINT
 */
export const LOGO_SIZES = {
  /** Absolute minimum — NEVER go below this */
  absoluteMin: 20,

  /** Header wordmark sizing */
  header: {
    desktop: {
      fontSize: 15,
      fontWeight: 500,
      letterSpacing: 0,
    },
    mobile: {
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: 0.5,
    },
  },

  /** Footer wordmark sizing */
  footer: {
    fontSize: 13,
    fontWeight: 400,
  },

  /** Auth screens (sign-in, request access) */
  auth: {
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: 1,
  },

  /** Portal UI header */
  portal: {
    fontSize: 14,
    fontWeight: 500,
  },

  /** Open Graph / social previews */
  og: {
    fontSize: 48,
    fontWeight: 700,
    letterSpacing: 2,
  },
} as const;

/**
 * Logo image assets (when using image-based logo)
 */
export const LOGO_IMAGES = {
  /** Absolute minimum height */
  absoluteMin: 20,

  header: {
    desktop: { height: 26, minHeight: 24 },
    mobile: { height: 24, minHeight: 22 },
  },
  footer: {
    height: 20,
    minHeight: 20,
  },
  auth: {
    height: 32,
    minHeight: 28,
  },
} as const;

/**
 * Navigation sizing standards
 */
export const NAV_SIZES = {
  /** Header heights — LOCKED */
  header: {
    desktop: 64,
    mobile: 64,
  },

  /** Header padding */
  headerPadding: {
    vertical: 16,
    horizontal: {
      mobile: 20,
      desktop: 48,
    },
  },

  /** Tap target minimums (accessibility) */
  tapTarget: {
    min: 44,
    comfortable: 48,
  },

  /** Spacing */
  padding: {
    mobile: 20,
    tablet: 32,
    desktop: 48,
  },
} as const;

/**
 * Animation & Interaction Standards — LOCKED
 */
export const MOTION = {
  /** Duration in milliseconds */
  duration: {
    instant: 100,
    fast: 120,
    normal: 150,
  },

  /** Easing functions — ease-out only */
  easing: {
    default: "ease-out",
    linear: "linear",
  },
} as const;

/**
 * Interaction States — INSTITUTIONAL RESTRAINT
 */
export const INTERACTION = {
  /** Hover opacity shift (10-12%) */
  hover: {
    opacityShift: 0.1,
    backgroundShift: 0.04,
  },

  /** Focus ring */
  focus: {
    width: 1,
    offset: 2,
    light: "rgba(0,0,0,0.4)",
    dark: "rgba(255,255,255,0.4)",
  },

  /** Disabled state */
  disabled: {
    opacity: 0.5,
  },

  /** Active/pressed state */
  active: {
    opacity: 0.85,
  },
} as const;

/**
 * Navigation Pattern Rules — LOCKED
 */
export const NAV_PATTERNS = {
  mobile: {
    position: "top" as const,
    menuTrigger: "hamburger" as const,
    menuPosition: "right" as const,
    menuType: "sheet" as const,
    bottomNav: false as const,
    tabBar: false as const,
  },

  desktop: {
    position: "top" as const,
    layout: "inline" as const,
  },
} as const;
