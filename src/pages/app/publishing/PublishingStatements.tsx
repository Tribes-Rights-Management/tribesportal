import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Statements — Client Portal
 */
export default function PublishingStatements() {
  return (
    <AppPageLayout title="Statements">
      <AppEmptyState
        message="No statements available"
        description="Royalty statements will appear once processed."
        size="lg"
      />
    </AppPageLayout>
  );
}
