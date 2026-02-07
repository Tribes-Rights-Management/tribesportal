import {
  AppPageContainer,
  AppPageHeader,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Payments — Client Portal
 */
export default function PublishingPayments() {
  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader title="Payments" />
      <AppEmptyState
        message="No payments available"
        description="Payment records will appear once transactions are processed."
        size="lg"
      />
    </AppPageContainer>
  );
}
