/**
 * Design Tokens - Tribes Premium Light Mode
 * 
 * Single source of truth for all design constants.
 * Light mode only - no dark variants.
 */

// ═══════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════

/** App background - Apple-like gray */
export const APP_BG = "#F5F5F7";

/** Card/surface background - pure white */
export const CARD_BG = "#FFFFFF";

/** Primary ink color - near black */
export const INK = "#111111";

/** Subtle border color */
export const BORDER = "rgba(0,0,0,0.08)";

/** Strong border color */
export const BORDER_STRONG = "rgba(0,0,0,0.12)";

/** Muted text */
export const MUTED = "rgba(0,0,0,0.55)";

/** Secondary muted text */
export const MUTED_2 = "rgba(0,0,0,0.40)";

/** Shadow - card level */
export const SHADOW_CARD = "0 4px 20px rgba(0,0,0,0.06)";

/** Shadow - dropdown level */
export const SHADOW_DROPDOWN = "0 8px 30px rgba(0,0,0,0.12)";

// ═══════════════════════════════════════════════════════════════════════════
// RADII
// ═══════════════════════════════════════════════════════════════════════════

/** Card border radius */
export const RADIUS_CARD = 20;

/** Control border radius (buttons, inputs) */
export const RADIUS_CONTROL = 10;

/** Small control radius (pills, badges) */
export const RADIUS_SMALL = 8;

// ═══════════════════════════════════════════════════════════════════════════
// SIZING
// ═══════════════════════════════════════════════════════════════════════════

/** Standard control height (inputs, buttons) */
export const CONTROL_HEIGHT = 44;

/** Icon button size */
export const ICON_BUTTON_SIZE = 36;

/** Avatar size in header */
export const AVATAR_SIZE = 32;

/** Standard icon size */
export const ICON_SIZE = 18;

/** Icon stroke width - thin/premium */
export const ICON_STROKE = 1.5;

// ═══════════════════════════════════════════════════════════════════════════
// TAILWIND CLASS COMPOSITIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Icon button base classes - Apple-grade styling */
export const ICON_BUTTON_CLASSES = 
  "h-9 w-9 rounded-full inline-flex items-center justify-center transition-colors duration-150 " +
  "hover:bg-black/5 active:bg-black/8 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7]";

/** Avatar button classes */
export const AVATAR_BUTTON_CLASSES =
  "h-8 w-8 rounded-full shrink-0 inline-flex items-center justify-center " +
  "bg-neutral-100 text-[11px] font-medium text-neutral-600 " +
  "border border-neutral-200/60 transition-colors duration-150 " +
  "hover:bg-neutral-200/70 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7]";

/** Nav button classes - unselected */
export const NAV_BUTTON_CLASSES =
  "h-8 px-3 rounded-lg text-[13px] font-medium transition-colors duration-150 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15";

/** Nav button active state */
export const NAV_BUTTON_ACTIVE = "bg-neutral-100 text-neutral-900";

/** Nav button inactive state */
export const NAV_BUTTON_INACTIVE = "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50";
