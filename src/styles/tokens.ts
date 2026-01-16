/**
 * INSTITUTIONAL DESIGN TOKENS — TRIBES PLATFORM
 * 
 * AUTHORITATIVE. These tokens supersede prior UI conventions.
 * 
 * This is infrastructure, not a growth product.
 * Design benchmark: financial registries, custodial systems, audit surfaces.
 */

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT COLORS
// ═══════════════════════════════════════════════════════════════════════════

/** Auth environment - dark, institutional */
export const AUTH_BG = "#0A0A0A";

/** Auth panel - off-white, warm */
export const AUTH_PANEL_BG = "#FAFAF8";

/** App environment - light gray canvas */
export const APP_BG = "#F5F5F7";

/** Card/surface background - pure white */
export const CARD_BG = "#FFFFFF";

/** Table surface - slightly warm white */
export const TABLE_BG = "#FEFEFE";

// ═══════════════════════════════════════════════════════════════════════════
// INK COLORS (TEXT)
// ═══════════════════════════════════════════════════════════════════════════

/** Primary ink - near black, high authority */
export const INK = "#111111";

/** Secondary ink - neutral gray, readable */
export const INK_SECONDARY = "#6B6B6B";

/** Tertiary ink - muted, labels */
export const INK_MUTED = "#8A8A8A";

/** Quaternary ink - de-emphasized, meta */
export const INK_FAINT = "#9CA3AF";

/** Disabled text */
export const INK_DISABLED = "#BCBCBC";

// ═══════════════════════════════════════════════════════════════════════════
// BORDER COLORS
// ═══════════════════════════════════════════════════════════════════════════

/** Default border - subtle */
export const BORDER = "#E5E5E5";

/** Strong border - more definition */
export const BORDER_STRONG = "#D4D4D4";

/** Input border - slightly darker for clarity */
export const BORDER_INPUT = "#C4C4C4";

/** Auth panel border - understated, darker than SaaS */
export const BORDER_AUTH = "#2A2A2A";

/** Table border - minimal */
export const BORDER_TABLE = "#ECECEC";

// ═══════════════════════════════════════════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════════════════════════════════════════

/** Auth panel shadow - nearly imperceptible */
export const SHADOW_AUTH = "0 1px 2px rgba(0,0,0,0.2)";

/** Card shadow - subtle elevation */
export const SHADOW_CARD = "0 1px 3px rgba(0,0,0,0.04)";

/** Dropdown shadow - more definition */
export const SHADOW_DROPDOWN = "0 4px 12px rgba(0,0,0,0.08)";

// ═══════════════════════════════════════════════════════════════════════════
// RADII — RESTRAINED, NOT BUBBLY
// ═══════════════════════════════════════════════════════════════════════════

/** Auth panel radius */
export const RADIUS_AUTH = 12;

/** Card radius - institutional */
export const RADIUS_CARD = 8;

/** Control radius (buttons, inputs) */
export const RADIUS_CONTROL = 8;

/** Small control radius (pills, badges) */
export const RADIUS_SMALL = 6;

/** Table row radius */
export const RADIUS_TABLE = 4;

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY — LOCKED, INSTITUTIONAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * HEADING SCALE (Auth/System Titles)
 * - Weight: medium → semibold (never bold-heavy)
 * - Tight line-height
 * - Calm, declarative tone
 */
export const TYPE_HEADING = {
  size: 20,
  weight: 500,
  lineHeight: 1.3,
  tracking: -0.01,
} as const;

/**
 * BODY/SUPPORTING TEXT
 * - Slightly smaller than SaaS defaults
 * - High legibility
 * - Neutral gray
 */
export const TYPE_BODY = {
  size: 14,
  weight: 400,
  lineHeight: 1.5,
  color: INK_SECONDARY,
} as const;

/**
 * LABELS — Administrative, not helper-language
 * Examples: "Email address", not "Your email"
 */
export const TYPE_LABEL = {
  size: 12,
  weight: 500,
  lineHeight: 1.4,
  tracking: 0.02,
  color: INK_SECONDARY,
} as const;

/**
 * META/POLICY TEXT
 * - Smallest tier
 * - De-emphasized
 */
export const TYPE_META = {
  size: 12,
  weight: 400,
  lineHeight: 1.5,
  color: INK_FAINT,
} as const;

/**
 * SYSTEM IDENTIFIER
 * - Uppercase, tracked
 * - Subtle authority marker
 */
export const TYPE_SYSTEM = {
  size: 11,
  weight: 500,
  lineHeight: 1,
  tracking: 0.12,
  color: INK_MUTED,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT SIZING — INSTITUTIONAL DENSITY
// ═══════════════════════════════════════════════════════════════════════════

/** Primary button height - slightly taller, authoritative */
export const BUTTON_HEIGHT = 48;

/** Input height - disciplined, not roomy */
export const INPUT_HEIGHT = 44;

/** Table row height - dense but readable */
export const TABLE_ROW_HEIGHT = 44;

/** Icon button size */
export const ICON_BUTTON_SIZE = 36;

/** Standard icon size */
export const ICON_SIZE = 18;

/** Icon stroke width */
export const ICON_STROKE = 1.5;

// ═══════════════════════════════════════════════════════════════════════════
// SPACING — INSTITUTIONAL DENSITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SPACING SCALE
 * - Larger gaps between sections
 * - Tighter spacing within related elements
 * - Nothing "airy for delight"
 */
export const SPACE = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
} as const;

/** Auth panel padding */
export const AUTH_PADDING = 40;

