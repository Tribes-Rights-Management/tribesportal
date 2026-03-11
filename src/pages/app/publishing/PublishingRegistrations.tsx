import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Registrations — Legacy client-facing view (/app/publishing)
 */
export default function PublishingRegistrations() {
  return (
    <AppPageLayout title="Registrations">
      <AppEmptyState
        message="No registrations available"
        description="Registration records will appear once works are submitted."
        size="lg"
      />
    </AppPageLayout>
  );
}
