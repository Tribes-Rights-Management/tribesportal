import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { InstitutionalEmptyState } from "@/components/ui/institutional-states";
import { PlatformSearchInput, PlatformPageLayout, PlatformTable, PlatformTableHeader, PlatformTableBody, PlatformTableRow, PlatformTableHead, PlatformTableEmpty } from "@/components/platform-ui";

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
    <PlatformPageLayout
      title="All Invoices"
      backLink={{ to: "/console/billing", label: "Billing" }}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <PlatformSearchInput
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
            <PlatformTable columns={["18%", "22%", "15%", "15%", "15%", "15%"]}>
              <PlatformTableHeader>
                <PlatformTableRow header>
                  <PlatformTableHead>Invoice #</PlatformTableHead>
                  <PlatformTableHead>Organization</PlatformTableHead>
                  <PlatformTableHead>Amount</PlatformTableHead>
                  <PlatformTableHead>Status</PlatformTableHead>
                  <PlatformTableHead>Due Date</PlatformTableHead>
                  <PlatformTableHead>Created</PlatformTableHead>
                </PlatformTableRow>
              </PlatformTableHeader>
              <PlatformTableBody>
                <PlatformTableEmpty colSpan={6}>
                  <InstitutionalEmptyState
                    title="No invoices"
                    description="Invoices will appear here when generated"
                  />
                </PlatformTableEmpty>
              </PlatformTableBody>
            </PlatformTable>
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
    </PlatformPageLayout>
  );
}