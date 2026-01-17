import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  DollarSign,
  Check,
  X,
  MoreHorizontal
} from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { InstitutionalEmptyState } from "@/components/ui/institutional-states";

/**
 * SYSTEM CONSOLE — PLANS & PRICING
 * 
 * Configure billing plans and pricing rules.
 * Platform Executive access only.
 */

export default function PlansConfigurationPage() {
  const { canConfigurePricing } = useBillingAuthority();

  if (!canConfigurePricing) {
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
          title="Plans & Pricing"
          description="Configure billing plans and pricing rules"
        />
      </div>

      <div className="flex items-center justify-between">
        <Input 
          placeholder="Search plans..." 
          className="max-w-sm"
        />
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Plans List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Pricing Plans</CardTitle>
          <CardDescription>
            Active and inactive billing plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstitutionalEmptyState
            title="No plans configured"
            description="Connect a payment provider to create billing plans"
          />
        </CardContent>
      </Card>

      {/* Plan Template */}
      <Card className="border-dashed opacity-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Example Plan Template</CardTitle>
              <CardDescription>
                This is how configured plans will appear
              </CardDescription>
            </div>
            <Badge variant="outline">Template</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-lg font-semibold">$99/month</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Billing Interval</p>
              <p className="text-sm">Monthly</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="text-sm font-medium">Features</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Feature one
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Feature two
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Feature three
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Governance Notice */}
      <Card className="border-muted">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Configuration changes are logged.</strong> All pricing modifications 
            generate immutable audit events. Changes take effect immediately for new subscriptions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
