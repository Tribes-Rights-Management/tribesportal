import { useState } from "react";
import { Bell, Globe, Calendar, Clock, SlidersHorizontal } from "lucide-react";
import {
  useUserPreferences,
  TIMEZONE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  UI_DENSITY_OPTIONS,
} from "@/hooks/useUserPreferences";
import { EditSelectSheet } from "@/components/edit";
import {
  AppDetailRow,
  AppSettingsCard,
  AppSettingsFooter,
} from "@/components/app-ui";

/**
 * ACCOUNT PREFERENCES PAGE
 *
 * Route: /account/preferences
 *
 * NOTE: Layout/headers/padding are owned by AccountLayout.
 * This page renders content sections only.
 */

type ModalType = "timezone" | "dateFormat" | "timeFormat" | "uiDensity" | null;

export default function AccountPreferencesPage() {
  const {
    preferences,
    updatePreferences,
    isLocked,
    getTimezoneLabel,
    getDateFormatLabel,
    getTimeFormatLabel,
    getUiDensityLabel,
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

  const handleUiDensityChange = async (value: string | number) => {
    await updatePreferences({ ui_density_mode: value as "comfortable" | "compact" });
  };

  return (
    <>
      {/* Interface */}
      <AppSettingsCard
        title="Interface"
        description="Visual density and interaction preferences"
        className="mb-4 md:mb-6"
      >
        <AppDetailRow
          icon={SlidersHorizontal}
          label="Information density"
          value={getUiDensityLabel(preferences.ui_density_mode)}
          variant="select"
          onSelect={() => setActiveModal("uiDensity")}
          locked={isLocked("ui_density_mode")}
        />
      </AppSettingsCard>

      {/* Notifications */}
      <AppSettingsCard
        title="Notifications"
        description="How you receive updates"
        className="mb-4 md:mb-6"
      >
        <AppDetailRow
          icon={Bell}
          label="Email notifications"
          value="Enabled"
          variant="readonly"
          locked
          lockReason="Enforced by workspace policy"
        />
      </AppSettingsCard>

      {/* Regional Settings */}
      <AppSettingsCard title="Regional" description="Time and date display preferences">
        <AppDetailRow
          icon={Globe}
          label="Time zone"
          value={getTimezoneLabel(preferences.timezone)}
          variant="select"
          onSelect={() => setActiveModal("timezone")}
          locked={isLocked("timezone")}
        />
        <AppDetailRow
          icon={Calendar}
          label="Date format"
          value={getDateFormatLabel(preferences.date_format)}
          variant="select"
          onSelect={() => setActiveModal("dateFormat")}
          locked={isLocked("date_format")}
        />
        <AppDetailRow
          icon={Clock}
          label="Time format"
          value={getTimeFormatLabel(preferences.time_format)}
          variant="select"
          onSelect={() => setActiveModal("timeFormat")}
          locked={isLocked("time_format")}
        />
      </AppSettingsCard>

      <AppSettingsFooter>Some preferences may be enforced by workspace policies.</AppSettingsFooter>

      {/* UI Density Selection Sheet */}
      <EditSelectSheet
        open={activeModal === "uiDensity"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        parentLabel="Preferences"
        title="Information density"
        helperText="Choose how much content fits on screen"
        options={UI_DENSITY_OPTIONS}
        value={preferences.ui_density_mode}
        onChange={handleUiDensityChange}
        disabled={isLocked("ui_density_mode")}
      />

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
    </>
  );
}
