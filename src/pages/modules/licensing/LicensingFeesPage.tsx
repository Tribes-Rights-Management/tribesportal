import { DollarSign } from "lucide-react";
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
 * LICENSING FEES — VIEW AND PAY LICENSE FEES
 * 
 * SCOPE: Organization Workspace (Licensing)
 */

export default function LicensingFeesPage() {
  const { canViewOrgInvoices, canPayInvoices } = useBillingAuthority();

  if (!canViewOrgInvoices) {
    return (
      <AppPageLayout title="License Fees" backLink={{ to: "/licensing/payments", label: "Payments" }}>
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
    <AppPageLayout title="License Fees" backLink={{ to: "/licensing/payments", label: "Payments" }}>
      {/* Outstanding Fees */}
      <AppCard className="mb-6">
        <AppCardHeader>
          <div className="flex items-center justify-between">
            <AppCardTitle>Outstanding Fees</AppCardTitle>
            <span className="text-[12px] text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              $0.00 total
            </span>
          </div>
        </AppCardHeader>
        <AppCardBody>
          <AppEmptyState
            icon="file"
            message="No outstanding fees"
            description="All license fees are paid"
          />
        </AppCardBody>
      </AppCard>

      {/* Fee History */}
      <AppCard>
        <AppCardHeader>
          <AppCardTitle>Fee History</AppCardTitle>
        </AppCardHeader>
        <AppCardBody>
          <AppEmptyState
            icon="file"
            message="No fee history"
            description="Paid fees will appear here"
          />
        </AppCardBody>
      </AppCard>
    </AppPageLayout>
  );
}
