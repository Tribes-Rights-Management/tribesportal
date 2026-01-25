import { Link } from "react-router-dom";
import { ArrowLeft, Download, Check, X } from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { BackButton } from "@/components/ui/back-button";
import { PageContainer } from "@/components/ui/page-container";
import {
  AppPageHeader,
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardBody,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
  AppEmptyState,
  AppButton,
} from "@/components/app-ui";

/**
 * PORTAL — PAYMENT HISTORY
 * 
 * View past payments and download receipts.
 */

export default function PortalPaymentHistoryPage() {
  const { canViewHistory, canDownloadReceipts } = useBillingAuthority();

  if (!canViewHistory) {
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
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
      </div>

      <AppPageHeader
        eyebrow="PORTAL"
        title="Payment History"
        description="View past payments and download receipts"
      />

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AppTableBadge variant="default">All</AppTableBadge>
          <AppTableBadge variant="success">Succeeded</AppTableBadge>
          <AppTableBadge variant="warning">Refunded</AppTableBadge>
          <AppTableBadge variant="error">Failed</AppTableBadge>
        </div>
        {canDownloadReceipts && (
          <AppButton intent="secondary" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </AppButton>
        )}
      </div>

      {/* Payments Table */}
      <AppCard className="mb-6">
        <AppCardHeader>
          <AppCardTitle>Payments</AppCardTitle>
        </AppCardHeader>
        <AppCardBody className="p-0">
          <AppTable>
            <AppTableHeader>
              <AppTableRow header>
                <AppTableHead>Date</AppTableHead>
                <AppTableHead>Description</AppTableHead>
                <AppTableHead>Amount</AppTableHead>
                <AppTableHead>Status</AppTableHead>
                <AppTableHead>Receipt</AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              <AppTableEmpty colSpan={5}>
                <AppEmptyState
                  icon="file"
                  message="No payment history"
                  description="Payments will appear here after processing"
                  size="sm"
                />
              </AppTableEmpty>
            </AppTableBody>
          </AppTable>
        </AppCardBody>
      </AppCard>

      {/* Example Row (Template) */}
      <AppCard className="border-dashed opacity-50">
        <AppCardHeader>
          <AppCardTitle>Example Payment Record</AppCardTitle>
        </AppCardHeader>
        <AppCardBody>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Invoice #INV-001</p>
                <p className="text-sm text-muted-foreground">January 15, 2025</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">$99.00</p>
              <AppTableBadge variant="success">Succeeded</AppTableBadge>
            </div>
            {canDownloadReceipts && (
              <AppButton intent="ghost" size="sm" disabled>
                <Download className="h-4 w-4" />
              </AppButton>
            )}
          </div>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}
