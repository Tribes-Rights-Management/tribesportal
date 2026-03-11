import {
  PlatformPageLayout,
  PlatformEmptyState,
} from "@/components/platform-ui";

/**
 * RIGHTS SETTINGS PAGE
 *
 * Settings for the Rights module.
 */
export default function RightsSettingsPage() {
  return (
    <PlatformPageLayout title="Settings">
      <PlatformEmptyState
        message="No settings available"
        description="Settings functionality coming soon."
        size="lg"
      />
    </PlatformPageLayout>
  );
}