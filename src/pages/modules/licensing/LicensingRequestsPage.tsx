import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * LICENSING MODULE — REQUESTS
 *
 * Route: /licensing/requests
 */
export default function LicensingRequestsPage() {
  return (
    <AppPageLayout title="License Requests">
      <AppEmptyState
        icon="inbox"
        message="No requests available"
        description="License requests will appear once submitted."
        size="lg"
      />
    </AppPageLayout>
  );
}
