import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * RIGHTS CONTRACTS PAGE
 *
 * Contract management within the Rights module.
 */
export default function RightsContractsPage() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Contracts" />
      <AppEmptyState
        message="No contracts available"
        description="Contract management functionality coming soon."
        size="lg"
      />
    </AppPageContainer>
  );
}
