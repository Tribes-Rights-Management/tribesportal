/**
 * INSTITUTIONAL DESIGN TOKENS — TRIBES PLATFORM
 * 
 * AUTHORITATIVE. These tokens supersede prior UI conventions.
 * This is infrastructure, not a growth product.
 * Design benchmark: financial registries, custodial systems, audit surfaces.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUTH ENVIRONMENT — LOCKED, IMMUTABLE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AUTH TYPOGRAPHY + SPACING TOKENS (CANONICAL)
 * 
 * These are protected system tokens. Any deviation is a regression.
 * The auth surface is not a marketing canvas. It is a controlled system entry point.
 */

/** Auth environment - near-black, continuous with marketing site */
export const AUTH_BG = "#0A0A0B";

/** Auth max content width - NO card, typography-driven */
export const AUTH_MAX_WIDTH = 380;

/** Auth system identifier */
export const AUTH_SYSTEM_ID = {
  text: "TRIBES RIGHTS MANAGEMENT SYSTEM",
  size: 10,
  weight: 500,
  tracking: 0.2, // em
  color: "#4A4A4A",
  marginBottom: 40, // px
} as const;

/** Auth heading - restrained, declarative */
export const AUTH_HEADING = {
  size: 24,
  weight: 500,
  lineHeight: 1.2,
  tracking: -0.02, // em
  color: "#E5E5E3",
} as const;

/** Auth body text - procedural, neutral */
export const AUTH_BODY = {
  size: 14,
  weight: 400,
  lineHeight: 1.6,
  color: "#707070",
  marginTop: 16, // px
} as const;

/** Auth input - dark, administrative */
export const AUTH_INPUT = {
  height: 52,
  radius: 6,
  bgColor: "#141416",
  borderColor: "#2A2A2A",
  borderColorFocus: "#3A3A3A",
  textColor: "#E5E5E3",
  placeholderColor: "#505050",
  placeholder: "you@organization.com",
} as const;

/** Auth primary button - authoritative, not friendly */
export const AUTH_BUTTON = {
  height: 52,
  radius: 6,
  bgEnabled: "#E5E5E3",
  bgDisabled: "#1A1A1C",
  textEnabled: "#0A0A0B",
  textDisabled: "#4A4A4A",
} as const;

/** Auth policy text - firm, procedural */
export const AUTH_POLICY = {
  size: 12,
  weight: 400,
  lineHeight: 1.5,
  color: "#4A4A4A",
  marginTop: 48, // px
  text: "Access is restricted to approved accounts.",
} as const;

/** Auth secondary link - minimal emphasis */
export const AUTH_SECONDARY_LINK = {
  size: 12,
  color: "#4A4A4A",
  colorHover: "#606060",
} as const;

