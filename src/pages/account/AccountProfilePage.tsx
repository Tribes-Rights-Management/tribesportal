import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield, Building2 } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { DisplayNameEditModal } from "@/components/settings/DisplayNameEditModal";
import {
  SettingsRow,
  SettingsSectionCard,
  SettingsPageHeader,
  SettingsFooterNotice,
} from "@/components/ui/settings-row";

/**
 * ACCOUNT PROFILE PAGE
 * 
 * Route: /account/profile
 * 
 * Split into:
 * 1) Account Identity (Governed) — Read-only
 * 2) Display Preferences (User-editable)
 */

export default function AccountProfilePage() {
  const { profile, activeTenant } = useAuth();
  const { preferences, updatePreferences, saving } = useUserPreferences();
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);

  // Derive role display
  const roleDisplay = profile?.platform_role === 'platform_admin' 
    ? 'Platform Administrator' 
    : profile?.platform_role === 'external_auditor'
    ? 'External Auditor'
    : 'User';

  // Display name (preference) or fallback to profile full_name
  const displayName = preferences.display_name || profile?.full_name || "";

  const handleSaveDisplayName = async (name: string) => {
    await updatePreferences({ display_name: name });
  };

  return (
    <div 
      className="py-6 md:py-10 px-4 md:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[800px]">
        <SettingsPageHeader 
          title="Profile"
          description="Identity and display preferences"
        />

        {/* Section 1: Account Identity (Governed) */}
        <SettingsSectionCard
          title="Account Identity"
          description="Managed by workspace policy"
          className="mb-4 md:mb-6"
        >
          <SettingsRow
            icon={Mail}
            label="Email address"
            value={profile?.email}
            variant="copyable"
            helperText="Primary authentication identifier"
          />
          <SettingsRow
            icon={Shield}
            label="Authority role"
            value={roleDisplay}
            variant="readonly"
            locked
            lockReason="Managed by workspace policy"
          />
          <SettingsRow
            icon={Building2}
            label="Workspace"
            value={activeTenant?.tenant_name}
            variant="readonly"
            locked
            lockReason="Managed by workspace policy"
          />
        </SettingsSectionCard>

        {/* Section 2: Display Preferences (User-editable) */}
        <SettingsSectionCard
          title="Display Preferences"
          description="Shown in activity logs and collaboration surfaces"
        >
          <SettingsRow
            icon={User}
            label="Display name"
            value={displayName}
            variant="editable"
            ctaLabel="Edit"
            onCta={() => setShowDisplayNameModal(true)}
            helperText="How your name appears to others"
          />
        </SettingsSectionCard>

        <SettingsFooterNotice>
          Account identity is governed by workspace policies. 
          Contact your administrator for access-related changes.
        </SettingsFooterNotice>

        {/* Display Name Edit Modal */}
        <DisplayNameEditModal
          open={showDisplayNameModal}
          onOpenChange={setShowDisplayNameModal}
          value={displayName}
          onSave={handleSaveDisplayName}
          saving={saving}
        />
      </div>
    </div>
  );
}
