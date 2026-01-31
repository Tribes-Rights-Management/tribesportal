import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  CreditCard,
  Settings,
  AlertCircle,
  Lock
} from "lucide-react";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { Link } from "react-router-dom";

/**
 * SYSTEM CONSOLE BILLING — GOVERNANCE OVERVIEW
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER ENFORCEMENT DIRECTIVE — LOCKED ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This page provides company-level billing governance.
 * 
 * ALLOWED:
 * - Billing plans & pricing rules
 * - Revenue overview (aggregate, read-only)
 * - Invoices across all organizations (read-only)
 * - Payment provider configuration
 * - Tax configuration
 * - Refund authority policies
 * - Regulatory/audit export packs
 * 
 * PROHIBITED:
 * - No payment submission
 * - No org-scoped billing actions
 * - No client payment methods
 * - No per-user transactions
 * 
 * ACCESS: Platform Executive only
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function BillingGovernancePage() {
  const { 
    canConfigurePricing, 
    canViewRevenue, 
    canViewAllInvoices,
    canConnectProvider,
    canIssueRefunds,
    canExportFinancial 
  } = useBillingAuthority();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Billing Governance"
        description="Company-level financial oversight and configuration"
      />

      {/* Governance Notice */}
      <Card className="border-[var(--warning-border)] bg-[var(--warning-bg)]">
        <CardContent className="p-4 flex items-start gap-3">
          <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--warning-text)' }} />
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: 'var(--warning-text)' }}>
              Governance Surface — Read-Only Operations
            </p>
            <p className="text-sm" style={{ color: 'var(--warning-text)', opacity: 0.8 }}>
              This surface governs billing configuration and provides oversight. 
              Payment transactions occur within organization workspaces.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Overview */}
        {canViewRevenue && (
          <Link to="/admin/billing/revenue" className="block">
            <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  Aggregate revenue metrics across all organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">MRR</span>
                    <span className="font-medium">—</span>
                  </div>
                  <Badge variant="outline" className="mt-2">Read-only</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Plans & Pricing */}
        {canConfigurePricing && (
          <Link to="/admin/billing/plans" className="block">
            <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Plans & Pricing</CardTitle>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  Configure billing plans and pricing rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Plans</span>
                    <span className="font-medium">—</span>
                  </div>
                  <Badge variant="secondary" className="mt-2">Configurable</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* All Invoices */}
        {canViewAllInvoices && (
          <Link to="/admin/billing/invoices" className="block">
            <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">All Invoices</CardTitle>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  Cross-organization invoice registry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Invoices</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-medium">—</span>
                  </div>
                  <Badge variant="outline" className="mt-2">Read-only</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Payment Providers */}
        {canConnectProvider && (
          <Link to="/admin/billing/providers" className="block">
            <Card className="h-full hover:border-foreground/20 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Payment Providers</CardTitle>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  Configure payment processor connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Provider</span>
                    <Badge variant="outline">None configured</Badge>
                  </div>
                  <Badge variant="secondary" className="mt-2">Configurable</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Refund Authority */}
        {canIssueRefunds && (
          <Card className="h-full opacity-75">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Refund Authority</CardTitle>
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Issue refunds for processed payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending Refunds</span>
                  <span className="font-medium">—</span>
                </div>
                <Badge variant="outline" className="mt-2">Requires provider</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Exports */}
        {canExportFinancial && (
          <Card className="h-full opacity-75">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Financial Exports</CardTitle>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Generate regulatory disclosure packs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Export</span>
                  <span className="font-medium">—</span>
                </div>
                <Badge variant="outline" className="mt-2">Requires data</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="my-6" />

      {/* Governance Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Billing Governance Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Scope:</strong> System Console governs money. It never moves money.
          </p>
          <p>
            <strong className="text-foreground">Separation:</strong> Billing authority is separate from operational authority.
          </p>
          <p>
            <strong className="text-foreground">Audit:</strong> All billing configuration changes generate immutable audit events.
          </p>
          <p>
            <strong className="text-foreground">Access:</strong> Only Platform Executives may configure billing. Organization billing operations occur within workspaces.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
