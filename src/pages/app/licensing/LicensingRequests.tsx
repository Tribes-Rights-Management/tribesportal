import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Requests — Legacy client-facing view (/app/licensing)
 */
export default function LicensingRequests() {
  return (
    <AppPageLayout title="Requests">
      <AppEmptyState
        message="No requests available"
        description="Licensing requests will appear once submitted."
        size="lg"
      />
    </AppPageLayout>
  );
}
