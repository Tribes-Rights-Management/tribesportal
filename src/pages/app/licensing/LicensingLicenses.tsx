import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Licenses — Client Portal
 */
export default function LicensingLicenses() {
  return (
    <AppPageLayout title="Licenses">
      <AppEmptyState
        message="No licenses available"
        description="Issued licenses will appear once processed."
        size="lg"
      />
    </AppPageLayout>
  );
}
