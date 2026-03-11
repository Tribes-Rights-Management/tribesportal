import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Statements — Legacy client-facing view (/app/publishing)
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
