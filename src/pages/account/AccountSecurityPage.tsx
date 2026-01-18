import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Monitor, Clock, KeyRound, ShieldCheck, Timer } from "lucide-react";
import { useUserPreferences, INACTIVITY_TIMEOUT_OPTIONS } from "@/hooks/useUserPreferences";
import { PreferenceSelectModal } from "@/components/settings/PreferenceSelectModal";
import {
  SettingsRow,
  SettingsSectionCard,
  SettingsPageHeader,
  SettingsFooterNotice,
} from "@/components/ui/settings-row";

/**
 * ACCOUNT SECURITY PAGE
 * 
 * Route: /account/security
 * 
 * Authentication, session management, and security settings.
 */

export default function AccountSecurityPage() {
  const { signOut } = useAuth();
  const { 
    preferences, 
    updatePreferences, 
    isLocked,
    getInactivityTimeoutLabel,
  } = useUserPreferences();

  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
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
    <div 
      className="py-6 md:py-10 px-4 md:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[800px]">
        <SettingsPageHeader 
          title="Security"
          description="Authentication and session management"
        />

        {/* Authentication Method */}
        <SettingsSectionCard
          title="Authentication"
          description="How you sign in to the platform"
          className="mb-4 md:mb-6"
        >
          <SettingsRow
            icon={KeyRound}
            label="Magic Link"
            value="Active"
            variant="readonly"
            helperText="Authentication via secure email verification"
          />
          <SettingsRow
            icon={ShieldCheck}
            label="Two-Factor Authentication"
            value="Not configured"
            variant="readonly"
            helperText="Additional security layer for account access"
          />
        </SettingsSectionCard>

        {/* Session Settings */}
        <SettingsSectionCard
          title="Session"
          description="Session behavior and timeout settings"
          className="mb-4 md:mb-6"
        >
          <SettingsRow
            icon={Timer}
            label="Auto-logout after inactivity"
            value={getInactivityTimeoutLabel(preferences.inactivity_timeout_minutes)}
            variant="select"
            onSelect={() => setShowTimeoutModal(true)}
            locked={isTimeoutLocked}
            lockReason="Enforced by workspace policy"
            helperText={!isTimeoutLocked ? "For security, sessions expire after inactivity" : undefined}
          />
          <SettingsRow
            icon={Monitor}
            label="Current session"
            value="Active"
            variant="readonly"
            helperText="This device is currently active"
          />
          <SettingsRow
            icon={Clock}
            label="Session status"
            value="Your session will remain active until you sign out"
            variant="readonly"
          />
        </SettingsSectionCard>

        {/* Session Actions */}
        <SettingsSectionCard
          title="Session Actions"
          description="Manage your active sessions"
        >
          <div className="px-4 md:px-6 py-4">
            <button
              onClick={handleSignOutAll}
              disabled={signingOut}
              className="text-[13px] font-medium px-4 py-2.5 rounded transition-colors min-h-[44px] disabled:opacity-50"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'var(--platform-text)',
                border: '1px solid var(--platform-border)'
              }}
              onMouseEnter={(e) => {
                if (!signingOut) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
            >
              {signingOut ? "Signing out..." : "Sign out all sessions"}
            </button>
            <p 
              className="text-[12px] mt-3 line-clamp-2"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              This will sign you out from all devices and require re-authentication.
            </p>
          </div>
        </SettingsSectionCard>

        <SettingsFooterNotice>
          Security settings may be governed by workspace policies. 
          Contact your administrator for policy changes.
        </SettingsFooterNotice>

        {/* Inactivity Timeout Selection Modal */}
        <PreferenceSelectModal
          open={showTimeoutModal}
          onOpenChange={setShowTimeoutModal}
          title="Auto-logout timeout"
          description="For security, your session will expire after this period of inactivity"
          options={INACTIVITY_TIMEOUT_OPTIONS}
          value={preferences.inactivity_timeout_minutes}
          onChange={handleTimeoutChange}
          disabled={isTimeoutLocked}
        />
      </div>
    </div>
  );
}
