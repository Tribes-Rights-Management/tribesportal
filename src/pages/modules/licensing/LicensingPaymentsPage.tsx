import { Link } from "react-router-dom";
import { DollarSign, Receipt } from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { PageContainer } from "@/components/ui/page-container";
import {
  AppPageHeader,
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardBody,
  AppStatCard,
  AppStatCardGrid,
  AppEmptyState,
  AppButton,
} from "@/components/app-ui";

/**
 * LICENSING PAYMENTS — OVERVIEW AND NAVIGATION
 * 
 * SCOPE: Organization Workspace (Licensing)
 */

export default function LicensingPaymentsPage() {
  const { canViewOrgInvoices, canPayInvoices, canDownloadReceipts } = useBillingAuthority();

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
      <AppPageHeader
        eyebrow="LICENSING"
        title="Payments"
        description="License fees, payments, and receipts"
      />

      {/* Summary Stats */}
      <AppStatCardGrid columns={2} className="mb-8">
        <AppStatCard
          label="Outstanding Fees"
          value="$0.00"
          subtitle="No fees pending"
        />
        <AppStatCard
          label="Active Licenses"
          value="0"
          subtitle="Licensed works"
        />
      </AppStatCardGrid>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Link to="/licensing/payments/fees">
          <AppCard className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
            <AppCardBody className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-foreground mb-1">
                    License Fees
                  </h3>
                  <p className="text-[13px] text-muted-foreground">
                    View and pay outstanding license fees
                  </p>
                </div>
              </div>
            </AppCardBody>
          </AppCard>
        </Link>

        {canDownloadReceipts && (
          <Link to="/licensing/payments/receipts">
            <AppCard className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <AppCardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-medium text-foreground mb-1">
                      Receipts
                    </h3>
                    <p className="text-[13px] text-muted-foreground">
                      Download payment receipts
                    </p>
                  </div>
                </div>
              </AppCardBody>
            </AppCard>
          </Link>
        )}
      </div>

      {/* Recent Fees Section */}
      <AppCard>
        <AppCardHeader>
          <div className="flex items-center justify-between">
            <AppCardTitle>Recent License Fees</AppCardTitle>
            <Link to="/licensing/payments/fees">
              <AppButton intent="ghost" size="sm">
                View All
              </AppButton>
            </Link>
          </div>
        </AppCardHeader>
        <AppCardBody>
          <AppEmptyState
            icon="file"
            message="No recent fees"
            description="License fees will appear here"
          />
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}
