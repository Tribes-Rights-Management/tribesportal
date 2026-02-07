import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Registrations — Client Portal
 */
export default function PublishingRegistrations() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Registrations" />
      <AppEmptyState
        message="No registrations available"
        description="Registration records will appear once works are submitted."
        size="lg"
      />
    </AppPageContainer>
  );
}
