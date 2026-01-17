import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { 
  Clock, 
  Download,
  Check,
  X
} from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { EmptyState } from "@/components/ui/institutional-states";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

/**
 * PORTAL — PAYMENT HISTORY
 * 
 * View past payments and download receipts.
 */

export default function PortalPaymentHistoryPage() {
  const { canViewHistory, canDownloadReceipts } = useBillingAuthority();

  if (!canViewHistory) {
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
          title="Payment History"
          description="View past payments and download receipts"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="cursor-pointer">All</Badge>
          <Badge variant="secondary" className="cursor-pointer">Succeeded</Badge>
          <Badge variant="secondary" className="cursor-pointer">Refunded</Badge>
          <Badge variant="secondary" className="cursor-pointer">Failed</Badge>
        </div>
        {canDownloadReceipts && (
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Payments</CardTitle>
          <CardDescription>
            All payment transactions for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <EmptyState
                    title="No payment history"
                    description="Payments will appear here after processing"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Example Row (Template) */}
      <Card className="border-dashed opacity-50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Example Payment Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Invoice #INV-001</p>
                <p className="text-sm text-muted-foreground">January 15, 2025</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">$99.00</p>
              <Badge variant="secondary" className="text-xs">Succeeded</Badge>
            </div>
            {canDownloadReceipts && (
              <Button variant="ghost" size="sm" disabled>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
