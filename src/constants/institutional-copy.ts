/**
 * INSTITUTIONAL COPY CONSTANTS — CANONICAL LANGUAGE (LOCKED)
 * 
 * This file contains all standardized copy for the Tribes platform.
 * 
 * NON-NEGOTIABLES:
 * - Copy must be identical wherever reused
 * - Do not paraphrase
 * - Do not "improve tone"
 * - Do not add friendliness
 * - Do not add emojis, icons, or celebratory language
 * 
 * This copy is part of the security and trust surface.
 */

// ═══════════════════════════════════════════════════════════════════════════
// BUTTON LABELS — FORMAL ACTIONS ONLY
// ═══════════════════════════════════════════════════════════════════════════

export const BUTTON_LABELS = {
  // Submit actions (creates a record that enters review)
  SUBMIT: "Submit",
  SUBMIT_REQUEST: "Submit request",
  SUBMIT_SONG: "Submit song",
  SUBMIT_UPDATE: "Submit update",
  
  // Request actions (permission or access being asked for)
  REQUEST_ACCESS: "Request access",
  REQUEST_LICENSE: "Request license",
  
  // Staff-only actions
  APPROVE: "Approve",
  DECLINE: "Decline",
  
  // Execution (agreement finalized or signed)
  EXECUTE: "Execute",
  
  // Non-substantive updates
  SAVE_CHANGES: "Save changes",
  
  // Downloads
  DOWNLOAD_RECORD: "Download record",
  
  // Navigation
  RETURN_TO_WORKSPACE: "Return to workspace",
  
  // Auth
  REQUEST_ACCESS_LINK: "Request access link",
  REISSUE_ACCESS_LINK: "Reissue access link",
  
  // Session
  SIGN_OUT: "Sign out",
  SIGN_OUT_ALL_SESSIONS: "Sign out of all sessions",
  
  // Retry
  RETRY: "Retry",
  
  // Cancel
  CANCEL: "Cancel",
  
  // Export
  EXPORT: "Export",
  EXPORT_RECORD: "Export record",
} as const;

// PROHIBITED BUTTON LANGUAGE — NEVER USE:
// - Get started
// - Continue
// - Let's go
// - Confirm
// - Finish
// - Okay
// - Done

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE COPY — INTENTIONAL, NOT UNFINISHED
// ═══════════════════════════════════════════════════════════════════════════

