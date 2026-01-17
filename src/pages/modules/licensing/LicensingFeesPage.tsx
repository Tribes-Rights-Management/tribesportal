import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { InstitutionalEmptyState } from "@/components/ui/institutional-states";

/**
 * LICENSING FEES — VIEW AND PAY LICENSE FEES
 * 
 * SCOPE: Organization Workspace (Licensing)
 * 
 * ALLOWED:
 * - View outstanding license fees
 * - Submit payment for licenses
 * - View fee history
 */

export default function LicensingFeesPage() {
  const { canViewOrgInvoices, canPayInvoices } = useBillingAuthority();

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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link 
        to="/licensing/payments" 
        className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Payments</span>
      </Link>
      
      <PageHeader
        title="License Fees"
        description="Outstanding and historical license fees"
      />

      {/* Outstanding Fees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Outstanding Fees</CardTitle>
            <CardDescription>
              Fees pending payment
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            <DollarSign className="h-3 w-3 mr-1" />
            $0.00 total
          </Badge>
        </CardHeader>
        <CardContent>
          <InstitutionalEmptyState
            title="No outstanding fees"
            description="All license fees are paid"
          />
        </CardContent>
      </Card>

      {/* Fee History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Fee History</CardTitle>
          <CardDescription>
            Previously paid license fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstitutionalEmptyState
            title="No fee history"
            description="Paid fees will appear here"
          />
        </CardContent>
      </Card>
    </div>
  );
}
