import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { SessionExpiryModal } from './SessionExpiryModal';

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
 */

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const {
    showWarning,
    secondsRemaining,
    isSessionActive,
    extendSession,
    signOutNow,
  } = useSessionTimeout();

  return (
    <>
      {children}
      
      {/* Only render modal if session is active */}
      {isSessionActive && (
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
