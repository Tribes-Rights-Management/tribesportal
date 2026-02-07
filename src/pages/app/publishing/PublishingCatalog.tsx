import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Catalog — Client Portal
 */
export default function PublishingCatalog() {
  return (
    <AppPageLayout title="Catalog">
      <AppEmptyState
        message="No catalog entries available"
        description="Catalog items will appear once added to your account."
        size="lg"
      />
    </AppPageLayout>
  );
}
