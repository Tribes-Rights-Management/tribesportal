import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/platform-ui";

/**
 * RIGHTS SETTINGS PAGE
 *
 * Settings for the Rights module.
 */
export default function RightsSettingsPage() {
  return (
    <AppPageLayout title="Settings">
      <AppEmptyState
        message="No settings available"
        description="Settings functionality coming soon."
        size="lg"
      />
    </AppPageLayout>
  );
}
