import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useRouteMetadata } from '@/hooks/useRouteMetadata';
import { supabase } from '@/integrations/supabase/client';
import {
  ACTIVITY_EVENTS,
  SESSION_BROADCAST_CHANNEL,
  SESSION_STORAGE_KEY,
  SESSION_START_KEY,
  SESSION_AUDIT_EVENTS,
  LOGOUT_REASONS,
  getSessionPolicy,
  type SessionPolicy,
} from '@/constants/session-timeout';

/**
 * SESSION TIMEOUT HOOK — INSTITUTIONAL INACTIVITY GOVERNANCE
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CORE RESPONSIBILITIES:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. Track user activity (clicks, keydowns, touch, wheel)
 * 2. Manage idle timer with scope-aware policy
 * 3. Manage absolute session lifetime
 * 4. Cross-tab synchronization via BroadcastChannel + localStorage fallback
 * 5. Trigger warning modal before logout
 * 6. Execute clean logout with audit logging
 * 
 * WHAT DOES NOT COUNT AS ACTIVITY:
 * - Background polling
 * - Websocket messages
 * - Passive data refresh
 * - Tab visibility changes
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
      // Already expired
      executeLogout(LOGOUT_REASONS.ABSOLUTE, SESSION_AUDIT_EVENTS.SIGNED_OUT_ABSOLUTE);
      return;
    }

    // Set absolute timer
    if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
    absoluteTimerRef.current = setTimeout(() => {
      executeLogout(LOGOUT_REASONS.ABSOLUTE, SESSION_AUDIT_EVENTS.SIGNED_OUT_ABSOLUTE);
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

    const handleActivity = () => {
      // Skip if warning is showing (user must click Stay signed in)
      if (showWarning) return;

      lastActivityRef.current = Date.now();
      
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
  }, [isAuthenticated, currentPolicy, showWarning, resetIdleTimer, setupAbsoluteTimer]);

  // ═══════════════════════════════════════════════════════════════════════════
  // POLICY RESOLUTION (scope-aware, role-aware)
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPolicy(null);
      return;
    }

    const policy = getSessionPolicy(isExternalAuditor, scope);
    setCurrentPolicy(policy);
  }, [isAuthenticated, isExternalAuditor, scope]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ROUTE CHANGE = ACTIVITY (if user-initiated)
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isAuthenticated || !currentPolicy) return;
    
    // Route changes count as activity (user navigation)
    markActivity();
    
    // Policy may have changed with route (e.g., entering System Console)
    const newPolicy = getSessionPolicy(isExternalAuditor, scope);
    if (newPolicy.policyLabel !== currentPolicy.policyLabel) {
      setCurrentPolicy(newPolicy);
    }
  }, [location.pathname, isAuthenticated, currentPolicy, isExternalAuditor, scope, markActivity]);

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
