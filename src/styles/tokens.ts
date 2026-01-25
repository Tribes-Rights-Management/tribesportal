/**
 * INSTITUTIONAL DESIGN TOKENS — TRIBES PLATFORM
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER ENFORCEMENT DIRECTIVE — LOCKED ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * HIERARCHY (TWO LAYERS ONLY):
 * 
 * 1) COMPANY LAYER (NOT A WORKSPACE):
 *    • System Console — governance, audit, compliance, security
 *    • Accessed via user/profile menu only
 *    • NO workspace selector, NO product navigation
 *    • Access: platform_owner, external_auditor (read-only)
 * 
 * 2) WORKSPACE LAYER (OPERATING ENVIRONMENTS):
 *    • Tribes Team — internal operations (tribes_team_admin, tribes_team_staff)
 *    • Licensing — external licensees (licensing_user)
 *    • Tribes Admin — administration clients (portal_client_admin, portal_client_user)
 *    • Products exist ONLY inside workspaces
 *    • Workspace switcher NEVER lists System Console
 * 
 * NAVIGATION RULES (ENFORCED):
 * - Company Console ≠ Workspace
 * - System Console = sparse, supervisory, non-operational
 * - Products appear ONLY within workspaces
 * - Mobile: one primary action per screen, no hover-only actions
 * 
 * QA GUARDRAILS:
 * - Any deviation from these tokens is a regression
 * - No "friendly" UI patterns allowed
 * - No colorful icons, excessive animations, or playful elements
 * - TRIBES must be ALL CAPS everywhere
 * - No "Tribes Platform" label - it adds no institutional value
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// PORTAL TYPOGRAPHY — INSTITUTIONAL STANDARD (LOCKED)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PORTAL TYPOGRAPHY RULES:
 * - Same font family as marketing site (system font stack)
 * - Headlines: restrained, confident
 * - Body: calm, readable, no "UI filler"
 * - TRIBES must be ALL CAPS everywhere
 * - Section headers: Title Case
 * - Labels: Sentence case
 * - Status text: Sentence case
 */
