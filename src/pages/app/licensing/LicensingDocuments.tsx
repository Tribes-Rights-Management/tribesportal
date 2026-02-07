import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Documents — Client Portal
 */
export default function LicensingDocuments() {
  return (
    <AppPageLayout title="Documents">
      <AppEmptyState
        message="No documents available"
        description="Documents will appear once uploaded."
        size="lg"
      />
    </AppPageLayout>
  );
}
