import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { InstitutionalEmptyState } from "@/components/ui/institutional-states";

/**
 * LICENSING RECEIPTS — DOWNLOAD PAYMENT RECEIPTS
 * 
 * SCOPE: Organization Workspace (Licensing)
 * 
 * ALLOWED:
 * - View receipts for completed payments
 * - Download receipt documents
 */

export default function LicensingReceiptsPage() {
  const { canDownloadReceipts } = useBillingAuthority();

  if (!canDownloadReceipts) {
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
        title="Payment Receipts"
        description="Download receipts for completed payments"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Available Receipts</CardTitle>
          <CardDescription>
            Receipts for all completed license fee payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstitutionalEmptyState
            title="No receipts available"
            description="Receipts will appear here after payments are processed"
          />
        </CardContent>
      </Card>
    </div>
  );
}
