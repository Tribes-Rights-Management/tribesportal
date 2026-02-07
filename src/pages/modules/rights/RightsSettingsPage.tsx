import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * RIGHTS SETTINGS PAGE
 *
 * Settings for the Rights module.
 */
export default function RightsSettingsPage() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Settings" />
      <AppEmptyState
        message="No settings available"
        description="Settings functionality coming soon."
        size="lg"
      />
    </AppPageContainer>
  );
}
