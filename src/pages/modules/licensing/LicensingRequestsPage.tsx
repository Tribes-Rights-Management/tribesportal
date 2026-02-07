import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * LICENSING MODULE — REQUESTS
 *
 * Route: /licensing/requests
 */
export default function LicensingRequestsPage() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="License Requests" />
      <AppEmptyState
        icon="inbox"
        message="No requests available"
        description="License requests will appear once submitted."
        size="lg"
      />
    </AppPageContainer>
  );
}
