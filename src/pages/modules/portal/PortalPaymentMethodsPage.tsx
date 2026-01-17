import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { 
  CreditCard, 
  Plus,
  Trash2,
  Star
} from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { InstitutionalEmptyState } from "@/components/ui/institutional-states";

/**
 * PORTAL — PAYMENT METHODS
 * 
 * Manage cards and payment sources for this organization.
 * Org Admin access only.
 */

export default function PortalPaymentMethodsPage() {
  const { canManagePaymentMethods } = useBillingAuthority();

  if (!canManagePaymentMethods) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Access restricted</p>
          <p className="text-sm text-muted-foreground mt-2">
            Only organization administrators can manage payment methods
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <PageHeader
          title="Payment Methods"
          description="Manage your organization's payment sources"
        />
      </div>

      <div className="flex justify-end">
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Payment Methods List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Saved Payment Methods</CardTitle>
          <CardDescription>
            Cards and bank accounts for paying invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstitutionalEmptyState
            title="No payment methods"
            description="Add a card or bank account to pay invoices"
          />
        </CardContent>
      </Card>

      {/* Example Card (Template) */}
      <Card className="border-dashed opacity-50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Example Payment Method</CardTitle>
          <CardDescription>
            This is how saved payment methods will appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium flex items-center gap-2">
                  •••• •••• •••• 4242
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                </p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled>
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-muted">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Secure storage.</strong> Payment information is stored securely 
            with our payment provider. Card numbers are never stored on our servers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
