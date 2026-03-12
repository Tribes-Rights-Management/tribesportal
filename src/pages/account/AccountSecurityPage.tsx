import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Monitor, Clock, KeyRound, ShieldCheck, Timer } from "lucide-react";
import { useUserPreferences, INACTIVITY_TIMEOUT_OPTIONS } from "@/hooks/useUserPreferences";
import { EditSelectSheet } from "@/components/edit";
import {
  PlatformButton,
  PlatformDetailRow,
  PlatformSettingsCard,
  PlatformSettingsFooter,
} from "@/components/platform-ui";

/**
 * ACCOUNT SECURITY PAGE
 *
 * Route: /account/security
 *
 * NOTE: Layout/headers/padding are owned by AccountLayout.
 * This page renders content sections only.
 */

export default function AccountSecurityPage() {
  const { signOut } = useAuth();
  const {
    preferences,
    updatePreferences,
    isLocked,
    getInactivityTimeoutLabel,
  } = useUserPreferences();

  const [showTimeoutSheet, setShowTimeoutSheet] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOutAll = async () => {
    setSigningOut(true);
    try {
      await signOut();
      window.location.href = "/auth/sign-in";
    } catch (error) {
      setSigningOut(false);
    }
  };

  const handleTimeoutChange = async (value: string | number) => {
    await updatePreferences({ inactivity_timeout_minutes: value as number });
  };

  // Check if workspace policy enforces a stricter timeout
  const isTimeoutLocked = isLocked("inactivity_timeout_minutes");

  return (
    <>
      {/* Authentication Method */}
      <PlatformSettingsCard
        title="Authentication"
        description="How you sign in to the platform"
        className="mb-4 md:mb-6"
      >
        <PlatformDetailRow
          icon={KeyRound}
          label="Magic Link"
          value="Active"
          variant="readonly"
          helperText="Authentication via secure email verification"
        />
        <PlatformDetailRow
          icon={ShieldCheck}
          label="Two-Factor Authentication"
          value="Not configured"
          variant="readonly"
          helperText="Additional security layer for account access"
        />
      </PlatformSettingsCard>

      {/* Session Settings */}
      <PlatformSettingsCard
        title="Session"
        description="Session behavior and timeout settings"
        className="mb-4 md:mb-6"
      >
        <PlatformDetailRow
          icon={Timer}
          label="Auto-logout after inactivity"
          value={getInactivityTimeoutLabel(preferences.inactivity_timeout_minutes)}
          variant="select"
          onSelect={() => setShowTimeoutSheet(true)}
          locked={isTimeoutLocked}
          lockReason="Enforced by workspace policy"
          helperText={!isTimeoutLocked ? "For security, sessions expire after inactivity" : undefined}
        />
        <PlatformDetailRow
          icon={Monitor}
          label="Current session"
          value="Active"
          variant="readonly"
          helperText="This device is currently active"
        />
        <PlatformDetailRow
          icon={Clock}
          label="Session status"
          value="Your session will remain active until you sign out"
          variant="readonly"
        />
      </PlatformSettingsCard>

      {/* Session Actions */}
      <PlatformSettingsCard
        title="Session Actions"
        description="Manage your active sessions"
      >
        <div className="px-4 py-4">
          <PlatformButton
            onClick={handleSignOutAll}
            disabled={signingOut}
            loading={signingOut}
            loadingText="Signing out..."
            intent="secondary"
            size="md"
          >
            Sign out all sessions
          </PlatformButton>
          <p className="text-[12px] mt-3 line-clamp-2 text-muted-foreground">
            This will sign you out from all devices and require re-authentication.
          </p>
        </div>
      </PlatformSettingsCard>

      <PlatformSettingsFooter>
        Security settings may be governed by workspace policies.
        Contact your administrator for policy changes.
      </PlatformSettingsFooter>

      {/* Inactivity Timeout Selection Sheet */}
      <EditSelectSheet
        open={showTimeoutSheet}
        onOpenChange={setShowTimeoutSheet}
        parentLabel="Security"
        title="Auto-logout timeout"
        helperText="For security, your session will expire after this period of inactivity"
        options={INACTIVITY_TIMEOUT_OPTIONS}
        value={preferences.inactivity_timeout_minutes}
        onChange={handleTimeoutChange}
        disabled={isTimeoutLocked}
      />
    </>
  );
}