/** Auth spacing - conservative, institutional */
export const AUTH_SPACING = {
  sectionGap: 40, // px - between major sections
  elementGap: 24, // px - between related elements
  inputGap: 16, // px - between inputs
  buttonGap: 12, // px - between buttons
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM STATE ENVIRONMENT — ERROR/BOUNDARY PAGES
// ═══════════════════════════════════════════════════════════════════════════

/** System state pages use same dark environment as auth */
export const SYSTEM_STATE_BG = AUTH_BG;

/** System state heading */
export const SYSTEM_STATE_HEADING = {
  size: 22,
  weight: 500,
  lineHeight: 1.25,
  tracking: -0.02,
  color: "#E5E5E3",
} as const;

/** System state body */
export const SYSTEM_STATE_BODY = {
  size: 14,
  weight: 400,
  lineHeight: 1.6,
  color: "#707070",
} as const;

/** System state meta (email, status) */
export const SYSTEM_STATE_META = {
  size: 13,
  weight: 400,
  lineHeight: 1.5,
  color: "#505050",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// APP ENVIRONMENT COLORS
// ═══════════════════════════════════════════════════════════════════════════

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

/** Table border - minimal */
export const BORDER_TABLE = "#ECECEC";

// ═══════════════════════════════════════════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════════════════════════════════════════

/** Card shadow - subtle elevation */
export const SHADOW_CARD = "0 1px 3px rgba(0,0,0,0.04)";

/** Dropdown shadow - more definition */
export const SHADOW_DROPDOWN = "0 4px 12px rgba(0,0,0,0.08)";

// ═══════════════════════════════════════════════════════════════════════════
// RADII — RESTRAINED, NOT BUBBLY
// ═══════════════════════════════════════════════════════════════════════════

/** Card radius - institutional */
export const RADIUS_CARD = 8;

/** Control radius (buttons, inputs) */
export const RADIUS_CONTROL = 6;

/** Small control radius (pills, badges) */
export const RADIUS_SMALL = 4;

/** Table row radius */
export const RADIUS_TABLE = 4;

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY — PLATFORM (NON-AUTH)
// ═══════════════════════════════════════════════════════════════════════════

/** Platform heading */
export const TYPE_HEADING = {
  size: 20,
  weight: 500,
  lineHeight: 1.3,
  tracking: -0.01,
} as const;

/** Platform body */
export const TYPE_BODY = {
  size: 14,
  weight: 400,
  lineHeight: 1.5,
  color: INK_SECONDARY,
} as const;

/** Platform labels */
export const TYPE_LABEL = {
  size: 12,
  weight: 500,
  lineHeight: 1.4,
  tracking: 0.02,
  color: INK_SECONDARY,
} as const;

/** Platform meta text */
export const TYPE_META = {
  size: 12,
  weight: 400,
  lineHeight: 1.5,
  color: INK_FAINT,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT SIZING — INSTITUTIONAL DENSITY
// ═══════════════════════════════════════════════════════════════════════════

/** Primary button height */
export const BUTTON_HEIGHT = 48;

/** Input height */
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
 * PROHIBITED: "Oops", "Sorry", "Something went wrong"
 * REQUIRED: Neutral, declarative, non-emotional
 */
export const ERROR_MESSAGES = {
  AUTH_FAILED: "Authentication failed.",
  EMAIL_NOT_RECOGNIZED: "Email address not recognized.",
  LINK_EXPIRED: "Verification link expired.",
  LINK_INVALID: "Verification link invalid or already used.",
  NETWORK_ERROR: "Connection failed.",
  RATE_LIMITED: "Request limit reached. Wait before retrying.",
  ACCESS_DENIED: "Access not authorized.",
  ACCESS_RESTRICTED: "Access restricted to approved accounts.",
  ACCESS_PENDING: "Access pending authorization.",
  ACCESS_SUSPENDED: "Access suspended.",
  SESSION_EXPIRED: "Session expired.",
  OPERATION_FAILED: "Operation not permitted.",
  RECORD_NOT_FOUND: "Record unavailable.",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM STATE COPY — INSTITUTIONAL LANGUAGE
// ═══════════════════════════════════════════════════════════════════════════

export const SYSTEM_COPY = {
  // Auth states
  ACCESS_CONTROL: "Access Control",
  VERIFICATION_ISSUED: "Verification link issued",
  REQUEST_LINK: "Request access link",
  REISSUE_LINK: "Reissue access link",
  DIFFERENT_EMAIL: "Use a different email",
  ACCESS_ASSISTANCE: "Access assistance",
  
  // Verification
  AUTH_VIA_EMAIL: "Authentication is performed via secure email verification.",
  LINK_SENT_TO: "A secure access link has been sent to:",
  LINK_EXPIRES: "This link expires shortly and may be used once.",
  
  // System boundary pages
  LINK_EXPIRED_TITLE: "Verification link expired",
  LINK_EXPIRED_BODY: "For security, verification links expire quickly and may be used once.",
  
  ACCESS_RESTRICTED_TITLE: "Access not authorized",
  ACCESS_RESTRICTED_BODY: "This account is not authorized for portal access.",
  
  ACCESS_PENDING_TITLE: "Access pending authorization",
  ACCESS_PENDING_BODY: "Authentication successful. This account is awaiting authorization.",
  
  ACCESS_SUSPENDED_TITLE: "Access suspended",
  ACCESS_SUSPENDED_BODY: "Portal access for this account has been suspended.",
  
  NO_ACCESS_TITLE: "No access record",
  NO_ACCESS_BODY: "No access request exists for this email address.",
  
  // Contact
  CONTACT_ADMIN: "Contact administration for access inquiries.",
  SUPPORT_EMAIL: "contact@tribesassets.com",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TAILWIND CLASS COMPOSITIONS — INSTITUTIONAL
// ═══════════════════════════════════════════════════════════════════════════

/** Auth primary button classes */
export const AUTH_BUTTON_CLASSES = {
  base: "w-full h-[52px] rounded-[6px] text-[15px] font-medium transition-colors duration-75",
  enabled: "bg-[#E5E5E3] text-[#0A0A0B] hover:bg-[#D5D5D3]",
  disabled: "bg-[#1A1A1C] text-[#4A4A4A] cursor-not-allowed",
} as const;

/** Auth input classes */
export const AUTH_INPUT_CLASSES = 
  "w-full h-[52px] rounded-[6px] border border-[#2A2A2A] bg-[#141416] " +
  "px-4 text-[15px] text-[#E5E5E3] placeholder:text-[#505050] " +
  "focus:outline-none focus:border-[#3A3A3A] transition-colors duration-75";

/** System state button (for boundary pages) */
export const SYSTEM_BUTTON_CLASSES = {
  primary: "h-[48px] px-6 rounded-[6px] text-[14px] font-medium bg-[#E5E5E3] text-[#0A0A0B] hover:bg-[#D5D5D3] transition-colors duration-75",
  secondary: "h-[48px] px-6 rounded-[6px] text-[14px] font-medium border border-[#3A3A3A] text-[#707070] hover:text-[#909090] hover:border-[#4A4A4A] transition-colors duration-75",
  text: "text-[13px] text-[#505050] hover:text-[#707070] transition-colors duration-75",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM UI CLASSES
// ═══════════════════════════════════════════════════════════════════════════

/** Primary button - solid, authoritative */
export const PRIMARY_BUTTON_CLASSES =
  "w-full h-12 rounded-md inline-flex items-center justify-center px-6 " +
  "text-[14px] font-medium " +
  "bg-[#111] text-white hover:bg-[#1a1a1a] " +
  "disabled:bg-[#E5E5E5] disabled:text-[#8A8A8A] disabled:cursor-not-allowed " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/20 focus-visible:ring-offset-2";

/** Secondary button - outline, de-emphasized */
export const SECONDARY_BUTTON_CLASSES =
  "h-10 rounded-md inline-flex items-center justify-center px-4 " +
  "text-[13px] font-medium " +
  "bg-transparent border border-[#E5E5E5] text-[#6B6B6B] " +
  "hover:border-[#D4D4D4] hover:text-[#111] " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/10 focus-visible:ring-offset-2";

/** Icon button - subtle, institutional */
export const ICON_BUTTON_CLASSES =
  "h-9 w-9 rounded-md inline-flex items-center justify-center " +
  "hover:bg-black/5 active:bg-black/8 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2";

/** Input field - administrative clarity */
export const INPUT_CLASSES =
  "w-full h-11 rounded-md border border-[#E5E5E5] bg-white " +
  "px-4 text-[14px] text-[#111] placeholder:text-[#9CA3AF] " +
  "focus:outline-none focus:border-[#C4C4C4]";

/** Table header cell - dense, clear */
export const TABLE_HEADER_CLASSES =
  "px-4 py-3 text-left text-[11px] font-medium tracking-[0.04em] text-[#6B6B6B] uppercase";

/** Table body cell */
export const TABLE_CELL_CLASSES =
  "px-4 py-3 text-[14px] text-[#111]";

/** Table row - minimal hover, no theatrics */
export const TABLE_ROW_CLASSES =
  "border-b border-[#F0F0F0] hover:bg-[#FAFAFA]";

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION CLASSES — PLATFORM HEADER
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION LABELS — SERIOUS, CONTROLLED
// ═══════════════════════════════════════════════════════════════════════════

export const PERMISSION_LABELS = {
  READ: "Read",
  EDIT: "Edit",
  APPROVE: "Approve",
  ADMIN: "Administer",
  RESTRICTED: "Restricted",
  NONE: "No Access",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ACTION MESSAGES — OFFICIAL, NOT CELEBRATORY
// ═══════════════════════════════════════════════════════════════════════════

export const ACTION_MESSAGES = {
  EXPORT_READY: "Export generated",
  FILE_AVAILABLE: "File available",
  REPORT_PREPARED: "Report prepared",
  CHANGES_SAVED: "Changes saved",
  RECORD_CREATED: "Record created",
  RECORD_UPDATED: "Record updated",
  RECORD_DELETED: "Record removed",
} as const;
