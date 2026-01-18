/**
 * SESSION TIMEOUT POLICY — INSTITUTIONAL INACTIVITY GOVERNANCE
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTHORITATIVE TIMEOUT STANDARDS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * These values are scope-aware and role-aware. External auditors always
 * receive stricter timeouts. System Console sessions are shorter than
 * organization workspace sessions due to elevated privilege exposure.
 * 
 * Values are in milliseconds unless otherwise noted.
 */

// ═══════════════════════════════════════════════════════════════════════════
// IDLE TIMEOUT POLICIES (minutes)
// ═══════════════════════════════════════════════════════════════════════════

export const IDLE_TIMEOUT_MINUTES = {
  /** System Console: 15 minutes idle (elevated privilege surface) */
  SYSTEM_CONSOLE: 15,
  
  /** Organization workspaces (Client Portal, Licensing): 30 minutes idle */
  ORGANIZATION: 30,
  
  /** External Auditor sessions: 15 minutes idle (strictest policy) */
  EXTERNAL_AUDITOR: 15,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ABSOLUTE SESSION LIFETIME (hours)
// ═══════════════════════════════════════════════════════════════════════════

export const ABSOLUTE_SESSION_HOURS = {
  /** Platform Executive / System Console: 8 hours max */
  SYSTEM_CONSOLE: 8,
  
  /** Standard organization sessions: 12 hours max */
  ORGANIZATION: 12,
  
  /** External Auditor: 8 hours max (stricter) */
  EXTERNAL_AUDITOR: 8,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// WARNING THRESHOLD
// ═══════════════════════════════════════════════════════════════════════════

/** Warning modal appears this many minutes before idle logout */
export const WARNING_THRESHOLD_MINUTES = 2;

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-TAB SYNC
// ═══════════════════════════════════════════════════════════════════════════

/** BroadcastChannel name for session sync */
export const SESSION_BROADCAST_CHANNEL = 'tribes-session-sync';

/** localStorage key for fallback sync */
export const SESSION_STORAGE_KEY = 'tribes-session-activity';

/** localStorage key for session start time */
export const SESSION_START_KEY = 'tribes-session-start';

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY EVENTS (what counts as user activity)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Events that reset the idle timer.
 * These are intentional user actions, not background processes.
 */
export const ACTIVITY_EVENTS = [
  'click',
  'pointerdown',
  'keydown',
  'touchstart',
  'wheel',
] as const;

/**
 * Events that do NOT count as activity:
 * - background polling
 * - websocket messages
 * - passive data refresh
 * - tab visibility changes alone
 * - mousemove (too sensitive, fires constantly)
 */

// ═══════════════════════════════════════════════════════════════════════════
// SESSION SCOPE TYPE
// ═══════════════════════════════════════════════════════════════════════════

export type SessionScope = 'system' | 'organization' | 'auditor';

export interface SessionPolicy {
  /** Idle timeout in milliseconds */
  idleTimeoutMs: number;
  /** Absolute session lifetime in milliseconds */
  absoluteLifetimeMs: number;
  /** Warning threshold in milliseconds */
  warningThresholdMs: number;
  /** Policy label for audit logging */
  policyLabel: string;
}

/**
 * Get session policy based on current scope and role
 */
export function getSessionPolicy(
  isExternalAuditor: boolean,
  currentScope: 'system' | 'organization' | 'user' | 'auth' | 'public'
): SessionPolicy {
  // External auditors always get stricter policy
  if (isExternalAuditor) {
    return {
      idleTimeoutMs: IDLE_TIMEOUT_MINUTES.EXTERNAL_AUDITOR * 60 * 1000,
      absoluteLifetimeMs: ABSOLUTE_SESSION_HOURS.EXTERNAL_AUDITOR * 60 * 60 * 1000,
      warningThresholdMs: WARNING_THRESHOLD_MINUTES * 60 * 1000,
      policyLabel: 'external_auditor',
    };
  }

  // System Console scope
  if (currentScope === 'system') {
    return {
      idleTimeoutMs: IDLE_TIMEOUT_MINUTES.SYSTEM_CONSOLE * 60 * 1000,
      absoluteLifetimeMs: ABSOLUTE_SESSION_HOURS.SYSTEM_CONSOLE * 60 * 60 * 1000,
      warningThresholdMs: WARNING_THRESHOLD_MINUTES * 60 * 1000,
      policyLabel: 'system_console',
    };
  }

  // Organization workspace (including user scope which is org-adjacent)
  return {
    idleTimeoutMs: IDLE_TIMEOUT_MINUTES.ORGANIZATION * 60 * 1000,
    absoluteLifetimeMs: ABSOLUTE_SESSION_HOURS.ORGANIZATION * 60 * 60 * 1000,
    warningThresholdMs: WARNING_THRESHOLD_MINUTES * 60 * 1000,
    policyLabel: 'organization',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const SESSION_AUDIT_EVENTS = {
  WARNING_SHOWN: 'auth.session_idle_warning_shown',
  SIGNED_OUT_IDLE: 'auth.session_signed_out_idle',
  SIGNED_OUT_ABSOLUTE: 'auth.session_signed_out_absolute',
  SIGNED_OUT_MANUAL: 'auth.session_signed_out_manual',
} as const;

export type SessionAuditEvent = typeof SESSION_AUDIT_EVENTS[keyof typeof SESSION_AUDIT_EVENTS];

// ═══════════════════════════════════════════════════════════════════════════
// LOGOUT REASON QUERY PARAMS
// ═══════════════════════════════════════════════════════════════════════════

export const LOGOUT_REASONS = {
  IDLE: 'idle',
  ABSOLUTE: 'session-limit',
  MANUAL: 'manual',
} as const;

export type LogoutReason = typeof LOGOUT_REASONS[keyof typeof LOGOUT_REASONS];
