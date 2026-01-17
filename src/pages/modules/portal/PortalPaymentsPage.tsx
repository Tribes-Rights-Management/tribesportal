import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  FileText, 
  Clock,
  Download,
  Plus,
  ArrowRight
} from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { Link } from "react-router-dom";
import { InstitutionalEmptyState } from "@/components/ui/institutional-states";

/**
 * PORTAL PAYMENTS — ORGANIZATION BILLING OPERATIONS
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * SCOPE: Organization Workspace (Tribes Admin)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ALLOWED:
 * - View invoices for this organization
 * - Pay invoices
 * - Update payment method (Org Admin only)
 * - View payment history
 * - Download receipts/statements
 * 
 * DISALLOWED:
 * - Modify pricing
 * - View platform revenue
 * - View other organizations
 * - Access payment provider configuration
 * 
 * ROLES:
 * - Org Admin: full org-scoped billing actions
 * - Member: pay/view invoices only (no config)
 * ═══════════════════════════════════════════════════════════════════════════
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
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Access restricted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Payments"
        description="Manage invoices and payment methods for your organization"
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Open Invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              No outstanding invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Next Payment Due
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              No upcoming payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              No payment methods
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Invoices */}
        <Link to="/portal/payments/invoices" className="block">
          <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Invoices</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                View and pay your organization's invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                View invoices
                <ArrowRight className="h-4 w-4 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Payment Methods */}
        {canManagePaymentMethods && (
          <Link to="/portal/payments/methods" className="block">
            <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Payment Methods</CardTitle>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  Manage cards and payment sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  Manage methods
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Payment History */}
        {canViewHistory && (
          <Link to="/portal/payments/history" className="block">
            <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Payment History</CardTitle>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  View past payments and download receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  View history
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
            <CardDescription>
              Your organization's latest invoices
            </CardDescription>
          </div>
          <Link to="/portal/payments/invoices">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <InstitutionalEmptyState
            title="No invoices"
            description="Invoices will appear here when generated"
          />
        </CardContent>
      </Card>
    </div>
  );
}
