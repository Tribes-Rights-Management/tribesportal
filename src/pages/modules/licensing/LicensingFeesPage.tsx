import { Link } from "react-router-dom";
import { ArrowLeft, DollarSign } from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { PageContainer } from "@/components/ui/page-container";
import {
  AppPageHeader,
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardBody,
  AppSectionHeader,
  AppEmptyState,
  AppButton,
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
      <PageContainer maxWidth="wide">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Access restricted</p>
            </div>
          </AppCardBody>
        </AppCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <Link 
        to="/licensing/payments" 
        className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Payments</span>
      </Link>
      
      <AppPageHeader
        eyebrow="LICENSING"
        title="License Fees"
        description="Outstanding and historical license fees"
      />

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
    </PageContainer>
  );
}
