import {
  AppModal,
  AppModalBody,
  AppModalFooter,
  AppModalAction,
  AppModalCancel,
} from '@/components/ui/app-modal';

/**
 * SESSION EXPIRY MODAL — INSTITUTIONAL INACTIVITY WARNING
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * DESIGN STANDARD (INSTITUTIONAL):
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * - No gamification, no urgency language, no emojis
 * - Calm, professional, security-focused
 * - Uses AppModal for consistent styling
 * - Mobile: bottom sheet with sticky footer
 * - Desktop: centered dialog
 */

interface SessionExpiryModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Seconds remaining until automatic logout */
  secondsRemaining: number;
  /** Callback when user clicks "Stay signed in" */
  onExtendSession: () => void;
  /** Callback when user clicks "Sign out now" */
  onSignOutNow: () => void;
}

export function SessionExpiryModal({
  open,
  secondsRemaining,
  onExtendSession,
  onSignOutNow,
}: SessionExpiryModalProps) {
  // Format seconds as M:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <AppModal
      open={open}
      onOpenChange={() => {
        // Clicking X or outside should extend session (same as "Stay signed in")
        onExtendSession();
      }}
      title="Session expiring"
      maxWidth="sm"
    >
      <AppModalBody>
        <div className="space-y-4">
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            For security, you'll be signed out due to inactivity.
          </p>
          
          {/* Countdown display - calm, not alarming */}
          <div
            className="py-4 px-4 rounded-lg text-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
          >
            <p
              className="text-[13px] mb-1"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Time remaining
            </p>
            <p
              className="text-[28px] font-medium tabular-nums"
              style={{ color: 'var(--platform-text)' }}
            >
              {formattedTime}
            </p>
          </div>
        </div>
      </AppModalBody>

      <AppModalFooter>
        <AppModalCancel onClick={onSignOutNow}>
          Sign out now
        </AppModalCancel>
        <AppModalAction onClick={onExtendSession}>
          Stay signed in
        </AppModalAction>
      </AppModalFooter>
    </AppModal>
  );
}
