import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { 
  FileText, 
  Download,
  DollarSign,
  Clock,
  Check,
  AlertCircle
} from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { InstitutionalEmptyState } from "@/components/ui/institutional-states";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

/**
 * PORTAL — ORGANIZATION INVOICES
 * 
 * View and pay invoices for this organization.
 */

export default function PortalInvoicesPage() {
  const { canViewOrgInvoices, canPayInvoices, canDownloadReceipts } = useBillingAuthority();

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
      <div className="flex items-center gap-4">
        <BackButton />
        <PageHeader
          title="Invoices"
          description="View and pay your organization's invoices"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Outstanding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">$0.00</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Due Soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Paid This Month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">$0.00</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <InstitutionalEmptyState
                    title="No invoices"
                    description="Invoices will appear here when generated"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permission Notice */}
      <Card className="border-muted">
        <CardContent className="p-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
