import { useAuth } from "@/contexts/AuthContext";
import {
  PlatformPageLayout,
  PlatformDetailRow,
  PlatformSettingsCard,
  PlatformSettingsFooter,
} from "@/components/platform-ui";

/**
 * ACCOUNT SETTINGS PAGE — INSTITUTIONAL GOVERNANCE SURFACE
 * 
 * Route: /admin/account-settings
 * 
 * Design Rules:
 * - Real page, never a 404
 * - Graceful degradation over error states
 * - Functional sections only (no placeholders, no "Coming Soon")
 * - Institutional, restrained styling
 * - Read-only organizational data where applicable
 */

export default function AccountSettingsPage() {
  const { profile, activeTenant } = useAuth();

  // Derive role display
  const roleDisplay = profile?.platform_role === 'platform_admin' 
    ? 'Platform Administrator' 
    : 'User';

  return (
    <PlatformPageLayout
      title="Account Settings"
      backLink={{ to: "/admin", label: "Back" }}
      maxWidth="sm"
    >
      {/* Profile Information */}
      <PlatformSettingsCard
        title="Profile Information"
        description="Identity and organizational association"
        className="mb-4 md:mb-6"
      >
        <PlatformDetailRow
          label="Full name"
          value={profile?.full_name}
          variant="readonly"
        />
        <PlatformDetailRow
          label="Email address"
          value={profile?.email}
          variant="copyable"
          locked
          lockReason="Managed by organization policy"
        />
        <PlatformDetailRow
          label="Role"
          value={roleDisplay}
          variant="readonly"
          locked
          lockReason="Managed by organization policy"
        />
        <PlatformDetailRow
          label="Organization"
          value={activeTenant?.tenant_name}
          variant="readonly"
          locked
          lockReason="Managed by organization policy"
        />
      </PlatformSettingsCard>

      {/* Security */}
      <PlatformSettingsCard
        title="Security"
        description="Authentication and session management"
        className="mb-4 md:mb-6"
      >
        <PlatformDetailRow
          label="Authentication method"
          value="Magic Link (email verification)"
          variant="readonly"
        />
        <PlatformDetailRow
          label="Session status"
          value="Active session on this device"
          variant="readonly"
        />
      </PlatformSettingsCard>

      {/* Preferences */}
      <PlatformSettingsCard
        title="Preferences"
        description="Operational settings"
      >
        <PlatformDetailRow
          label="Time zone"
          value="System default (auto-detected)"
          variant="readonly"
        />
        <PlatformDetailRow
          label="Date format"
          value="ISO 8601 (YYYY-MM-DD)"
          variant="readonly"
        />
        <PlatformDetailRow
          label="Notifications"
          value="Email notifications enabled"
          variant="readonly"
        />
      </PlatformSettingsCard>

      <PlatformSettingsFooter>
        Account configuration is governed by organizational policies. 
        Contact your administrator for access-related changes.
      </PlatformSettingsFooter>
    </PlatformPageLayout>
  );
}