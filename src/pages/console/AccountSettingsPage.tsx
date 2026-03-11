import { useAuth } from "@/contexts/AuthContext";
import {
  AppPageLayout,
  AppDetailRow,
  AppSettingsCard,
  AppSettingsFooter,
} from "@/components/app-ui";

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
    <AppPageLayout
      title="Account Settings"
      backLink={{ to: "/admin", label: "Back" }}
      maxWidth="sm"
    >
      {/* Profile Information */}
      <AppSettingsCard
        title="Profile Information"
        description="Identity and organizational association"
        className="mb-4 md:mb-6"
      >
        <AppDetailRow
          label="Full name"
          value={profile?.full_name}
          variant="readonly"
        />
        <AppDetailRow
          label="Email address"
          value={profile?.email}
          variant="copyable"
          locked
          lockReason="Managed by organization policy"
        />
        <AppDetailRow
          label="Role"
          value={roleDisplay}
          variant="readonly"
          locked
          lockReason="Managed by organization policy"
        />
        <AppDetailRow
          label="Organization"
          value={activeTenant?.tenant_name}
          variant="readonly"
          locked
          lockReason="Managed by organization policy"
        />
      </AppSettingsCard>

      {/* Security */}
      <AppSettingsCard
        title="Security"
        description="Authentication and session management"
        className="mb-4 md:mb-6"
      >
        <AppDetailRow
          label="Authentication method"
          value="Magic Link (email verification)"
          variant="readonly"
        />
        <AppDetailRow
          label="Session status"
          value="Active session on this device"
          variant="readonly"
        />
      </AppSettingsCard>

      {/* Preferences */}
      <AppSettingsCard
        title="Preferences"
        description="Operational settings"
      >
        <AppDetailRow
          label="Time zone"
          value="System default (auto-detected)"
          variant="readonly"
        />
        <AppDetailRow
          label="Date format"
          value="ISO 8601 (YYYY-MM-DD)"
          variant="readonly"
        />
        <AppDetailRow
          label="Notifications"
          value="Email notifications enabled"
          variant="readonly"
        />
      </AppSettingsCard>

      <AppSettingsFooter>
        Account configuration is governed by organizational policies. 
        Contact your administrator for access-related changes.
      </AppSettingsFooter>
    </AppPageLayout>
  );
}
