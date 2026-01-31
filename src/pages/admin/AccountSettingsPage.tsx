import { Monitor, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  AppPageContainer,
  AppPageHeader,
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
    <AppPageContainer maxWidth="sm">
      <AppPageHeader
        backLink={{ to: "/admin", label: "Back" }}
        title="Account Settings"
        description="Profile, preferences, and security configuration"
      />

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
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded flex items-center justify-center shrink-0 mt-0.5 bg-muted/50">
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-foreground">
                Authentication method
              </p>
              <p className="text-[13px] mt-0.5 text-muted-foreground">
                Magic Link (email verification)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded flex items-center justify-center shrink-0 mt-0.5 bg-muted/50">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-foreground">
                Session status
              </p>
              <p className="text-[13px] mt-0.5 text-muted-foreground">
                Active session on this device
              </p>
            </div>
          </div>
        </div>
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
    </AppPageContainer>
  );
}
