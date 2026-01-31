import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield, Building2 } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { DisplayNameEditSheet } from "@/components/settings/DisplayNameEditSheet";
import {
  AppDetailRow,
  AppSettingsCard,
  AppSettingsFooter,
} from "@/components/app-ui";

/**
 * ACCOUNT PROFILE PAGE
 *
 * Route: /account/profile
 *
 * NOTE: Layout/headers/padding are owned by AccountLayout.
 * This page renders content sections only.
 */

export default function AccountProfilePage() {
  const { profile, activeTenant } = useAuth();
  const { preferences, updatePreferences, saving } = useUserPreferences();
  const [showDisplayNameSheet, setShowDisplayNameSheet] = useState(false);

  // Derive role display
  const roleDisplay =
    profile?.platform_role === "platform_admin"
      ? "Platform Administrator"
      : profile?.platform_role === "external_auditor"
        ? "External Auditor"
        : "User";

  // Display name (preference) or fallback to profile full_name
  const displayName = preferences.display_name || profile?.full_name || "";

  const handleSaveDisplayName = async (name: string) => {
    await updatePreferences({ display_name: name });
  };

  return (
    <>
      {/* Section 1: Account Identity (Governed) */}
      <AppSettingsCard
        title="Account Identity"
        description="Managed by workspace policy"
        className="mb-4 md:mb-6"
      >
        <AppDetailRow
          icon={Mail}
          label="Email address"
          value={profile?.email}
          variant="copyable"
          helperText="Primary authentication identifier"
        />
        <AppDetailRow
          icon={Shield}
          label="Authority role"
          value={roleDisplay}
          variant="readonly"
          locked
          lockReason="Managed by workspace policy"
        />
        <AppDetailRow
          icon={Building2}
          label="Workspace"
          value={activeTenant?.tenant_name}
          variant="readonly"
          locked
          lockReason="Managed by workspace policy"
        />
      </AppSettingsCard>

      {/* Section 2: Display Preferences (User-editable) */}
      <AppSettingsCard
        title="Display Preferences"
        description="Shown in activity logs and collaboration surfaces"
      >
        <AppDetailRow
          icon={User}
          label="Display name"
          value={displayName}
          variant="editable"
          ctaLabel="Edit"
          onCta={() => setShowDisplayNameSheet(true)}
          helperText="How your name appears to others"
        />
      </AppSettingsCard>

      <AppSettingsFooter>
        Account identity is governed by workspace policies. Contact your administrator for
        access-related changes.
      </AppSettingsFooter>

      {/* Display Name Edit Sheet */}
      <DisplayNameEditSheet
        open={showDisplayNameSheet}
        onOpenChange={setShowDisplayNameSheet}
        value={displayName}
        onSave={handleSaveDisplayName}
        saving={saving}
      />
    </>
  );
}
