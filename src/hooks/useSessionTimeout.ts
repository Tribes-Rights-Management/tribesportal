import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useRouteMetadata } from '@/hooks/useRouteMetadata';
import { supabase } from '@/integrations/supabase/client';
import {
  ACTIVITY_EVENTS,
  ACTIVITY_THROTTLE_MS,
  SESSION_BROADCAST_CHANNEL,
  SESSION_STORAGE_KEY,
  SESSION_START_KEY,
  SESSION_AUDIT_EVENTS,
  LOGOUT_REASONS,
  AUTH_GRACE_PERIOD_SECONDS,
  AUTH_CALLBACK_ROUTES,
  AUTH_GRACE_KEY,
  getSessionPolicy,
  type SessionPolicy,
} from '@/constants/session-timeout';

/**
 * SESSION TIMEOUT HOOK — APPLE-STANDARD INACTIVITY GOVERNANCE
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * APPLE-STANDARD TIMEOUT POLICY:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - 30 minutes inactivity → Show warning dialog
 * - 2 minutes after warning → Auto sign out
 * - Total: 32 minutes from last activity to sign out
 * 
 * ACTIVITY DETECTION (resets timer):
 * - Mouse movement (throttled to max once per 5 seconds)
 * - Mouse clicks
 * - Keyboard input
 * - Touch events
 * - Scroll/wheel events
 * - Page navigation
 * 
 * Cross-tab synchronization via BroadcastChannel + localStorage fallback.
 */

interface SessionTimeoutState {
  /** Whether the warning modal should be shown */
  showWarning: boolean;
  /** Seconds remaining until logout (for countdown) */
  secondsRemaining: number;
  /** Current session policy being applied */
  currentPolicy: SessionPolicy | null;
  /** Whether session is active (user is authenticated) */
  isSessionActive: boolean;
}

interface SessionTimeoutActions {
  /** User clicked "Stay signed in" - reset idle timer */
  extendSession: () => void;
  /** User clicked "Sign out now" - immediate logout */
  signOutNow: () => void;
  /** Mark activity from navigation (for API-triggered navigation) */
  markActivity: () => void;
}

export type UseSessionTimeoutResult = SessionTimeoutState & SessionTimeoutActions;

/**
 * Cross-tab message types
 */
type SessionMessage =
  | { type: 'activity'; timestamp: number }
  | { type: 'logout'; reason: string }
  | { type: 'extend-session' };

