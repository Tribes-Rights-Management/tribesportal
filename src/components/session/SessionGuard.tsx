import { useLocation } from 'react-router-dom';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { SessionExpiryModal } from './SessionExpiryModal';
import { AUTH_CALLBACK_ROUTES } from '@/constants/session-timeout';

/**
 * SESSION GUARD — ROOT-LEVEL SESSION TIMEOUT ENFORCEMENT
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * PLACEMENT:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Mount this component inside the authenticated app root, AFTER AuthProvider.
 * It will:
 * - Track user activity
 * - Manage idle and absolute session timers
 * - Sync across tabs
 * - Show warning modal before logout
 * - Execute clean logout with audit logging
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * SCOPE BEHAVIOR:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - System Console: 15 min idle, 8 hour absolute
 * - Organization workspaces: 30 min idle, 12 hour absolute
 * - External Auditor: 15 min idle, 8 hour absolute (overrides scope)
 * 
 * Warning modal appears 2 minutes before idle logout.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH CALLBACK PROTECTION:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Session timeout checks are disabled during auth callback flows to prevent
 * premature session expiry during magic link authentication.
 */

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const location = useLocation();
  const {
    showWarning,
    secondsRemaining,
    isSessionActive,
    extendSession,
    signOutNow,
  } = useSessionTimeout();

  // Check if we're in an auth callback flow
  const isInAuthFlow = AUTH_CALLBACK_ROUTES.some(route => 
    location.pathname.startsWith(route)
  ) || 
  window.location.hash.includes('access_token') ||
  window.location.hash.includes('refresh_token') ||
  window.location.search.includes('code=');

  return (
    <>
      {children}
      
      {/* Only render modal if session is active AND not in auth flow */}
      {isSessionActive && !isInAuthFlow && (
        <SessionExpiryModal
          open={showWarning}
          secondsRemaining={secondsRemaining}
          onExtendSession={extendSession}
          onSignOutNow={signOutNow}
        />
      )}
    </>
  );
}
