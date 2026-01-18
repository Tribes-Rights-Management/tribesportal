import { useState } from "react";
import { Bell, Globe, Calendar, Clock } from "lucide-react";
import { useUserPreferences, TIMEZONE_OPTIONS, DATE_FORMAT_OPTIONS, TIME_FORMAT_OPTIONS } from "@/hooks/useUserPreferences";
import { EditSelectSheet } from "@/components/edit";
import { SettingsPageContainer } from "@/components/ui/settings-page-container";
import {
  SettingsRow,
  SettingsSectionCard,
  SettingsPageHeader,
  SettingsFooterNotice,
} from "@/components/ui/settings-row";

/**
 * ACCOUNT PREFERENCES PAGE
 * 
 * Route: /account/preferences
 * 
 * User-editable preferences:
 * - Notifications
 * - Regional settings (timezone, date format, time format)
 * 
 * Uses SettingsPageContainer for consistent padding across all settings pages.
 */

type ModalType = "timezone" | "dateFormat" | "timeFormat" | null;

export default function AccountPreferencesPage() {
  const { 
    preferences, 
    updatePreferences, 
    isLocked,
    getTimezoneLabel,
    getDateFormatLabel,
    getTimeFormatLabel,
  } = useUserPreferences();
  
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleTimezoneChange = async (value: string | number) => {
    await updatePreferences({ timezone: value as string });
  };

  const handleDateFormatChange = async (value: string | number) => {
    await updatePreferences({ date_format: value as "iso8601" | "us" | "eu" });
  };

  const handleTimeFormatChange = async (value: string | number) => {
    await updatePreferences({ time_format: value as "12h" | "24h" });
  };

  return (
    <SettingsPageContainer>
      <SettingsPageHeader 
        title="Preferences"
        description="Operational settings and display options"
      />

      {/* Notifications */}
      <SettingsSectionCard
        title="Notifications"
        description="How you receive updates"
        className="mb-4 md:mb-6"
      >
        <SettingsRow
          icon={Bell}
          label="Email notifications"
          value="Enabled"
          variant="readonly"
          locked
          lockReason="Enforced by workspace policy"
        />
      </SettingsSectionCard>

      {/* Regional Settings */}
      <SettingsSectionCard
        title="Regional"
        description="Time and date display preferences"
      >
        <SettingsRow
          icon={Globe}
          label="Time zone"
          value={getTimezoneLabel(preferences.timezone)}
          variant="select"
          onSelect={() => setActiveModal("timezone")}
          locked={isLocked("timezone")}
        />
        <SettingsRow
          icon={Calendar}
          label="Date format"
          value={getDateFormatLabel(preferences.date_format)}
          variant="select"
          onSelect={() => setActiveModal("dateFormat")}
          locked={isLocked("date_format")}
        />
        <SettingsRow
          icon={Clock}
          label="Time format"
          value={getTimeFormatLabel(preferences.time_format)}
          variant="select"
          onSelect={() => setActiveModal("timeFormat")}
          locked={isLocked("time_format")}
        />
      </SettingsSectionCard>

      <SettingsFooterNotice>
        Some preferences may be enforced by workspace policies.
      </SettingsFooterNotice>

      {/* Timezone Selection Sheet */}
      <EditSelectSheet
        open={activeModal === "timezone"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        parentLabel="Preferences"
        title="Time zone"
        helperText="Choose your preferred time zone for date and time display"
        options={TIMEZONE_OPTIONS}
        value={preferences.timezone}
        onChange={handleTimezoneChange}
        disabled={isLocked("timezone")}
      />

      {/* Date Format Selection Sheet */}
      <EditSelectSheet
        open={activeModal === "dateFormat"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        parentLabel="Preferences"
        title="Date format"
        helperText="Choose how dates are displayed throughout the app"
        options={DATE_FORMAT_OPTIONS}
        value={preferences.date_format}
        onChange={handleDateFormatChange}
        disabled={isLocked("date_format")}
      />

      {/* Time Format Selection Sheet */}
      <EditSelectSheet
        open={activeModal === "timeFormat"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        parentLabel="Preferences"
        title="Time format"
        helperText="Choose 12-hour or 24-hour time display"
        options={TIME_FORMAT_OPTIONS}
        value={preferences.time_format}
        onChange={handleTimeFormatChange}
        disabled={isLocked("time_format")}
      />
    </SettingsPageContainer>
  );
}
