import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * RIGHTS CONTRACTS PAGE
 *
 * Contract management within the Rights module.
 */
export default function RightsContractsPage() {
  return (
    <AppPageLayout title="Contracts">
      <AppEmptyState
        message="No contracts available"
        description="Contract management functionality coming soon."
        size="lg"
      />
    </AppPageLayout>
  );
}
