import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Licenses — Client Portal
 */
export default function LicensingLicenses() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Licenses" />
      <AppEmptyState
        message="No licenses available"
        description="Issued licenses will appear once processed."
        size="lg"
      />
    </AppPageContainer>
  );
}
