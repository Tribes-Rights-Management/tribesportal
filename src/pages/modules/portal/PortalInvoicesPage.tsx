import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Clock, Check } from "lucide-react";
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
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppEmptyState,
  AppButton,
} from "@/components/app-ui";

/**
 * PORTAL — ORGANIZATION INVOICES
 * 
 * View and pay invoices for this organization.
 */

export default function PortalInvoicesPage() {
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
      <Link 
        to="/portal/payments" 
        className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Payments</span>
      </Link>

      <AppPageHeader
        eyebrow="PORTAL"
        title="Invoices"
        description="View and pay your organization's invoices"
      />

      {/* Summary Cards */}
      <AppStatCardGrid columns={3} className="mb-8">
        <AppStatCard
          label="Outstanding"
          value="$0.00"
        />
        <AppStatCard
          label="Due Soon"
          value="—"
        />
        <AppStatCard
          label="Paid This Month"
          value="$0.00"
        />
      </AppStatCardGrid>

      {/* Invoices Table */}
      <AppCard className="mb-6">
        <AppCardHeader>
          <AppCardTitle>All Invoices</AppCardTitle>
        </AppCardHeader>
        <AppCardBody className="p-0">
          <AppTable>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead>Invoice #</AppTableHead>
                <AppTableHead>Amount</AppTableHead>
                <AppTableHead>Status</AppTableHead>
                <AppTableHead>Due Date</AppTableHead>
                <AppTableHead>Actions</AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              <AppTableEmpty colSpan={5}>
                <AppEmptyState
                  icon="file"
                  message="No invoices"
                  description="Invoices will appear here when generated"
                  size="sm"
                />
              </AppTableEmpty>
            </AppTableBody>
          </AppTable>
        </AppCardBody>
      </AppCard>

      {/* Permission Notice */}
      <AppCard>
        <AppCardBody className="p-4">
          <p className="text-sm text-muted-foreground">
            {canPayInvoices ? (
              <>
                <strong className="text-foreground">You can pay invoices.</strong> Select an invoice and use a saved payment method.
              </>
            ) : (
              <>
                <strong className="text-foreground">View-only access.</strong> Contact your organization admin to pay invoices.
              </>
            )}
          </p>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}
