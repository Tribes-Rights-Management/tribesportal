import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Splits — Client Portal
 */
export default function PublishingSplits() {
  return (
    <AppPageLayout title="Splits">
      <AppEmptyState
        message="No splits available"
        description="Ownership splits will appear once configured for your works."
        size="lg"
      />
    </AppPageLayout>
  );
}
