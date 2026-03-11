import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import {
  PlatformPageLayout,
  PlatformCard,
  PlatformCardHeader,
  PlatformCardTitle,
  PlatformCardBody,
  PlatformEmptyState,
} from "@/components/platform-ui";

/**
 * LICENSING RECEIPTS — DOWNLOAD PAYMENT RECEIPTS
 * 
 * SCOPE: Organization Workspace (Licensing)
 */

export default function LicensingReceiptsPage() {
  const { canDownloadReceipts } = useBillingAuthority();

  if (!canDownloadReceipts) {
    return (
      <PlatformPageLayout title="Payment Receipts" backLink={{ to: "/licensing/payments", label: "Payments" }}>
        <PlatformCard>
          <PlatformCardBody className="p-6 md:p-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Access restricted</p>
            </div>
          </PlatformCardBody>
        </PlatformCard>
      </PlatformPageLayout>
    );
  }

  return (
    <PlatformPageLayout title="Payment Receipts" backLink={{ to: "/licensing/payments", label: "Payments" }}>
      <PlatformCard>
        <PlatformCardHeader>
          <PlatformCardTitle>Available Receipts</PlatformCardTitle>
        </PlatformCardHeader>
        <PlatformCardBody>
          <PlatformEmptyState
            icon="file"
            message="No receipts available"
            description="Receipts will appear here after payments are processed"
          />
        </PlatformCardBody>
      </PlatformCard>
    </PlatformPageLayout>
  );
}