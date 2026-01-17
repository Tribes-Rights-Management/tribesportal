import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  FileText, 
  Download,
  ArrowRight
} from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/institutional-states";

/**
 * LICENSING PAYMENTS — ORGANIZATION BILLING FOR LICENSES
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * SCOPE: Organization Workspace (Licensing)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ALLOWED:
 * - View licensing fees
 * - Submit payment for licenses
 * - View license payment history
 * - Download receipts
 * 
 * DISALLOWED:
 * - Change pricing
 * - View non-licensing billing
 * - View other organizations
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function LicensingPaymentsPage() {
  const { 
    canViewOrgInvoices, 
    canPayInvoices, 
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
        title="Licensing Payments"
        description="View and pay licensing fees"
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Outstanding Fees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              No outstanding license fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Active Licenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              No active licenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* License Fees */}
        <Link to="/licensing/payments/fees" className="block">
          <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">License Fees</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                View and pay outstanding license fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                View fees
                <ArrowRight className="h-4 w-4 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Receipts */}
        {canDownloadReceipts && (
          <Link to="/licensing/payments/receipts" className="block">
            <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Receipts</CardTitle>
                  <Download className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  Download payment receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  View receipts
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Recent Fees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Recent License Fees</CardTitle>
            <CardDescription>
              Outstanding and recent license fee transactions
            </CardDescription>
          </div>
          <Link to="/licensing/payments/fees">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No license fees"
            description="License fees will appear here when applicable"
          />
        </CardContent>
      </Card>
    </div>
  );
}
