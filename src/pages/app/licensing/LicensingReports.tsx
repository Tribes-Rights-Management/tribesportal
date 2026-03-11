import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Reports — Legacy client-facing view (/app/licensing)
 */
export default function LicensingReports() {
  return (
    <AppPageLayout title="Reports">
      <AppEmptyState
        message="No reports available"
        description="Reports will appear once data is processed."
        size="lg"
      />
    </AppPageLayout>
  );
}
