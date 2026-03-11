import {
  PlatformPageLayout,
  PlatformEmptyState,
} from "@/components/platform-ui";

/**
 * LICENSING MODULE — REQUESTS
 *
 * Route: /licensing/requests
 */
export default function LicensingRequestsPage() {
  return (
    <PlatformPageLayout title="License Requests">
      <PlatformEmptyState
        icon="inbox"
        message="No requests available"
        description="License requests will appear once submitted."
        size="lg"
      />
    </PlatformPageLayout>
  );
}