export const PORTAL_TYPOGRAPHY = {
  // Font family - matches marketing site
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  
  // Brand wordmark
  brandWordmark: {
    text: "TRIBES",
    size: 13,
    weight: 600,
    tracking: 0.08, // em
  },
  
  // Page title - large, restrained
  pageTitle: {
    size: 28,
    weight: 600,
    tracking: -0.02, // em
    lineHeight: 1.2,
  },
  
  // Section header - medium
  sectionHeader: {
    size: 15,
    weight: 500,
    lineHeight: 1.3,
  },
  
  // Body - neutral
  body: {
    size: 14,
    weight: 400,
    lineHeight: 1.5,
  },
  
  // Metadata - small, muted
  meta: {
    size: 13,
    weight: 400,
    lineHeight: 1.4,
  },
  
  // Small labels
  label: {
    size: 10,
    weight: 500,
    tracking: 0.08, // em
    uppercase: true,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// PORTAL AVATAR — INSTITUTIONAL STANDARD (LOCKED)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AVATAR RULES:
 * - Perfect circle (never oval, never pill)
 * - Small diameter (28-32px max, never dominant)
 * - Flat fill (no gradient, no glow)
 * - Initials only unless user uploads image
 * - No hover enlargement or animation
 */
export const PORTAL_AVATAR = {
  // Desktop size
  sizeDesktop: 28,
  // Mobile size
  sizeMobile: 28,
  // Background color - neutral dark
  bgColor: "#2A2A2C",
  bgColorHover: "#333335",
  // Text color
  textColor: "rgba(255,255,255,0.7)",
  // Initials
  initialsSize: 10,
  initialsWeight: 500,
  uppercase: true,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// PORTAL MOTION — NEAR-INVISIBLE (LOCKED)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MOTION RULES:
 * - Near-invisible
 * - No bounce, slide, or delight animations
 * - State changes only
 * - Duration: 150-180ms for interactions
 * - Timing: ease or cubic-bezier(0.2, 0.8, 0.2, 1)
 */
export const PORTAL_MOTION = {
  // Standard duration
  duration: 180,
  durationFast: 150,
  // Timing function
  timing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// INSTITUTIONAL QA GUARDRAILS — NEVER REGRESS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * QA GUARDRAILS:
 * These checks must be applied before any UI change ships.
 * If any check fails, the change is a regression and must be rejected.
 */
export const QA_GUARDRAILS = {
  // Visual Authority Checks
  visualAuthorityChecks: [
    "Does this feel closer to Mercury / Stripe / Apple than Notion?",
    "Is anything playful, friendly, or decorative?",
    "Are there unnecessary cards, pills, or shadows?",
  ],
  
  // Language Discipline
  prohibitedLanguage: [
    "Get started",
    "Coming soon",
    "Oops",
    "Sorry",
    "Great job",
    "Awesome",
    "You're all set",
    "Successfully",
    "Let's go",
    "Welcome back",
  ],
  
  // Consistency Checks
  consistencyChecks: [
    "Does TRIBES appear in ALL CAPS?",
    "Does typography match the marketing site exactly?",
    "Are tables flat and calm?",
    "Are avatars small and circular?",
  ],
  
  // Interaction Discipline
  interactionChecks: [
    "Are there unnecessary animations?",
    "Are there CTA buttons where status text would suffice?",
    "Is hover doing too much?",
  ],
  
  // Empty State Discipline
  emptyStateChecks: [
    "Do empty states communicate status, not encouragement?",
    "Are they calm, non-interactive, and factual?",
  ],
  
  // Final Gate
  finalGate: "If a feature feels trendy, friendly, or like a startup - it does not ship.",
} as const;

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

/** Standard icon size (16px default) */
export const ICON_SIZE = 16;

/** Small icon size (14px for inputs, chips, table sort) */
export const ICON_SIZE_SM = 14;

/** Icon stroke width (thin institutional) */
export const ICON_STROKE = 1.25;

/** Light stroke width (for empty states only) */
export const ICON_STROKE_LIGHT = 1.0;

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
// PLATFORM UI CLASSES — Mercury/Stripe-like Neutral System (NO BLACK BUTTONS)
// ═══════════════════════════════════════════════════════════════════════════

/** 
 * Primary button - Mercury/Stripe neutral GREY (NO BLACK, NO VISIBLE BORDER)
 * Uses CSS variables from tribes-theme.css for consistency
 */
export const PRIMARY_BUTTON_CLASSES =
  "w-full h-10 rounded-[6px] inline-flex items-center justify-center px-6 " +
  "text-[14px] font-medium " +
  "bg-[var(--control-fill)] text-[var(--btn-text)] " +
  "hover:bg-[var(--control-hover)] " +
  "disabled:bg-muted/30 disabled:text-[#9CA3AF] disabled:cursor-not-allowed disabled:opacity-40 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2";

/** Secondary button - Same as primary for unified Mercury-like look (NO VISIBLE BORDER) */
export const SECONDARY_BUTTON_CLASSES =
  "h-10 rounded-[6px] inline-flex items-center justify-center px-4 " +
  "text-[13px] font-medium " +
  "bg-[var(--control-fill)] text-[var(--btn-text)] " +
  "hover:bg-[var(--control-hover)] " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2";

/** Icon button - subtle, Mercury neutral */
export const ICON_BUTTON_CLASSES =
  "h-9 w-9 rounded-[6px] inline-flex items-center justify-center " +
  "hover:bg-[var(--muted-wash)] active:bg-[var(--control-hover)] " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2";

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

/**
 * PERMISSION RULES:
 * - No "You don't have access" language
 * - Use "Access not authorized." — enforced, not explained
 * - Permissions are structural, not negotiable
 * - Restricted areas should simply not appear
 */
export const PERMISSION_LABELS = {
  READ: "Read",
  EDIT: "Edit",
  APPROVE: "Approve",
  ADMIN: "Administer",
  RESTRICTED: "Restricted",
  NONE: "No Access",
  NOT_AUTHORIZED: "Access not authorized.",
  PERMISSION_RESTRICTED: "Permission restricted.",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ACTION MESSAGES — OFFICIAL, NOT CELEBRATORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EXPORT/ACTION RULES:
 * - Treated as official system outputs
 * - No success celebrations
 * - No confirmation theatrics
 * - Language: "Generate report", "Export record", "Download file"
 */
export const ACTION_MESSAGES = {
  EXPORT_READY: "Export generated",
  FILE_AVAILABLE: "File available",
  REPORT_PREPARED: "Report prepared",
  CHANGES_SAVED: "Changes saved",
  RECORD_CREATED: "Record created",
  RECORD_UPDATED: "Record updated",
  RECORD_DELETED: "Record removed",
  // Export actions
  GENERATE_REPORT: "Generate report",
  EXPORT_RECORD: "Export record",
  DOWNLOAD_FILE: "Download file",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM STATE COPY — INFRASTRUCTURE VOICE (ACQUISITION-GRADE)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * STATE COPY RULES (PHASE 5 — ACQUISITION-GRADE):
 * - No empathy, no personality, no reassurance
 * - Neutral, informational, infrastructure voice
 * - Predictable over fast — system feels reliable, not reactive
 * - Calm under load — no apologetic language, no error dramatization
 * - Edge cases are expected system states — no surprise states
 * - Quiet confidence — short, neutral, declarative
 * - Language assumes competence
 */
export const STATE_COPY = {
  // Loading states — predictable, not fast
  LOADING: "Loading data",
  LOADING_RECORDS: "Retrieving records",
  LOADING_DATA: "Loading data",
  PROCESSING: "Applying changes",
  OPERATION_IN_PROGRESS: "Operation in progress",
  PROCESSING_REQUEST: "Processing request",
  
  // Empty states — expected system state (CANONICAL COPY)
  // Structure: { title, description, note? }
  NO_RECORDS: "No records available.",
  NO_DATA: "No data available.",
  NO_RESULTS: "No results.",
  EMPTY_DATASET: "Dataset empty.",
} as const;

/**
 * CANONICAL EMPTY STATE COPY — INSTITUTIONAL STANDARD
 * 
 * Structure:
 * - title: Declarative status (1 line)
 * - description: System explanation (1 sentence)
 * - note: Optional permission/availability context
 * 
 * NEVER include: illustrations, icons, CTAs, "Get started", "Coming soon"
 */
export const EMPTY_STATE_COPY = {
  // Generic (default)
  GENERIC: {
    title: "No records available",
    description: "This area will populate once data is available.",
    note: "Availability depends on account configuration and permissions.",
  },
  
  // Tables (Users, Organizations, Assets, Agreements)
  TABLE: {
    title: "No entries found",
    description: "No records currently meet the selected criteria.",
  },
  
  // Permissions / Access
  PERMISSIONS: {
    title: "No access changes recorded",
    description: "Permission updates will appear here once applied.",
  },
  
  // Reports / Financials
  REPORTS: {
    title: "No activity recorded",
    description: "Reporting data will appear once transactions are processed.",
  },
  
  // Admin Dashboards
  ADMIN: {
    title: "System operational",
    description: "No outstanding items require attention at this time.",
  },
  
  // Approvals
  APPROVALS: {
    title: "No pending approvals",
    description: "Records will appear when users request access.",
  },
  
  // Audit / Activity
  AUDIT: {
    title: "No activity recorded",
    description: "Events will appear once actions are performed.",
  },
  
  // Users
  USERS: {
    title: "No users",
    description: "Records will appear when users are provisioned.",
  },
  
  // Organizations
  ORGANIZATIONS: {
    title: "No organizations",
    description: "Organizations will appear when configured.",
  },
  
  // Error states — calm, managed, not dramatized
  OPERATION_FAILED: "Operation failed.",
  VERIFICATION_REQUIRED: "Verification required.",
  CONNECTION_FAILED: "Connection unavailable.",
  REQUEST_TIMEOUT: "Request timeout.",
  TIMEOUT_EXPLICIT: "Operation timed out. Retry when ready.",
  
  // Permission states — structural, not explained
  ACCESS_NOT_AUTHORIZED: "Access not authorized.",
  PERMISSION_RESTRICTED: "Permission restricted.",
  PARTIAL_PERMISSIONS: "Partial access.",
  
  // Session states — expected edge cases
  SESSION_EXPIRED: "Session expired.",
  SESSION_INVALID: "Session invalid.",
  REAUTHENTICATION_REQUIRED: "Reauthentication required.",
  
  // Data states — expected edge cases
  MISSING_UPSTREAM_DATA: "Upstream data unavailable.",
  PARTIAL_DATA: "Partial data loaded.",
  SYNC_PENDING: "Sync pending.",
  
  // Completion states — quiet confidence
  COMPLETE: "Complete",
  SUBMITTED: "Submitted",
  RECORDED: "Recorded",
  SAVED: "Saved",
  APPLIED: "Applied",
  CONFIRMED: "Confirmed",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD STATUS LABELS — OPERATIONAL, NOT PERFORMATIVE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DASHBOARD RULES:
 * - Status views, not summaries
 * - Show counts, states, alerts
 * - No charts for storytelling
 * - No KPIs as motivation
 * - No friendly language
 * - Communicate operational state, not performance
 */
export const DASHBOARD_LABELS = {
  // Publishing status
  UNREGISTERED_WORKS: "Unregistered works",
  PENDING_DOCUMENTATION: "Pending documentation",
  PENDING_REGISTRATIONS: "Pending registrations",
  ACTIVE_WORKS: "Active works",
  TOTAL_WORKS: "Total works",
  
  // Licensing status
  LICENSING_HOLDS: "Licensing holds",
  PENDING_REQUESTS: "Pending requests",
  ACTIVE_LICENSES: "Active licenses",
  CATALOG_ITEMS: "Catalog items",
  
  // Admin status
  PENDING_APPROVALS: "Pending approvals",
  ACTIVE_USERS: "Active users",
  ACTIVE_TENANTS: "Active organizations",
  SECURITY_ALERTS: "Security alerts",
  
  // General
  REQUIRES_ACTION: "Requires action",
  AWAITING_REVIEW: "Awaiting review",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION LABELS — FUNCTIONAL, NOT EXPRESSIVE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * NAVIGATION RULES:
 * - Functional, not expressive
 * - No personality, no storytelling
 * - No "friendly" labels
 * - Flat hierarchy, clear groupings
 * - No novelty navigation patterns
 * - TRIBES must be ALL CAPS everywhere
 * - No "Tribes Platform" label - it adds no institutional value
 */
export const NAV_LABELS = {
  // Brand
  BRAND_WORDMARK: "TRIBES",
  
  // Workspace labels (replaces "Organization" in user-facing UI)
  WORKSPACE: "Workspace",
  WORKSPACES: "Workspaces",
  SWITCH_WORKSPACE: "Switch Workspace",
  SELECT_WORKSPACE: "Select workspace",
  ENTER_WORKSPACE: "Enter Workspace",  // System Console → Workspace transition
  
  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION SURFACES — LOCKED ARCHITECTURE
  // ═══════════════════════════════════════════════════════════════════════════
  // Company Console ≠ Organization Workspace
  // Products appear only within organizations
  // Organization switcher never lists company-level consoles
  
  // COMPANY-LEVEL (executive only, no products)
  SYSTEM_CONSOLE: "System Console",  // Company governance, audit, compliance
  
  // ORGANIZATION-LEVEL (workspace-scoped products)
  TRIBES_ADMIN: "Tribes Admin",      // Organization administration (was "Client Portal")
  LICENSING: "Licensing",            // Licensee workspace
  
  // Deprecated labels
  ADMINISTRATION: "System Console",  // Backward compat - use SYSTEM_CONSOLE
  CLIENT_PORTAL: "Tribes Admin",     // Backward compat - use TRIBES_ADMIN
  TRIBES_TEAM: "Tribes Team",        // Internal operations (deprecated)
  
  // Publishing nav - INSTITUTIONAL TERMINOLOGY
  OVERVIEW: "Overview", // Replaces "Dashboard"
  WORKS: "Works",
  SPLITS: "Splits & Ownership",
  REGISTRATIONS: "Registrations",
  STATEMENTS: "Statements",
  PAYMENTS: "Payments",
  DOCUMENTS: "Documents",
  CONFIGURATION: "Configuration", // Replaces "Settings"
  
  // Licensing nav
  CATALOG: "Catalog",
  REQUESTS: "License Requests",
  AGREEMENTS: "Agreements",
  REPORTS: "Reports",
  
  // Admin nav
  ACCESS_CONTROL: "Access Control",
  ORGANIZATIONS: "Workspaces", // User-facing: "Workspaces" not "Organizations"
  RLS_VERIFICATION: "RLS Verification",
  AUDIT_COVERAGE: "Audit Coverage",
  SESSION_INTEGRITY: "Session Integrity",
  ACCOUNT_SETTINGS: "Account Settings",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION LABELS — OPERATIONAL ONLY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * NOTIFICATION RULES:
 * - Operational relevance only
 * - Status changes, required actions, system failures
 * - No encouragement, praise, "You're all set" language
 * - Behave like system alerts, not UX feedback
 */
export const NOTIFICATION_LABELS = {
  // Allowed notifications
  STATUS_CHANGED: "Status changed",
  ACTION_REQUIRED: "Action required",
  SYSTEM_FAILURE: "System failure",
  VERIFICATION_PENDING: "Verification pending",
  APPROVAL_REQUIRED: "Approval required",
  DOCUMENT_REQUIRED: "Document required",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH & FILTER LABELS — PROFESSIONAL TOOLS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SEARCH RULES:
 * - Deterministic
 * - No fuzzy "smart" behavior unless explicitly enabled
 * - Filters: Explicit, multi-select, persistent
 * - No suggestions phrased as help
 * - No conversational search
 * - Search is a tool, not an assistant
 */
export const SEARCH_LABELS = {
  SEARCH: "Search",
  SEARCH_PLACEHOLDER: "Search records…",
  FILTER: "Filter",
  FILTERS: "Filters",
  CLEAR_FILTERS: "Clear filters",
  APPLY_FILTERS: "Apply filters",
  NO_RESULTS: "No results.",
  REFINE_SEARCH: "Refine search criteria.",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DATA HIERARCHY LABELS — PRIMARY VS DERIVED
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DATA HIERARCHY RULES:
 * - Primary records: Works, Agreements, Ownership, Payments
 * - Derived views: Summaries, Aggregations, Filters
 * - Primary records are immutable unless explicitly edited
 * - Derived views never appear more authoritative than source records
 * - The system always makes clear what is canonical
 */
export const DATA_LABELS = {
  // Primary record types
  PRIMARY_RECORD: "Primary record",
  SOURCE_RECORD: "Source record",
  CANONICAL: "Canonical",
  
  // Derived view types
  DERIVED_VIEW: "Derived view",
  SUMMARY: "Summary",
  AGGREGATION: "Aggregation",
  FILTERED_VIEW: "Filtered view",
  
  // Record metadata
  RECORD_ID: "Record ID",
  CREATED: "Created",
  UPDATED: "Updated",
  VERSION: "Version",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CANONICAL RECORD LABELS — DATA IMMUTABILITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DATA IMMUTABILITY RULES:
 * - Canonical records cannot be deleted
 * - Edits create new versions; originals remain intact
 * - Version history is always accessible
 * - System clearly indicates the current effective version
 * - The system must behave like a registry, not a spreadsheet
 */
export const RECORD_LABELS = {
  // Version indicators
  CURRENT_VERSION: "Current version",
  EFFECTIVE_VERSION: "Effective version",
  EFFECTIVE_AS_OF: "Effective as of",
  VERSION_HISTORY: "Version history",
  PREVIOUS_VERSION: "Previous version",
  SUPERSEDED: "Superseded",
  
  // Record types (canonical)
  WORK: "Work",
  AGREEMENT: "Agreement",
  OWNERSHIP_SPLIT: "Ownership split",
  LICENSE: "License",
  STATEMENT: "Statement",
  
  // Record status
  ACTIVE: "Active",
  ARCHIVED: "Archived",
  DRAFT: "Draft",
  
  // Record metadata display
  RECORD_ID: "Record ID",
  CREATED_BY: "Created by",
  CREATED_AT: "Created",
  LAST_MODIFIED: "Last modified",
  MODIFIED_BY: "Modified by",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT TRAIL LABELS — WHO, WHAT, WHEN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AUDIT TRAIL RULES:
 * - Comprehensive tracking for all sensitive actions
 * - Audit logs are readable, chronological, immutable
 * - No hiding behind "advanced settings"
 * - Audit trails are first-class citizens, not developer artifacts
 */
export const AUDIT_LABELS = {
  // Section headers
  AUDIT_TRAIL: "Audit trail",
  ACTIVITY_LOG: "Activity log",
  HISTORY: "History",
  
  // Tracked events
  RECORD_CREATED: "Record created",
  RECORD_UPDATED: "Record updated",
  RECORD_APPROVED: "Record approved",
  RECORD_REJECTED: "Record rejected",
  ACCESS_GRANTED: "Access granted",
  ACCESS_REVOKED: "Access revoked",
  EXPORT_GENERATED: "Export generated",
  DOCUMENT_UPLOADED: "Document uploaded",
  DOCUMENT_REMOVED: "Document removed",
  
  // Audit fields
  ACTOR: "Actor",
  ACTION: "Action",
  TIMESTAMP: "Timestamp",
  AFFECTED_RECORD: "Affected record",
  DETAILS: "Details",
  
  // System actor
  SYSTEM: "System",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// APPROVAL WORKFLOW LABELS — DELIBERATE STATE CHANGES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * APPROVAL RULES:
 * - Sensitive actions require explicit approval workflows
 * - No instant commits for sensitive actions
 * - Pending states must be clearly labeled
 * - Approvals require named actors
 * - Treat approvals as governance events, not consumer-style modals
 */
export const APPROVAL_LABELS = {
  // Approval states
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  EXPIRED: "Expired",
  
  // Actions
  SUBMIT_FOR_APPROVAL: "Submit for approval",
  APPROVE: "Approve",
  REJECT: "Reject",
  WITHDRAW: "Withdraw",
  
  // Metadata
  SUBMITTED_BY: "Submitted by",
  SUBMITTED_AT: "Submitted",
  APPROVED_BY: "Approved by",
  APPROVED_AT: "Approved",
  REJECTED_BY: "Rejected by",
  REJECTED_AT: "Rejected",
  REJECTION_REASON: "Rejection reason",
  
  // Approval types
  OWNERSHIP_CHANGE: "Ownership change",
  LICENSE_ISSUANCE: "License issuance",
  AGREEMENT_AMENDMENT: "Agreement amendment",
  ACCESS_REQUEST: "Access request",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TRUST SIGNALS — QUIET, STRUCTURAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TRUST SIGNAL RULES:
 * - Subtle, noticed subconsciously, not announced
 * - No badges or trophies
 * - No marketing icons
 * - Use restrained typographic indicators
 */
export const TRUST_LABELS = {
  // Trust indicators
  SYSTEM_OF_RECORD: "System of record",
  VERIFIED_DOCUMENT: "Verified document",
  APPROVED_VERSION: "Approved version",
  OFFICIAL_RECORD: "Official record",
  REGISTERED: "Registered",
  
  // Verification status
  VERIFIED: "Verified",
  UNVERIFIED: "Unverified",
  PENDING_VERIFICATION: "Pending verification",
  
  // Source indicators
  SOURCE_DOCUMENT: "Source document",
  REFERENCE: "Reference",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT INTEGRITY LABELS — CHAIN OF CUSTODY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EXPORT RULES:
 * - Exports include record IDs
 * - Include generation timestamp
 * - Identify exporting account
 * - No celebration, no download animations
 * - Exports must feel admissible and verifiable
 */
export const EXPORT_LABELS = {
  // Actions
  GENERATE_REPORT: "Generate report",
  EXPORT_RECORD: "Export record",
  DOWNLOAD_FILE: "Download file",
  
  // Status
  EXPORT_GENERATED: "Export generated",
  FILE_AVAILABLE: "File available",
  PREPARING_EXPORT: "Preparing export…",
  
  // Metadata (included in exports)
  GENERATED_AT: "Generated",
  GENERATED_BY: "Generated by",
  INCLUDES_RECORDS: "Includes records",
  EXPORT_ID: "Export ID",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM DISCLAIMERS — PRECISION OVER LEGAL FLUFF
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DISCLAIMER RULES:
 * - One sentence max
 * - Neutral tone
 * - No legal overexplanation
 * - Support clarity, not protection theater
 */
export const DISCLAIMERS = {
  // Record accuracy
  RECORD_EFFECTIVE_DATE: "This record reflects the information on file as of the effective date shown.",
  DATA_AS_OF: "Data current as of the timestamp indicated.",
  
  // Export disclaimers
  EXPORT_POINT_IN_TIME: "This export represents a point-in-time snapshot.",
  
  // System disclaimers
  PENDING_CHANGES: "Changes pending approval are not reflected.",
  VERSION_SUPERSEDED: "This version has been superseded.",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ACQUISITION-GRADE MICROCOPY — QUIET CONFIDENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MICROCOPY RULES (PHASE 5):
 * - Short, neutral, declarative
 * - Avoid encouragement, confirmation fluff, "You're all set"
 * - Prefer: "Complete", "Submitted", "Recorded"
 * - Language assumes competence
 */
export const MICROCOPY = {
  // Completion states (prefer these)
  COMPLETE: "Complete",
  SUBMITTED: "Submitted",
  RECORDED: "Recorded",
  SAVED: "Saved",
  APPLIED: "Applied",
  CONFIRMED: "Confirmed",
  UPDATED: "Updated",
  REMOVED: "Removed",
  
  // Action states (neutral)
  PROCESSING: "Applying changes",
  LOADING: "Loading data",
  PREPARING: "Preparing",
  GENERATING: "Generating",
  EXPORTING: "Preparing export",
  
  // Prompt labels (declarative)
  CONTINUE: "Continue",
  CANCEL: "Cancel",
  RETRY: "Retry",
  CONFIRM: "Confirm",
  SUBMIT: "Submit",
  SAVE: "Save",
  DELETE: "Remove",
  CLOSE: "Close",
  
  // Prohibited patterns (NEVER USE):
  // - "You're all set"
  // - "Great job"
  // - "Successfully"
  // - "Awesome"
  // - "Oops"
  // - "Sorry"
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// VISUAL RESTRAINT — ACQUISITION-GRADE POLISH
// ═══════════════════════════════════════════════════════════════════════════

/**
 * VISUAL RESTRAINT RULES (PHASE 5):
 * - Remove excessive rounding
 * - Remove colorful icons
 * - Remove decorative dividers
 * - Remove overuse of cards
 * - Standardize: flat surfaces, muted colors, typography-led hierarchy
 * - If an element draws attention to itself, reduce it
 */
export const VISUAL_RESTRAINT = {
  // Maximum border radius values
  RADIUS_MAX_CARD: 8,    // Cards, panels
  RADIUS_MAX_CONTROL: 6, // Buttons, inputs
  RADIUS_MAX_SMALL: 4,   // Badges, pills
  
  // Shadow usage - minimal
  SHADOW_CARD: "none",              // No card shadows by default
  SHADOW_DROPDOWN: "0 2px 8px rgba(0,0,0,0.08)", // Minimal dropdown shadow
  SHADOW_MODAL: "0 4px 16px rgba(0,0,0,0.12)",   // Subtle modal shadow
  
  // Border colors - muted
  BORDER_DEFAULT: "#E5E5E5",
  BORDER_SUBTLE: "#F0F0F0",
  BORDER_STRONG: "#D4D4D4",
  
  // Background surfaces - flat
  BG_PAGE: "#F5F5F7",
  BG_CARD: "#FFFFFF",
  BG_MUTED: "#FAFAFA",
  BG_SUBTLE: "#F8F8F8",
  
  // No decorative dividers - functional only
  DIVIDER_COLOR: "#E5E5E5",
  DIVIDER_WIDTH: 1,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTIVE LENS — FINAL TRUST PASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EXECUTIVE LENS (PHASE 5):
 * 
 * Evaluate every UI decision:
 * - Would this hold up in diligence?
 * - Would legal teams trust this?
 * - Would an acquirer believe this system has permanence?
 * 
 * Correct anything that feels:
 * - Temporary
 * - Persuasive (marketing tone)
 * - Reversible when it should not be
 * 
 * The platform must feel built to exist for decades.
 */
export const EXECUTIVE_STANDARDS = {
  // These UI patterns indicate permanence
  PERMANENT_PATTERNS: [
    "Flat surfaces",
    "Muted colors",
    "Typography-led hierarchy",
    "Dense information presentation",
    "Minimal animation",
    "Declarative language",
    "Structural permissions",
    "Audit trail visibility",
    "Version history access",
    "Record ID visibility",
  ],
  
  // These UI patterns indicate temporary/SaaS
  TEMPORARY_PATTERNS: [
    "Excessive animation",
    "Colorful gradients",
    "Playful icons",
    "Encouraging language",
    "Celebration modals",
    "Gamification elements",
    "Soft, bubbly edges",
    "Marketing tone",
    "Success confetti",
    "Hidden IDs",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// THEME ENFORCEMENT — COMPONENT-LEVEL LOCK (CANONICAL)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * THEME ENFORCEMENT RULES:
 * 
 * This system prevents visual drift by locking design tokens and component 
 * behavior globally. Any deviation is a regression.
 * 
 * LOCKED ELEMENTS:
 * - Header background: #0A0A0B (matches marketing site)
 * - Page background: #0A0A0B (same as marketing)
 * - Typography: System font stack, no substitutions
 * - TRIBES wordmark: ALL CAPS, 13px, 600 weight, 0.08em tracking
 * 
 * COMPONENT RULES:
 * - Buttons: Flat, restrained, no gradients
 * - Cards: Minimal radius (6-8px), subtle elevation only
 * - Tables: Divider-based, no boxed cells
 * - Avatars: 28px max, perfect circle, neutral background
 * 
 * PROHIBITED (REGRESSION):
 * - New colors outside token system
 * - New font weights
 * - Decorative animation
 * - Gradient backgrounds
 * - Drop shadows for decoration
 * - Pill shapes for core UI
 * - Consumer SaaS patterns
 */
export const THEME_ENFORCEMENT = {
  // Locked header values
  HEADER: {
    background: "#0A0A0B",
    height: 56,
    heightDesktop: 64,
    borderColor: "rgba(255,255,255,0.08)",
  },
  
  // Locked page canvas
  PAGE: {
    background: "#0A0A0B",
    surfacePrimary: "#111113",
    surfaceSecondary: "#161618",
    surfaceTertiary: "#1A1A1C",
  },
  
  // Locked typography
  TYPOGRAPHY: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    baseFontSize: 14,
    wordmark: {
      text: "TRIBES",
      size: 13,
      weight: 600,
      tracking: "0.08em",
      case: "uppercase",
    },
  },
  
  // Locked component constraints
  COMPONENTS: {
    button: {
      borderRadius: 6,
      heightPrimary: 40,
      heightCompact: 36,
      noGradients: true,
      noShadows: true,
    },
    card: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      noDropShadows: true,
    },
    table: {
      rowHeight: 44,
      headerHeight: 40,
      dividerOnly: true,
      noZebraStripes: true,
      noBoxedCells: true,
    },
    avatar: {
      sizeMax: 28,
      shape: "circle",
      background: "#2A2A2C",
      noGlow: true,
      noBorder: true,
    },
    input: {
      borderRadius: 6,
      height: 40,
      heightAuth: 48,
    },
  },
  
  // Prohibited patterns - rejection criteria
  PROHIBITED: [
    "gradient-backgrounds",
    "decorative-shadows",
    "pill-shapes",
    "colorful-icons",
    "bounce-animations",
    "slide-animations",
    "success-celebrations",
    "encouragement-language",
    "inline-color-overrides",
    "new-font-weights",
    "marketing-tone",
    "consumer-saas-patterns",
  ],
  
  // Audit checklist - use before shipping
  AUDIT: [
    "Header matches marketing site exactly?",
    "Page background is #0A0A0B?",
    "TRIBES appears in ALL CAPS?",
    "No new colors outside token system?",
    "No gradient buttons?",
    "No decorative animations?",
    "Tables are flat and ledger-like?",
    "Avatars are 28px max circles?",
    "Language is institutional, not friendly?",
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// LONG-SESSION UX — FATIGUE REDUCTION TOKENS (CANONICAL)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * LONG-SESSION UX RULES:
 * 
 * Optimize for hours-long administrative use, not quick logins.
 * 
 * VISUAL:
 * - Reduce contrast fatigue: no pure white on pure black
 * - Use soft off-black backgrounds (#0A0A0B, not #000)
 * - Muted dividers (rgba 8-12%, not solid lines)
 * - Avoid high-saturation accents except for critical alerts
 * 
 * INTERACTION:
 * - No modal-heavy flows for primary tasks
 * - Prefer inline panels and dedicated pages
 * - Preserve scroll position on navigation return
 * 
 * STATE:
 * - Remember table sorting, filters, pagination per user
 * - Do not reset views on refresh unless data changes
 */
export const LONG_SESSION_UX = {
  // Text contrast optimized for extended viewing
  TEXT: {
    primary: "#E8E8E6",        // Slightly warm off-white (not #FFF)
    secondary: "#8A8A8A",      // Comfortable gray
    muted: "#5A5A5A",          // Subdued for metadata
    faint: "#4A4A4A",          // Minimal emphasis
  },
  
  // Background optimized for extended viewing
  BACKGROUND: {
    canvas: "#0A0A0B",         // Near-black (not pure #000)
    surface: "#111113",        // Slightly lifted
    elevated: "#161618",       // Subtle elevation
    hover: "rgba(255,255,255,0.02)", // Barely visible hover
    active: "rgba(255,255,255,0.04)", // Subtle selection
  },
  
  // Borders optimized for non-fatiguing structure
  BORDER: {
    subtle: "rgba(255,255,255,0.08)",
    normal: "rgba(255,255,255,0.10)",
    strong: "rgba(255,255,255,0.12)",
    // Never use solid white/gray borders
  },
  
  // Accent colors - reserved for critical states only
  ACCENT: {
    critical: "#EF4444",       // Red - errors, alerts
    warning: "#F59E0B",        // Amber - warnings only
    success: "#10B981",        // Green - confirmations only
    info: "#3B82F6",           // Blue - links, focus only
    // Never use for decoration
  },
  
  // Interaction preferences
  INTERACTION: {
    preferInlinePanels: true,
    avoidModalsForPrimaryTasks: true,
    preserveScrollPosition: true,
    persistTableState: true,
    persistFilterState: true,
  },
} as const;
