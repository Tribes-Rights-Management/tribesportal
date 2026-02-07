import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Statements — Client Portal
 */
export default function PublishingStatements() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Statements" />
      <AppEmptyState
        message="No statements available"
        description="Royalty statements will appear once processed."
        size="lg"
      />
    </AppPageContainer>
  );
}
