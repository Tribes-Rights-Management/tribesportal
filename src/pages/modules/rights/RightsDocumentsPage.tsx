import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * RIGHTS DOCUMENTS PAGE
 *
 * Document management within the Rights module.
 */
export default function RightsDocumentsPage() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Documents" />
      <AppEmptyState
        message="No documents available"
        description="Document management functionality coming soon."
        size="lg"
      />
    </AppPageContainer>
  );
}