export function useSessionTimeout(): UseSessionTimeoutResult {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, profile } = useAuth();
  const { isExternalAuditor } = useRoleAccess();
  const { scope } = useRouteMetadata();

  // State
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [currentPolicy, setCurrentPolicy] = useState<SessionPolicy | null>(null);

  // Refs for timer management (avoid stale closures)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const absoluteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const isAuthenticated = !!user && !!profile;

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH CALLBACK & GRACE PERIOD DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check if we're currently in an auth callback flow.
   * Session timeout checks should be disabled during these flows.
   */
  const isInAuthFlow = useCallback(() => {
    const currentPath = location.pathname;
    
    // Check if on auth callback routes
    if (AUTH_CALLBACK_ROUTES.some(route => currentPath.startsWith(route))) {
      return true;
    }
    
    // Check for auth tokens in URL (magic link processing)
    const hasAuthHash = window.location.hash.includes('access_token') ||
                        window.location.hash.includes('refresh_token') ||
                        window.location.hash.includes('type=');
    const hasAuthQuery = window.location.search.includes('code=') ||
                         window.location.search.includes('token=');
    
    if (hasAuthHash || hasAuthQuery) {
      return true;
    }
    
    return false;
  }, [location.pathname]);

  /**
   * Check if we're still within the post-login grace period.
   * Returns true if session monitoring should be suspended.
   */
  const isInGracePeriod = useCallback(() => {
    const graceStart = localStorage.getItem(AUTH_GRACE_KEY);
    if (!graceStart) return false;
    
    const graceStartTime = parseInt(graceStart, 10);
    const elapsed = (Date.now() - graceStartTime) / 1000;
    
    return elapsed < AUTH_GRACE_PERIOD_SECONDS;
  }, []);

  /**
   * Start the grace period after successful authentication.
   */
  const startGracePeriod = useCallback(() => {
    localStorage.setItem(AUTH_GRACE_KEY, Date.now().toString());
  }, []);

  /**
   * Clear the grace period marker.
   */
  const clearGracePeriod = useCallback(() => {
    localStorage.removeItem(AUTH_GRACE_KEY);
  }, []);

  /**
   * Combined check: should session timeout monitoring be active?
   */
  const shouldMonitorSession = useCallback(() => {
    if (isInAuthFlow()) return false;
    if (isInGracePeriod()) return false;
    return true;
  }, [isInAuthFlow, isInGracePeriod]);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT LOGGING
  // ═══════════════════════════════════════════════════════════════════════════

  const logAuditEvent = useCallback(async (
    eventType: string,
    details: Record<string, unknown> = {}
  ) => {
    if (!user?.id) return;

    try {
      await supabase.rpc('log_audit_event', {
        _action: 'logout' as const,
        _action_label: eventType,
        _details: {
          ...details,
          scope: scope,
          session_id: sessionStartRef.current?.toString(),
          timestamp: new Date().toISOString(),
        },
        _record_type: 'session',
      });
    } catch (error) {
      // Silent fail - don't block logout on audit failure
      console.error('Failed to log session audit event:', error);
    }
  }, [user?.id, scope]);

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGOUT EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════

  const executeLogout = useCallback(async (reason: string, auditEvent: string) => {
    // Clear all timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Log audit event
    await logAuditEvent(auditEvent, { reason });

    // Broadcast logout to other tabs
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'logout', reason });
    }

    // Also use localStorage for fallback
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      type: 'logout',
      reason,
      timestamp: Date.now(),
    }));

    // Clear session start
    localStorage.removeItem(SESSION_START_KEY);

    // Sign out via Supabase
    await signOut();

    // Navigate to auth with reason
    navigate(`/auth/sign-in?reason=${reason}`, { replace: true });
  }, [logAuditEvent, signOut, navigate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION EXTENSION (user clicked "Stay signed in")
  // ═══════════════════════════════════════════════════════════════════════════

  const extendSession = useCallback(() => {
    setShowWarning(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Broadcast extension to other tabs
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'extend-session' });
    }

    // Reset activity timestamp
    lastActivityRef.current = Date.now();
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      type: 'activity',
      timestamp: lastActivityRef.current,
    }));

    // Restart idle timer (will be handled by resetIdleTimer in effect)
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // MANUAL SIGN OUT
  // ═══════════════════════════════════════════════════════════════════════════

  const signOutNow = useCallback(() => {
    executeLogout(LOGOUT_REASONS.MANUAL, SESSION_AUDIT_EVENTS.SIGNED_OUT_MANUAL);
  }, [executeLogout]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVITY MARKING (for programmatic activity, e.g., API-triggered navigation)
  // ═══════════════════════════════════════════════════════════════════════════

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Broadcast to other tabs
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'activity',
        timestamp: lastActivityRef.current,
      });
    }

    // Also update localStorage for fallback
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      type: 'activity',
      timestamp: lastActivityRef.current,
    }));
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // IDLE TIMER RESET
  // ═══════════════════════════════════════════════════════════════════════════

  const resetIdleTimer = useCallback((policy: SessionPolicy) => {
    // Clear existing timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Hide warning if shown
    if (showWarning) {
      setShowWarning(false);
    }

    // Set warning timer (fires at idle - warning threshold)
    const timeUntilWarning = policy.idleTimeoutMs - policy.warningThresholdMs;
    warningTimerRef.current = setTimeout(() => {
      // Show warning modal
      setShowWarning(true);
      setSecondsRemaining(Math.floor(policy.warningThresholdMs / 1000));

      // Log warning shown audit event
      logAuditEvent(SESSION_AUDIT_EVENTS.WARNING_SHOWN, {
        policy: policy.policyLabel,
      });

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - execute logout
            executeLogout(LOGOUT_REASONS.IDLE, SESSION_AUDIT_EVENTS.SIGNED_OUT_IDLE);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeUntilWarning);
  }, [showWarning, logAuditEvent, executeLogout]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ABSOLUTE SESSION LIFETIME
  // ═══════════════════════════════════════════════════════════════════════════

  const setupAbsoluteTimer = useCallback((policy: SessionPolicy) => {
    // Get or set session start time
    let sessionStart = sessionStartRef.current;
    
    if (!sessionStart) {
      const storedStart = localStorage.getItem(SESSION_START_KEY);
      if (storedStart) {
        sessionStart = parseInt(storedStart, 10);
      } else {
        sessionStart = Date.now();
        localStorage.setItem(SESSION_START_KEY, sessionStart.toString());
      }
      sessionStartRef.current = sessionStart;
    }

    // Calculate remaining time
    const elapsed = Date.now() - sessionStart;
    const remaining = policy.absoluteLifetimeMs - elapsed;

    if (remaining <= 0) {
      // Already expired - 8 hour max session reached
      executeLogout(LOGOUT_REASONS.MAX_SESSION, SESSION_AUDIT_EVENTS.SIGNED_OUT_ABSOLUTE);
      return;
    }

    // Set absolute timer for 8-hour max session
    if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
    absoluteTimerRef.current = setTimeout(() => {
      executeLogout(LOGOUT_REASONS.MAX_SESSION, SESSION_AUDIT_EVENTS.SIGNED_OUT_ABSOLUTE);
    }, remaining);
  }, [executeLogout]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CROSS-TAB SYNC SETUP
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isAuthenticated) return;

    // Setup BroadcastChannel (preferred)
    try {
      broadcastChannelRef.current = new BroadcastChannel(SESSION_BROADCAST_CHANNEL);
      
      broadcastChannelRef.current.onmessage = (event: MessageEvent<SessionMessage>) => {
        const message = event.data;
        
        switch (message.type) {
          case 'activity':
            // Another tab had activity - update our last activity
            lastActivityRef.current = message.timestamp;
            break;
            
          case 'logout':
            // Another tab logged out - follow suit
            signOut().then(() => {
              navigate(`/auth/sign-in?reason=${message.reason}`, { replace: true });
            });
            break;
            
          case 'extend-session':
            // Another tab extended - hide our warning
            setShowWarning(false);
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            break;
        }
      };
    } catch {
      // BroadcastChannel not supported - use localStorage fallback only
    }

    // localStorage fallback listener
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== SESSION_STORAGE_KEY || !event.newValue) return;

      try {
        const message = JSON.parse(event.newValue) as SessionMessage;
        
        switch (message.type) {
          case 'activity':
            lastActivityRef.current = message.timestamp;
            break;
            
          case 'logout':
            signOut().then(() => {
              navigate(`/auth/sign-in?reason=${message.reason}`, { replace: true });
            });
            break;
            
          case 'extend-session':
            setShowWarning(false);
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            break;
        }
      } catch {
        // Invalid JSON - ignore
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
    };
  }, [isAuthenticated, navigate, signOut]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVITY EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isAuthenticated || !currentPolicy) return;
    
    // Don't start monitoring during auth flow or grace period
    if (!shouldMonitorSession()) {
      // Check again after grace period ends
      const checkInterval = setInterval(() => {
        if (shouldMonitorSession()) {
          clearGracePeriod();
          clearInterval(checkInterval);
          // Force re-render to start monitoring
          setCurrentPolicy({ ...currentPolicy });
        }
      }, 1000);
      
      return () => clearInterval(checkInterval);
    }

    // Throttle activity detection (max once per ACTIVITY_THROTTLE_MS)
    let lastActivityTime = Date.now();
    
    const handleActivity = () => {
      // Skip if warning is showing (user must click Stay signed in)
      if (showWarning) return;

      // Throttle: only register activity if enough time has passed
      const now = Date.now();
      if (now - lastActivityTime < ACTIVITY_THROTTLE_MS) return;
      lastActivityTime = now;

      lastActivityRef.current = now;
      
      // Broadcast to other tabs
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'activity',
          timestamp: lastActivityRef.current,
        });
      }

      // Update localStorage for fallback
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        type: 'activity',
        timestamp: lastActivityRef.current,
      }));

      // Reset idle timer
      resetIdleTimer(currentPolicy);
    };

    // Add event listeners
    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup
    resetIdleTimer(currentPolicy);
    setupAbsoluteTimer(currentPolicy);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isAuthenticated, currentPolicy, showWarning, resetIdleTimer, setupAbsoluteTimer, shouldMonitorSession, clearGracePeriod]);

  // ═══════════════════════════════════════════════════════════════════════════
  // POLICY RESOLUTION (Apple-standard: unified 30-min timeout)
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPolicy(null);
      return;
    }

    // Start grace period when user becomes authenticated
    if (!localStorage.getItem(AUTH_GRACE_KEY)) {
      startGracePeriod();
    }

    // Apple-standard: same policy for everyone
    const policy = getSessionPolicy();
    setCurrentPolicy(policy);
  }, [isAuthenticated, startGracePeriod]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ROUTE CHANGE = ACTIVITY
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isAuthenticated || !currentPolicy) return;
    
    // Route changes count as activity (user navigation)
    markActivity();
  }, [location.pathname, isAuthenticated, currentPolicy, markActivity]);

  return {
    showWarning,
    secondsRemaining,
    currentPolicy,
    isSessionActive: isAuthenticated,
    extendSession,
    signOutNow,
    markActivity,
  };
}
