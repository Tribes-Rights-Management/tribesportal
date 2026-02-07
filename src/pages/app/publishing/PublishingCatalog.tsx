import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Catalog — Client Portal
 */
export default function PublishingCatalog() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Catalog" />
      <AppEmptyState
        message="No catalog entries available"
        description="Catalog items will appear once added to your account."
        size="lg"
      />
    </AppPageContainer>
  );
}
