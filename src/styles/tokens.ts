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
  
  // Empty states — expected system state
  NO_RECORDS: "No records available.",
  NO_DATA: "No data available.",
  NO_RESULTS: "No results.",
  EMPTY_DATASET: "Dataset empty.",
  
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
 */
export const NAV_LABELS = {
  // Portal modes
  CLIENT_PORTAL: "Client Portal",
  LICENSING: "Licensing",
  ADMINISTRATION: "Administration",
  
  // Publishing nav
  DASHBOARD: "Dashboard",
  WORKS: "Works",
  SPLITS: "Splits & Ownership",
  REGISTRATIONS: "Registrations",
  STATEMENTS: "Statements",
  PAYMENTS: "Payments",
  DOCUMENTS: "Documents",
  SETTINGS: "Settings",
  
  // Licensing nav
  CATALOG: "Catalog",
  REQUESTS: "License Requests",
  AGREEMENTS: "Agreements",
  REPORTS: "Reports",
  
  // Admin nav
  ACCESS_CONTROL: "Access Control",
  ORGANIZATIONS: "Organizations",
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
