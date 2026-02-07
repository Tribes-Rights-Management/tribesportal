import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Documents — Client Portal
 */
export default function PublishingDocuments() {
  return (
    <AppPageLayout title="Documents">
      <AppEmptyState
        message="No documents available"
        description="Documents will appear once uploaded to your account."
        size="lg"
      />
    </AppPageLayout>
  );
}
