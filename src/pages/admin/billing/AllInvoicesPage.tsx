import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Download, Filter } from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { InstitutionalEmptyState } from "@/components/ui/institutional-states";
import { AppSearchInput } from "@/components/app-ui";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

/**
 * SYSTEM CONSOLE — ALL INVOICES (Read-Only)
 * 
 * Cross-organization invoice registry.
 * Platform Executive access only. No payment actions.
 */

export default function AllInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { canViewAllInvoices } = useBillingAuthority();

  if (!canViewAllInvoices) {
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
          title="All Invoices"
          description="Cross-organization invoice registry (read-only)"
        />
      </div>

      <div className="flex items-center gap-4">
        <AppSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search invoices..."
          className="flex-1 max-w-sm"
        />
        <Button variant="outline" disabled>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline" disabled>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Invoice Registry</CardTitle>
          <CardDescription>
            All invoices across organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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

      {/* Governance Notice */}
      <Card className="border-muted">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Read-only access.</strong> This registry provides oversight of all invoices.
            Payment actions (pay, void, refund) are managed within organization workspaces or via refund authority.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
