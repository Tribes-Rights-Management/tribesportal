import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Works — Client Portal
 */
export default function PublishingWorks() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Works" />
      <AppEmptyState
        message="No works available"
        description="Works will appear once added to your catalog."
        size="lg"
      />
    </AppPageContainer>
  );
}
