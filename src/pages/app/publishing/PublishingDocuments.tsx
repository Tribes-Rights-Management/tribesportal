import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Documents — Client Portal
 */
export default function PublishingDocuments() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Documents" />
      <AppEmptyState
        message="No documents available"
        description="Documents will appear once uploaded to your account."
        size="lg"
      />
    </AppPageContainer>
  );
}
