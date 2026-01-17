import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { 
  CreditCard,
  Settings,
  Check,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { getPaymentService } from "@/services/PaymentService";

/**
 * SYSTEM CONSOLE — PAYMENT PROVIDERS
 * 
 * Configure payment processor connections.
 * Platform Executive access only.
 */

export default function PaymentProvidersPage() {
  const { canConnectProvider } = useBillingAuthority();
  const paymentService = getPaymentService();
  const activeProvider = paymentService.getActiveProvider();

  if (!canConnectProvider) {
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
      <div className="flex items-center gap-4">
        <BackButton />
        <PageHeader
          title="Payment Providers"
          description="Configure payment processor connections"
        />
      </div>

      {/* Current Status */}
      <Card className={activeProvider === "none" ? "border-amber-500/20" : "border-green-500/20"}>
        <CardContent className="p-4 flex items-center gap-3">
          {activeProvider === "none" ? (
            <>
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">No payment provider connected</p>
                <p className="text-sm text-muted-foreground">
                  Connect a provider to enable billing functionality
                </p>
              </div>
            </>
          ) : (
            <>
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Payment provider active</p>
                <p className="text-sm text-muted-foreground">
                  {activeProvider} is configured and ready
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Available Providers */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stripe */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Stripe
              </CardTitle>
              {activeProvider === "stripe" ? (
                <Badge variant="default" className="bg-green-500">Connected</Badge>
              ) : (
                <Badge variant="outline">Available</Badge>
              )}
            </div>
            <CardDescription>
              Industry-leading payment processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Subscriptions & one-time payments</li>
              <li>• Automatic invoicing</li>
              <li>• Tax calculation</li>
              <li>• Global payment methods</li>
            </ul>
            <Button 
              className="w-full" 
              disabled={activeProvider === "stripe"}
            >
              {activeProvider === "stripe" ? "Connected" : "Connect Stripe"}
              {activeProvider !== "stripe" && <ExternalLink className="h-4 w-4 ml-2" />}
            </Button>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="opacity-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Settings className="h-5 w-5" />
                More Providers
              </CardTitle>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            <CardDescription>
              Additional payment processors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Square</li>
              <li>• Adyen</li>
              <li>• PayPal</li>
              <li>• And more...</li>
            </ul>
            <Button className="w-full" disabled>
              Not Available
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Provider Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Environment:</strong> Configure test or live mode independently.
          </p>
          <p>
            <strong className="text-foreground">Webhooks:</strong> Automatic webhook endpoint configuration.
          </p>
          <p>
            <strong className="text-foreground">Audit:</strong> All provider configuration changes are logged.
          </p>
          <p>
            <strong className="text-foreground">Abstraction:</strong> Swapping providers does not require UI changes.
          </p>
        </CardContent>
      </Card>

      {/* Governance Notice */}
      <Card className="border-muted">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Credential security.</strong> Provider API keys are stored securely 
            and never exposed in client code. Access to this configuration is restricted to Platform Executives.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
