import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Documents — Client Portal
 */
export default function LicensingDocuments() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Documents" />
      <AppEmptyState
        message="No documents available"
        description="Documents will appear once uploaded."
        size="lg"
      />
    </AppPageContainer>
  );
}
