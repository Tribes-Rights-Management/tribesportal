import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";

/**
 * SYSTEM CONSOLE — REVENUE OVERVIEW
 * 
 * Aggregate revenue metrics across all organizations.
 * Read-only view for Platform Executives.
 */

export default function RevenueOverviewPage() {
  const { canViewRevenue } = useBillingAuthority();

  if (!canViewRevenue) {
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
          title="Revenue Overview"
          description="Aggregate financial metrics across all organizations"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              No payment provider configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Recurring Revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              MRR tracking unavailable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              Subscription data unavailable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Churn Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              Churn tracking unavailable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Revenue Trend</CardTitle>
          <CardDescription>
            Monthly revenue over the past 12 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-dashed rounded-lg">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Revenue chart unavailable</p>
              <p className="text-sm text-muted-foreground">
                Connect a payment provider to view revenue data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Revenue by Organization</CardTitle>
          <CardDescription>
            Revenue distribution across organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No organization revenue data available</p>
          </div>
        </CardContent>
      </Card>

      {/* Governance Notice */}
      <Card className="border-muted">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Read-only surface.</strong> Revenue data is aggregated from payment provider.
            Organization-level billing actions are managed within their respective workspaces.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
