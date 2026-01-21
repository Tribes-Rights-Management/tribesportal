/**
 * SESSION TIMEOUT POLICY — INSTITUTIONAL INACTIVITY GOVERNANCE
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * SESSION POLICY OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. ACTIVE SESSION: 8 hours maximum
 *    - Even with constant activity, session expires after 8 hours
 *    - Forces re-authentication for security
 * 
 * 2. IDLE TIMEOUT: 30 minutes
 *    - 30 minutes of no activity → Show warning dialog
 *    - 2 minutes after warning → Auto sign out
 *    - Any activity resets idle timer (but not 8-hour max timer)
 * 
 * Values are in milliseconds unless otherwise noted.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE TIMEOUT VALUES
// ═══════════════════════════════════════════════════════════════════════════

/** Inactivity timeout in minutes before showing warning */
export const INACTIVITY_TIMEOUT_MINUTES = 30;

/** Warning countdown duration in minutes */
export const WARNING_COUNTDOWN_MINUTES = 2;

/** Maximum session duration in hours (regardless of activity) */
export const ABSOLUTE_SESSION_HOURS = 8;

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
 * Events that reset the idle timer.
 * Includes mouse movement for better UX - throttled to prevent spam.
 * Activity resets IDLE timer only, not the 8-hour max session timer.
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
  /** Absolute session lifetime in milliseconds (8 hours) */
  absoluteLifetimeMs: number;
  /** Warning threshold in milliseconds (2 minutes) */
  warningThresholdMs: number;
  /** Policy label for audit logging */
  policyLabel: string;
}

/**
 * Get session policy - unified policy for all users.
 * 
 * - 8 hours max session (activity doesn't reset this)
 * - 30 minutes idle → warning
 * - 2 minutes after warning → logout
 */
export function getSessionPolicy(
  _isExternalAuditor?: boolean,
  _currentScope?: 'system' | 'organization' | 'user' | 'auth' | 'public'
): SessionPolicy {
  return {
    idleTimeoutMs: INACTIVITY_TIMEOUT_MINUTES * 60 * 1000,           // 30 min
    absoluteLifetimeMs: ABSOLUTE_SESSION_HOURS * 60 * 60 * 1000,     // 8 hours
    warningThresholdMs: WARNING_COUNTDOWN_MINUTES * 60 * 1000,       // 2 min
    policyLabel: 'standard-8h-30m',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const SESSION_AUDIT_EVENTS = {
  WARNING_SHOWN: 'auth.session_idle_warning_shown',
  SIGNED_OUT_IDLE: 'auth.session_signed_out_idle',
  SIGNED_OUT_ABSOLUTE: 'auth.session_signed_out_max_duration',
  SIGNED_OUT_MANUAL: 'auth.session_signed_out_manual',
} as const;

export type SessionAuditEvent = typeof SESSION_AUDIT_EVENTS[keyof typeof SESSION_AUDIT_EVENTS];

// ═══════════════════════════════════════════════════════════════════════════
// LOGOUT REASON QUERY PARAMS
// ═══════════════════════════════════════════════════════════════════════════

export const LOGOUT_REASONS = {
  /** User was idle for 30+ minutes */
  IDLE: 'idle',
  /** Session exceeded 8-hour maximum */
  MAX_SESSION: 'max-session',
  /** User clicked sign out */
  MANUAL: 'manual',
  /** Legacy support */
  ABSOLUTE: 'session-limit',
} as const;

export type LogoutReason = typeof LOGOUT_REASONS[keyof typeof LOGOUT_REASONS];
