import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import {
  AppPageLayout,
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardBody,
  AppEmptyState,
} from "@/components/app-ui";

/**
 * LICENSING RECEIPTS — DOWNLOAD PAYMENT RECEIPTS
 * 
 * SCOPE: Organization Workspace (Licensing)
 */

export default function LicensingReceiptsPage() {
  const { canDownloadReceipts } = useBillingAuthority();

  if (!canDownloadReceipts) {
    return (
      <AppPageLayout title="Payment Receipts" backLink={{ to: "/licensing/payments", label: "Payments" }}>
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Access restricted</p>
            </div>
          </AppCardBody>
        </AppCard>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout title="Payment Receipts" backLink={{ to: "/licensing/payments", label: "Payments" }}>
      <AppCard>
        <AppCardHeader>
          <AppCardTitle>Available Receipts</AppCardTitle>
        </AppCardHeader>
        <AppCardBody>
          <AppEmptyState
            icon="file"
            message="No receipts available"
            description="Receipts will appear here after payments are processed"
          />
        </AppCardBody>
      </AppCard>
    </AppPageLayout>
  );
}
