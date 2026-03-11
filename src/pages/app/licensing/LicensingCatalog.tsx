import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Catalog — Legacy client-facing view (/app/licensing)
 */
export default function LicensingCatalog() {
  return (
    <AppPageLayout title="Catalog">
      <AppEmptyState
        message="No catalog entries available"
        description="Catalog items will appear once added."
        size="lg"
      />
    </AppPageLayout>
  );
}
