import { Link } from "react-router-dom";
import { CreditCard, Clock, FileText } from "lucide-react";
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
 * PORTAL — PAYMENTS OVERVIEW
 */

export default function PortalPaymentsPage() {
  const { 
    canViewOrgInvoices, 
    canPayInvoices, 
    canManagePaymentMethods, 
    canViewHistory, 
    canDownloadReceipts 
  } = useBillingAuthority();

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
        eyebrow="PORTAL"
        title="Payments"
        description="Invoices, payment methods, and transaction history"
      />

      <AppStatCardGrid columns={3} className="mb-8">
        <AppStatCard label="Open Invoices" value="0" subtitle="No pending invoices" />
        <AppStatCard label="Next Payment" value="—" subtitle="No upcoming payments" />
        <AppStatCard label="Payment Methods" value="0" subtitle="No saved methods" />
      </AppStatCardGrid>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Link to="/portal/payments/invoices">
          <AppCard className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
            <AppCardBody className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-foreground mb-1">Invoices</h3>
                  <p className="text-[13px] text-muted-foreground">View and pay invoices</p>
                </div>
              </div>
            </AppCardBody>
          </AppCard>
        </Link>

        {canManagePaymentMethods && (
          <Link to="/portal/payments/methods">
            <AppCard className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <AppCardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <CreditCard className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-medium text-foreground mb-1">Payment Methods</h3>
                    <p className="text-[13px] text-muted-foreground">Manage saved cards</p>
                  </div>
                </div>
              </AppCardBody>
            </AppCard>
          </Link>
        )}

        {canViewHistory && (
          <Link to="/portal/payments/history">
            <AppCard className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <AppCardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <Clock className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-medium text-foreground mb-1">Payment History</h3>
                    <p className="text-[13px] text-muted-foreground">View past transactions</p>
                  </div>
                </div>
              </AppCardBody>
            </AppCard>
          </Link>
        )}
      </div>

      <AppCard>
        <AppCardHeader>
          <div className="flex items-center justify-between">
            <AppCardTitle>Recent Invoices</AppCardTitle>
            <Link to="/portal/payments/invoices">
              <AppButton intent="ghost" size="sm">View All</AppButton>
            </Link>
          </div>
        </AppCardHeader>
        <AppCardBody>
          <AppEmptyState icon="file" message="No recent invoices" description="Invoices will appear here when generated" />
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}
