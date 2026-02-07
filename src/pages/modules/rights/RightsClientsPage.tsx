import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * RIGHTS CLIENTS PAGE
 *
 * Client management within the Rights module.
 */
export default function RightsClientsPage() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Clients" />
      <AppEmptyState
        message="No clients available"
        description="Client management functionality coming soon."
        size="lg"
      />
    </AppPageContainer>
  );
}
