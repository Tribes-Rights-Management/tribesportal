import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Reports — Client Portal
 */
export default function LicensingReports() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Reports" />
      <AppEmptyState
        message="No reports available"
        description="Reports will appear once data is processed."
        size="lg"
      />
    </AppPageContainer>
  );
}
