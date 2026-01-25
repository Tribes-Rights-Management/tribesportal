import { CreditCard, Plus, Trash2, Star } from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { BackButton } from "@/components/ui/back-button";
import { PageContainer } from "@/components/ui/page-container";
import {
  AppPageHeader,
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardBody,
  AppEmptyState,
  AppButton,
  AppTableBadge,
} from "@/components/app-ui";

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
      <PageContainer maxWidth="wide">
        <AppCard>
          <AppCardBody className="p-6 md:p-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Access restricted</p>
              <p className="text-sm text-muted-foreground mt-2">
                Only organization administrators can manage payment methods
              </p>
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

      <div className="flex items-center justify-between mb-8">
        <AppPageHeader
          eyebrow="PORTAL"
          title="Payment Methods"
          description="Manage your organization's payment sources"
        />
        <AppButton intent="primary" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </AppButton>
      </div>

      {/* Payment Methods List */}
      <AppCard className="mb-6">
        <AppCardHeader>
          <AppCardTitle>Saved Payment Methods</AppCardTitle>
        </AppCardHeader>
        <AppCardBody>
          <AppEmptyState
            icon="inbox"
            message="No payment methods"
            description="Add a card or bank account to pay invoices"
          />
        </AppCardBody>
      </AppCard>

      {/* Example Card (Template) */}
      <AppCard className="border-dashed opacity-50 mb-6">
        <AppCardHeader>
          <AppCardTitle>Example Payment Method</AppCardTitle>
        </AppCardHeader>
        <AppCardBody>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium flex items-center gap-2">
                  •••• •••• •••• 4242
                  <AppTableBadge variant="default">Default</AppTableBadge>
                </p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AppButton intent="ghost" size="sm" disabled>
                <Star className="h-4 w-4" />
              </AppButton>
              <AppButton intent="ghost" size="sm" disabled>
                <Trash2 className="h-4 w-4" />
              </AppButton>
            </div>
          </div>
        </AppCardBody>
      </AppCard>

      {/* Security Notice */}
      <AppCard>
        <AppCardBody className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Secure storage.</strong> Payment information is stored securely 
            with our payment provider. Card numbers are never stored on our servers.
          </p>
        </AppCardBody>
      </AppCard>
    </PageContainer>
  );
}
