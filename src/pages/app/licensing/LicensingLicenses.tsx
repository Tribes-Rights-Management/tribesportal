import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Licenses — Legacy client-facing view (/app/licensing)
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
