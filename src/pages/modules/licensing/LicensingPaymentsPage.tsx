import { Link } from "react-router-dom";
import { DollarSign, Receipt } from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import {
  PlatformPageLayout,
  PlatformCard,
  PlatformCardHeader,
  PlatformCardTitle,
  PlatformCardBody,
  PlatformStatCard,
  PlatformStatCardGrid,
  PlatformEmptyState,
  PlatformButton,
} from "@/components/platform-ui";

/**
 * LICENSING PAYMENTS — OVERVIEW AND NAVIGATION
 * 
 * SCOPE: Organization Workspace (Licensing)
 */

export default function LicensingPaymentsPage() {
  const { canViewOrgInvoices, canPayInvoices, canDownloadReceipts } = useBillingAuthority();

  if (!canViewOrgInvoices) {
    return (
      <PlatformPageLayout title="Payments">
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
    <PlatformPageLayout title="Payments">
      {/* Summary Stats */}
      <PlatformStatCardGrid columns={2} className="mb-8">
        <PlatformStatCard
          label="Outstanding Fees"
          value="$0.00"
          subtitle="No fees pending"
        />
        <PlatformStatCard
          label="Active Licenses"
          value="0"
          subtitle="Licensed works"
        />
      </PlatformStatCardGrid>

      {/* Navigation Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-8">
        <Link to="/licensing/payments/fees">
          <PlatformCard className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
            <PlatformCardBody className="p-6">
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
            </PlatformCardBody>
          </PlatformCard>
        </Link>

        {canDownloadReceipts && (
          <Link to="/licensing/payments/receipts">
            <PlatformCard className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <PlatformCardBody className="p-6">
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
              </PlatformCardBody>
            </PlatformCard>
          </Link>
        )}
      </div>

      {/* Recent Fees Section */}
      <PlatformCard>
        <PlatformCardHeader>
          <div className="flex items-center justify-between">
            <PlatformCardTitle>Recent License Fees</PlatformCardTitle>
            <Link to="/licensing/payments/fees">
              <PlatformButton intent="ghost" size="sm">
                View All
              </PlatformButton>
            </Link>
          </div>
        </PlatformCardHeader>
        <PlatformCardBody>
          <PlatformEmptyState
            icon="file"
            message="No recent fees"
            description="License fees will appear here"
          />
        </PlatformCardBody>
      </PlatformCard>
    </PlatformPageLayout>
  );
}
