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
// APPLE-STANDARD SESSION TIMEOUT POLICY
// ═══════════════════════════════════════════════════════════════════════════
// 
// Simplified, universal timeout policy:
// - 30 minutes inactivity → Show warning dialog
// - 2 minutes after warning → Auto sign out
// - Total: 32 minutes from last activity to sign out
//
// This matches Apple's approach: Long enough to not annoy, short enough 
// to be secure, with clear warning before action.

/** Universal inactivity timeout in minutes (Apple standard) */
export const INACTIVITY_TIMEOUT_MINUTES = 30;

/** Warning countdown duration in minutes */
export const WARNING_COUNTDOWN_MINUTES = 2;

/** Absolute session lifetime in hours (after this, force re-auth regardless of activity) */
export const ABSOLUTE_SESSION_HOURS = 12;

// Legacy exports for backward compatibility
export const IDLE_TIMEOUT_MINUTES = {
  SYSTEM_CONSOLE: INACTIVITY_TIMEOUT_MINUTES,
  ORGANIZATION: INACTIVITY_TIMEOUT_MINUTES,
  EXTERNAL_AUDITOR: INACTIVITY_TIMEOUT_MINUTES,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// WARNING THRESHOLD
// ═══════════════════════════════════════════════════════════════════════════

/** Warning modal appears this many minutes before idle logout */
export const WARNING_THRESHOLD_MINUTES = WARNING_COUNTDOWN_MINUTES;

// ═══════════════════════════════════════════════════════════════════════════
// AUTH GRACE PERIOD
// ═══════════════════════════════════════════════════════════════════════════

/** Grace period after login before session timeout monitoring begins (seconds) */
export const AUTH_GRACE_PERIOD_SECONDS = 60;

/** Routes that are considered auth callback flows (session checks disabled) */
export const AUTH_CALLBACK_ROUTES = ['/auth/callback', '/auth/sign-in'] as const;

/** localStorage key for auth grace period start time */
export const AUTH_GRACE_KEY = 'tribes-auth-grace-start';

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
 * Events that reset the idle timer (Apple standard).
 * Includes mouse movement for better UX - throttled to prevent spam.
 */
export const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'wheel',
] as const;

/** Throttle interval for activity detection (ms) - max once per 5 seconds */
export const ACTIVITY_THROTTLE_MS = 5000;

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
 * Get session policy - now unified Apple-standard policy for all users.
 * Scope and role parameters kept for backward compatibility but ignored.
 */
export function getSessionPolicy(
  _isExternalAuditor?: boolean,
  _currentScope?: 'system' | 'organization' | 'user' | 'auth' | 'public'
): SessionPolicy {
  // Universal Apple-standard policy: 30 min idle, 2 min warning, 12 hour absolute
  return {
    idleTimeoutMs: INACTIVITY_TIMEOUT_MINUTES * 60 * 1000,
    absoluteLifetimeMs: ABSOLUTE_SESSION_HOURS * 60 * 60 * 1000,
    warningThresholdMs: WARNING_COUNTDOWN_MINUTES * 60 * 1000,
    policyLabel: 'standard',
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
