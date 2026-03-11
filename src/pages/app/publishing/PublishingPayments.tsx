import {
  AppPageLayout,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * Payments — Legacy client-facing view (/app/publishing)
 */
export default function PublishingPayments() {
  return (
    <AppPageLayout title="Payments">
      <AppEmptyState
        message="No payments available"
        description="Payment records will appear once transactions are processed."
        size="lg"
      />
    </AppPageLayout>
  );
}