/** Card padding - standard */
export const CARD_PADDING = 24;

/** Table cell padding */
export const TABLE_CELL_PADDING = {
  x: 16,
  y: 12,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ERROR MESSAGING — INSTITUTIONAL LANGUAGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ERROR COPY RULES:
 * - Calm, factual, non-emotional
 * - Non-apologetic
 * - System responses, not conversations
 * 
 * ❌ "Oops! Something went wrong."
 * ✅ "Authentication failed."
 * 
 * ❌ "We couldn't find your account."
 * ✅ "No authorized account was found for this email address."
 * 
 * ❌ "Try again later."
 * ✅ "Please verify the email address or request a new sign-in link."
 */
export const ERROR_MESSAGES = {
  AUTH_FAILED: "Authentication failed.",
  NO_ACCOUNT: "No authorized account was found for this email address.",
  LINK_EXPIRED: "This sign-in link has expired.",
  LINK_INVALID: "This sign-in link is invalid or has already been used.",
  NETWORK_ERROR: "Unable to connect. Please check your connection.",
  RATE_LIMITED: "Too many requests. Please wait before trying again.",
  ACCESS_DENIED: "Access denied.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  GENERIC: "An error occurred. Please try again.",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TAILWIND CLASS COMPOSITIONS — INSTITUTIONAL
// ═══════════════════════════════════════════════════════════════════════════

/** Primary button - solid black, authoritative */
export const PRIMARY_BUTTON_CLASSES =
  "w-full h-12 rounded-lg inline-flex items-center justify-center px-8 " +
  "text-[15px] font-medium tracking-[-0.01em] " +
  "bg-[#111] text-white " +
  "disabled:bg-[#D4D4D4] disabled:text-[#8A8A8A] disabled:cursor-not-allowed " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/30 focus-visible:ring-offset-2";

/** Secondary button - outline, de-emphasized */
export const SECONDARY_BUTTON_CLASSES =
  "w-full h-10 rounded-lg inline-flex items-center justify-center px-6 " +
  "text-[14px] font-medium " +
  "bg-transparent border border-[#D4D4D4] text-[#6B6B6B] " +
  "hover:border-[#999] hover:text-[#111] " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/20 focus-visible:ring-offset-2";

/** Icon button - subtle, institutional */
export const ICON_BUTTON_CLASSES =
  "h-9 w-9 rounded-lg inline-flex items-center justify-center " +
  "hover:bg-black/5 active:bg-black/8 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2";

/** Input field - administrative clarity */
export const INPUT_CLASSES =
  "w-full h-11 rounded-lg border border-[#C4C4C4] bg-white " +
  "px-4 text-[15px] text-[#111] placeholder:text-[#9CA3AF] " +
  "focus:outline-none focus:border-[#888]";

/** Avatar button classes - institutional */
export const AVATAR_BUTTON_CLASSES =
  "h-8 w-8 rounded-full shrink-0 inline-flex items-center justify-center " +
  "bg-neutral-100 text-[11px] font-medium text-neutral-600 " +
  "border border-neutral-200/60 " +
  "hover:bg-neutral-200/70 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7]";

/** Nav button base classes */
export const NAV_BUTTON_CLASSES =
  "h-8 px-3 rounded-lg text-[13px] font-medium " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15";

/** Nav button active state */
export const NAV_BUTTON_ACTIVE = "bg-neutral-100 text-neutral-900";

/** Nav button inactive state */
export const NAV_BUTTON_INACTIVE = "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50";

/** Table header cell */
export const TABLE_HEADER_CLASSES =
  "px-4 py-3 text-left text-[12px] font-medium tracking-[0.02em] text-[#6B6B6B] uppercase";

/** Table body cell */
export const TABLE_CELL_CLASSES =
  "px-4 py-3 text-[14px] text-[#111]";

/** Table row - minimal hover */
export const TABLE_ROW_CLASSES =
  "border-b border-[#ECECEC] hover:bg-[#FAFAFA]";

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION LABELS — FUNCTIONAL, NOT ASPIRATIONAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * NAV COPY RULES:
 * - Communicate context, not excitement
 * - Functional labels, not marketing
 * 
 * ✅ "Catalog", "Licensing", "Reports", "Administration"
 * ❌ "Explore", "Discover", "Get insights"
 */

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION LABELS — SERIOUS, CONTROLLED
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PERMISSION COPY RULES:
 * - Explicit, deliberate language
 * - Changes should feel logged
 * 
 * ✅ "Read", "Edit", "Approve", "Restricted"
 * ❌ Casual toggles
 */
export const PERMISSION_LABELS = {
  READ: "Read",
  EDIT: "Edit",
  APPROVE: "Approve",
  ADMIN: "Administer",
  RESTRICTED: "Restricted",
  NONE: "No Access",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT/ACTION LABELS — OFFICIAL, NOT CELEBRATORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EXPORT COPY RULES:
 * - No celebratory language
 * - No confetti states
 * 
 * ✅ "Export generated", "File available for download", "Report prepared"
 * ❌ "Success!", "Done!", "Your export is ready!"
 */
export const ACTION_MESSAGES = {
  EXPORT_READY: "Export generated",
  FILE_AVAILABLE: "File available for download",
  REPORT_PREPARED: "Report prepared",
  CHANGES_SAVED: "Changes saved",
  RECORD_CREATED: "Record created",
  RECORD_UPDATED: "Record updated",
  RECORD_DELETED: "Record removed",
} as const;