export const EMPTY_STATES = {
  // Licensing Tables
  LICENSING_REQUESTS: {
    title: "No licensing requests available.",
    description: "Requests will appear here once submitted.",
  },
  LICENSING_AGREEMENTS: {
    title: "No agreements on file.",
    description: "Executed agreements will be archived here for reference.",
  },
  
  // Client Portal Tables
  PORTAL_AGREEMENTS: {
    title: "No agreements available.",
    description: "Your executed agreements will appear here once issued.",
  },
  PORTAL_SUBMISSIONS: {
    title: "No submissions recorded.",
    description: "Submitted works will appear here after review.",
  },
  PORTAL_DOCUMENTS: {
    title: "No documents available.",
    description: "Official records and notices will be archived here.",
  },
  PORTAL_STATEMENTS: {
    title: "No statements available.",
    description: "Statements will appear here once processed.",
  },
  
  // Admin / Tribes Team Tables
  PENDING_APPROVALS: {
    title: "No items requiring review.",
    description: "All current requests have been processed.",
  },
  SYSTEM_ALERTS: {
    title: "No active system alerts.",
    description: "Platform services are operating normally.",
  },
  ORGANIZATIONS: {
    title: "No organizations available.",
    description: "Organizations will appear here once created.",
  },
  MEMBERS: {
    title: "No members available.",
    description: "Members will appear here once added.",
  },
  
  // Messages
  MESSAGES: {
    title: "No messages yet.",
    description: "Messages related to your workspace will appear here. This channel is used for official communication and recordkeeping.",
  },
  
  // Generic
  NO_DATA: {
    title: "No records available.",
    description: "This area will populate once data is available.",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TOOLTIP COPY — AUDIT-SAFE, IMPLIES PERMANENCE
// ═══════════════════════════════════════════════════════════════════════════

export const TOOLTIPS = {
  // Table Column Tooltips
  COLUMN_STATUS: "Indicates the current state of this record. Status changes are logged and time-stamped.",
  COLUMN_SUBMITTED_DATE: "Date the record was formally submitted for review.",
  COLUMN_APPROVED_BY: "Administrator who approved this action.",
  COLUMN_ORGANIZATION: "The organization responsible for this record.",
  COLUMN_CREATED: "Date this record was created.",
  COLUMN_UPDATED: "Date this record was last modified.",
  
  // Action Tooltips
  ACTION_DOWNLOAD: "Downloads a copy of this record for reference. This does not modify the official record.",
  ACTION_EDIT: "Changes will be logged and may require review.",
  ACTION_DELETE: "This action is permanent and cannot be undone.",
  ACTION_VIEW: "View the full details of this record.",
  
  // Export Tooltips
  EXPORT: "Generates a read-only export of the current dataset. Exports are logged for audit purposes.",
  EXPORT_FORMAT: "Exports reflect the data as of the time generated.",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// STATUS LABELS — LICENSING (STANDARDIZED)
// ═══════════════════════════════════════════════════════════════════════════

export const LICENSING_STATUS = {
  DRAFT: {
    label: "Draft",
    description: "Not yet submitted",
  },
  SUBMITTED: {
    label: "Submitted",
    description: "Under review by Tribes",
  },
  UNDER_REVIEW: {
    label: "Submitted",
    description: "Under review by Tribes",
  },
  APPROVED: {
    label: "Approved",
    description: "Agreement issued",
  },
  EXECUTED: {
    label: "Executed",
    description: "Signed and completed",
  },
  DECLINED: {
    label: "Declined",
    description: "Request not approved",
  },
  REJECTED: {
    label: "Declined",
    description: "Request not approved",
  },
  EXPIRED: {
    label: "Expired",
    description: "Request closed without execution",
  },
  CANCELLED: {
    label: "Expired",
    description: "Request closed without execution",
  },
  TERMINATED: {
    label: "Expired",
    description: "Request closed without execution",
  },
  ACTIVE: {
    label: "Active",
    description: "Agreement in effect",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ACCESS & PERMISSION COPY
// ═══════════════════════════════════════════════════════════════════════════

export const ACCESS_COPY = {
  RESTRICTED: {
    title: "Access restricted",
    body: "You do not currently have permission to access this workspace or section.",
    detail: "Access to this area is managed by Tribes administrators to ensure proper authorization and data integrity.",
    footnote: "All access requests are logged and reviewed.",
  },
  REQUEST_ACCESS: {
    title: "Request access",
    body: "Submit a request for access to this workspace. Requests are reviewed by the Tribes team before access is granted.",
    confirmation_title: "Request submitted",
    confirmation_body: "Your request has been received and is pending review. You will be notified once a decision has been made.",
    confirmation_note: "Approval is required before access is granted.",
  },
  PAGE_UNAVAILABLE: {
    title: "Page unavailable",
    body: "This page does not exist or you do not have access to it.",
    footnote: "If you believe this is an error, contact the Tribes team.",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ACCOUNT SETTINGS COPY
// ═══════════════════════════════════════════════════════════════════════════

export const ACCOUNT_COPY = {
  PROFILE: {
    title: "Profile Information",
    description: "Identity and organizational association",
    managed_label: "Managed by organization",
  },
  SECURITY: {
    title: "Security",
    description: "Authentication and session management",
    sessions_label: "Active sessions",
    policy_note: "Security settings are enforced according to organizational policy.",
  },
  PREFERENCES: {
    title: "Preferences",
    description: "Notification and display preferences",
    empty: "No additional preferences available at this time.",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CONFIRMATION COPY
// ═══════════════════════════════════════════════════════════════════════════

export const CONFIRMATIONS = {
  SONG_SUBMISSION: {
    title: "Submission received",
    body: "Your submission has been received and is under review. You will be notified if additional information is required.",
    note: "All submissions are logged as part of your permanent record.",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER COPY
// ═══════════════════════════════════════════════════════════════════════════

export const FOOTER_COPY = {
  COPYRIGHT: "© {year} Tribes Rights Management LLC. All rights reserved.",
  AUDIT_NOTICE: "Access and activity are logged for security and audit purposes.",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LABELS — SYSTEM LOGGING LANGUAGE
// ═══════════════════════════════════════════════════════════════════════════

export const AUDIT_COPY = {
  APPROVAL_LOGGED: "All approvals are logged with timestamp and administrator identity.",
  ACCESS_LOGGED: "All access requests are logged and reviewed.",
  EXPORT_LOGGED: "Exports are logged for audit purposes.",
  EXPORT_TIMESTAMP: "Exports reflect the data as of the time generated.",
  CHANGES_LOGGED: "Changes will be logged and may require review.",
  PERMANENT_ACTION: "This action is permanent and cannot be undone.",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// WORKSPACE LANDING COPY — LOCKED HIERARCHY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * WORKSPACE HIERARCHY (LOCKED):
 * 
 * COMPANY LAYER (NOT A WORKSPACE):
 * - System Console: governance, audit, compliance, security
 * 
 * WORKSPACE LAYER (OPERATING ENVIRONMENTS):
 * - Tribes Team: internal operations
 * - Licensing: external licensees
 * - Tribes Admin: administration clients
 */

export const WORKSPACE_LANDING = {
  // ─────────────────────────────────────────────────────────────────────────
  // WORKSPACE: TRIBES TEAM (Internal Operations)
  // ─────────────────────────────────────────────────────────────────────────
  TRIBES_TEAM: {
    title: "Tribes Team",
    description: "Internal operations and oversight",
    empty_title: "Operations queue",
    empty_body: "No items require attention at this time.",
    empty_detail: "Pending requests and operational items will appear here.",
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // WORKSPACE: LICENSING (External Licensees)
  // ─────────────────────────────────────────────────────────────────────────
  LICENSING: {
    title: "Licensing requests",
    description: "Submit and manage licensing requests",
    empty_title: "Licensing requests",
    empty_body: "No licensing requests have been submitted yet.",
    empty_detail: "When a request is submitted, its status, agreement, and records will appear here.",
    cta: "Submit a licensing request",
    footer: "All licensing activity is permanently recorded.",
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // WORKSPACE: TRIBES ADMIN (Administration Clients)
  // ─────────────────────────────────────────────────────────────────────────
  PORTAL: {
    title: "Your records",
    description: "Agreements, submissions, and permanent administration records",
    empty_title: "Your records",
    empty_body: "This workspace contains your agreements, submissions, and permanent administration records.",
    empty_detail: "No records are available yet.",
    primary_cta: "Submit a song for administration",
    secondary_cta: "View agreements",
  },
  
  // Alias for Tribes Admin (new canonical name)
  TRIBES_ADMIN: {
    title: "Your records",
    description: "Agreements, submissions, and permanent administration records",
    empty_title: "Your records",
    empty_body: "This workspace contains your agreements, submissions, and permanent administration records.",
    empty_detail: "No records are available yet.",
    primary_cta: "Submit a song for administration",
    secondary_cta: "View agreements",
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // COMPANY LAYER: SYSTEM CONSOLE (NOT A WORKSPACE)
  // ─────────────────────────────────────────────────────────────────────────
  SYSTEM_CONSOLE: {
    title: "System Console",
    description: "Company governance, audit oversight, and compliance",
    empty_title: "System operational",
    empty_body: "No outstanding items require attention.",
    empty_detail: "Governance dashboards and audit surfaces are available via navigation.",
  },
  
  // Legacy alias (deprecated - use SYSTEM_CONSOLE)
  ADMIN: {
    title: "System Console",
    description: "Company governance, audit oversight, and compliance",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE BEHAVIOR COPY — LOCKED
// ═══════════════════════════════════════════════════════════════════════════

export const MOBILE_COPY = {
  DESKTOP_ONLY_ACTION: "This action is available on desktop.",
  DESKTOP_ONLY_CONFIGURATION: "Configuration is available on desktop.",
  DESKTOP_ONLY_BULK: "Bulk operations are available on desktop.",
} as const;
