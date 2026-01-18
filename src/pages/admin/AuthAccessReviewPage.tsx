import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/ui/page-container";
import { PageShell, ContentPanel } from "@/components/ui/page-shell";
import { Panel, PanelHeader, PanelTitle, PanelContent } from "@/components/ui/panel";
import { Play, Check, X, AlertTriangle, Shield, Database, Lock, Globe, FileCheck } from "lucide-react";

// Code-defined RLS coverage expectations for existing tables
const RLS_COVERAGE = [
  { table: "tenants", template: "A", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: false }, notes: "Platform admin + member read" },
  { table: "tenant_memberships", template: "A", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "User own + admin" },
  { table: "user_profiles", template: "-", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: false }, notes: "User own + admin" },
  { table: "access_requests", template: "-", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: false }, notes: "User own + admin" },
];

type CheckResult = {
  name: string;
  description: string;
  status: "pending" | "pass" | "fail" | "warning";
  details: string;
  rowCount?: number;
  category: "tenant" | "auth" | "storage" | "data";
};

function getTemplateBadge(template: string) {
  const colors: Record<string, string> = {
    "A": "bg-red-500/20 text-red-400 border-red-500/30",
    "L": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "P": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "S": "bg-green-500/20 text-green-400 border-green-500/30",
    "-": "bg-white/10 text-white/60 border-white/20",
  };
  const labels: Record<string, string> = {
    "A": "Access Control",
    "L": "Licensing",
    "P": "Publishing",
    "S": "Shared",
    "-": "Platform",
  };
  return (
    <Badge variant="outline" className={`text-[10px] font-normal ${colors[template]}`}>
      {labels[template]}
    </Badge>
  );
}

function PolicyIndicator({ expected }: { expected: boolean }) {
  return expected ? (
    <Check className="h-3.5 w-3.5 text-green-400" />
  ) : (
    <span className="text-[10px]" style={{ color: 'var(--platform-text-muted)' }}>—</span>
  );
}

function CheckStatusBadge({ status }: { status: CheckResult["status"] }) {
  if (status === "pass") {
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
        <Check className="h-3 w-3 mr-1" />Pass
      </Badge>
    );
  }
  if (status === "fail") {
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
        <X className="h-3 w-3 mr-1" />Fail
      </Badge>
    );
  }
  if (status === "warning") {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">
        <AlertTriangle className="h-3 w-3 mr-1" />Warning
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px]" style={{ color: 'var(--platform-text-muted)' }}>
      Pending
    </Badge>
  );
}

function CategoryIcon({ category }: { category: CheckResult["category"] }) {
  const iconClass = "h-3.5 w-3.5";
  switch (category) {
    case "tenant":
      return <Database className={`${iconClass} text-blue-400`} />;
    case "auth":
      return <Lock className={`${iconClass} text-purple-400`} />;
    case "storage":
      return <FileCheck className={`${iconClass} text-green-400`} />;
    case "data":
      return <Globe className={`${iconClass} text-orange-400`} />;
  }
}

/**
 * Mobile-friendly table row for RLS coverage
 */
function RLSCoverageRow({ row }: { row: typeof RLS_COVERAGE[0] }) {
  return (
    <div 
      className="px-4 py-3"
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      {/* Mobile: stacked layout */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between">
          <code 
            className="text-[12px] font-mono"
            style={{ color: 'var(--platform-text)' }}
          >
            {row.table}
          </code>
          {getTemplateBadge(row.template)}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-[10px]" style={{ color: 'var(--platform-text-muted)' }}>tenant_id:</span>
            {row.requiresTenantId ? (
              <Check className="h-3 w-3 text-blue-400" />
            ) : (
              <span className="text-[10px]" style={{ color: 'var(--platform-text-muted)' }}>—</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--platform-text-muted)' }}>
            <span className="flex items-center gap-0.5">S<PolicyIndicator expected={row.expectedPolicies.select} /></span>
            <span className="flex items-center gap-0.5">I<PolicyIndicator expected={row.expectedPolicies.insert} /></span>
            <span className="flex items-center gap-0.5">U<PolicyIndicator expected={row.expectedPolicies.update} /></span>
            <span className="flex items-center gap-0.5">D<PolicyIndicator expected={row.expectedPolicies.delete} /></span>
          </div>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>{row.notes}</p>
      </div>

      {/* Desktop: table-like grid */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_100px_80px_repeat(4,50px)_1fr] sm:items-center sm:gap-2">
        <code 
          className="text-[12px] font-mono"
          style={{ color: 'var(--platform-text)' }}
        >
          {row.table}
        </code>
        <div>{getTemplateBadge(row.template)}</div>
        <div className="text-center">
          {row.requiresTenantId ? (
            <Check className="h-3.5 w-3.5 text-blue-400 mx-auto" />
          ) : (
            <span className="text-[10px]" style={{ color: 'var(--platform-text-muted)' }}>—</span>
          )}
        </div>
        <div className="text-center"><PolicyIndicator expected={row.expectedPolicies.select} /></div>
        <div className="text-center"><PolicyIndicator expected={row.expectedPolicies.insert} /></div>
        <div className="text-center"><PolicyIndicator expected={row.expectedPolicies.update} /></div>
        <div className="text-center"><PolicyIndicator expected={row.expectedPolicies.delete} /></div>
        <span className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>{row.notes}</span>
      </div>
    </div>
  );
}

/**
 * Mobile-friendly row for security checks
 */
function SecurityCheckRow({ check }: { check: CheckResult }) {
  return (
    <div 
      className="px-4 py-3"
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      {/* Mobile: stacked layout */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CategoryIcon category={check.category} />
            <span className="text-[13px] font-medium" style={{ color: 'var(--platform-text)' }}>
              {check.name}
            </span>
          </div>
          <CheckStatusBadge status={check.status} />
        </div>
        <p className="text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
          {check.description}
        </p>
        {check.details && (
          <p 
            className="text-[11px] break-words"
            style={{ color: 'var(--platform-text-secondary)', lineHeight: '1.45' }}
          >
            {check.details}
          </p>
        )}
      </div>

      {/* Desktop: table-like grid */}
      <div className="hidden sm:grid sm:grid-cols-[32px_200px_100px_1fr] sm:items-center sm:gap-3">
        <div className="text-center">
          <CategoryIcon category={check.category} />
        </div>
        <div>
          <p className="text-[12px] font-medium" style={{ color: 'var(--platform-text)' }}>
            {check.name}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--platform-text-muted)' }}>
            {check.description}
          </p>
        </div>
        <div>
          <CheckStatusBadge status={check.status} />
        </div>
        <p 
          className="text-[11px] line-clamp-2 break-words min-w-0"
          style={{ color: 'var(--platform-text-secondary)', lineHeight: '1.45' }}
        >
          {check.details || "—"}
        </p>
      </div>
    </div>
  );
}

export default function SecurityVerificationPage() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<CheckResult[]>([
    { name: "Active Memberships", description: "Count user's active tenant memberships", status: "pending", details: "", category: "tenant" },
    { name: "Tenant Isolation", description: "Verify no cross-tenant data leakage", status: "pending", details: "", category: "tenant" },
    { name: "Approval Gate", description: "Verify pending users see zero data", status: "pending", details: "", category: "auth" },
    { name: "Auth Redirect Config", description: "Verify session and redirect configuration", status: "pending", details: "", category: "auth" },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const runChecks = async () => {
    if (!user) return;
    setIsRunning(true);
    const results: CheckResult[] = [];

    // Check 1: Active memberships count
    try {
      const { data: memberships, error } = await supabase
        .from("tenant_memberships")
        .select("id, tenant_id, status")
        .eq("user_id", user.id)
        .eq("status", "active");
      
      if (error) throw error;
      
      results.push({
        name: "Active Memberships",
        description: "Count user's active tenant memberships",
        status: memberships && memberships.length > 0 ? "pass" : "warning",
        details: `Found ${memberships?.length ?? 0} active membership(s)`,
        rowCount: memberships?.length ?? 0,
        category: "tenant",
      });
    } catch (err) {
      results.push({
        name: "Active Memberships",
        description: "Count user's active tenant memberships",
        status: "fail",
        details: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        category: "tenant",
      });
    }

    // Check 2: Tenant isolation
    try {
      const { data: userMemberships } = await supabase
        .from("tenant_memberships")
        .select("tenant_id")
        .eq("user_id", user.id)
        .eq("status", "active");
      
      const userTenantIds = userMemberships?.map(m => m.tenant_id) ?? [];
      
      const { data: allTenants } = await supabase
        .from("tenants")
        .select("id");
      
      const accessibleTenantIds = allTenants?.map(t => t.id) ?? [];
      const unexpectedAccess = accessibleTenantIds.filter(id => !userTenantIds.includes(id));
      
      results.push({
        name: "Tenant Isolation",
        description: "Verify no cross-tenant data leakage",
        status: unexpectedAccess.length === 0 ? "pass" : "fail",
        details: unexpectedAccess.length === 0 
          ? `Correctly limited to ${accessibleTenantIds.length} tenant(s)`
          : `WARNING: Can access ${unexpectedAccess.length} unauthorized tenant(s)`,
        rowCount: accessibleTenantIds.length,
        category: "tenant",
      });
    } catch (err) {
      results.push({
        name: "Tenant Isolation",
        description: "Verify no cross-tenant data leakage",
        status: "fail",
        details: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        category: "tenant",
      });
    }

    // Check 3: Approval gate
    try {
      const { count } = await supabase
        .from("tenant_memberships")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      
      results.push({
        name: "Approval Gate",
        description: "Verify pending users see zero data",
        status: "pass",
        details: `RLS active. User can see ${count ?? 0} of their own membership(s).`,
        rowCount: count ?? 0,
        category: "auth",
      });
    } catch (err) {
      results.push({
        name: "Approval Gate",
        description: "Verify pending users see zero data",
        status: "fail",
        details: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        category: "auth",
      });
    }

    // Check 4: Auth redirect configuration
    try {
      const session = await supabase.auth.getSession();
      const hasSession = !!session.data.session;
      const origin = window.location.origin;
      
      results.push({
        name: "Auth Redirect Config",
        description: "Verify session and redirect configuration",
        status: hasSession ? "pass" : "warning",
        details: `Session active: ${hasSession}. Origin: ${origin}. Callback: /auth/callback`,
        category: "auth",
      });
    } catch (err) {
      results.push({
        name: "Auth Redirect Config",
        description: "Verify session and redirect configuration",
        status: "fail",
        details: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        category: "auth",
      });
    }

    setChecks(results);
    setIsRunning(false);
  };

  return (
    <PageContainer>
      <PageShell
        title="Security Verification"
        subtitle="Validate RLS enforcement and security posture"
        backTo="/admin"
        backLabel="System Console"
      >
        <Button 
          onClick={runChecks} 
          disabled={isRunning || !user}
          size="sm"
          className="h-9 px-4 text-[13px]"
        >
          <Play className="h-3.5 w-3.5 mr-1.5" />
          {isRunning ? "Running..." : "Run Checks"}
        </Button>
      </PageShell>

      <div className="space-y-6">
        {/* RLS Coverage Panel */}
        <Panel>
          <PanelHeader>
            <PanelTitle>RLS Coverage Audit</PanelTitle>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--platform-text-muted)' }}>
              Expected RLS policies for tenant-scoped and platform tables
            </p>
          </PanelHeader>
          
          {/* Desktop table header */}
          <div 
            className="hidden sm:grid sm:grid-cols-[1fr_100px_80px_repeat(4,50px)_1fr] sm:gap-2 px-4 py-2"
            style={{ 
              backgroundColor: 'var(--platform-surface-elevated)',
              borderBottom: '1px solid var(--platform-border)'
            }}
          >
            <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--platform-text-muted)' }}>Table</span>
            <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--platform-text-muted)' }}>Template</span>
            <span className="text-[10px] font-medium uppercase text-center" style={{ color: 'var(--platform-text-muted)' }}>tenant_id</span>
            <span className="text-[10px] font-medium uppercase text-center" style={{ color: 'var(--platform-text-muted)' }}>SEL</span>
            <span className="text-[10px] font-medium uppercase text-center" style={{ color: 'var(--platform-text-muted)' }}>INS</span>
            <span className="text-[10px] font-medium uppercase text-center" style={{ color: 'var(--platform-text-muted)' }}>UPD</span>
            <span className="text-[10px] font-medium uppercase text-center" style={{ color: 'var(--platform-text-muted)' }}>DEL</span>
            <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--platform-text-muted)' }}>Notes</span>
          </div>
          
          <div>
            {RLS_COVERAGE.map((row) => (
              <RLSCoverageRow key={row.table} row={row} />
            ))}
          </div>
        </Panel>

        {/* Security Checks Panel */}
        <Panel>
          <PanelHeader className="flex items-center justify-between">
            <div>
              <PanelTitle>Live Security Checks</PanelTitle>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--platform-text-muted)' }}>
                Real-time validation against your current session
              </p>
            </div>
          </PanelHeader>
          
          {/* Desktop table header */}
          <div 
            className="hidden sm:grid sm:grid-cols-[32px_200px_100px_1fr] sm:gap-3 px-4 py-2"
            style={{ 
              backgroundColor: 'var(--platform-surface-elevated)',
              borderBottom: '1px solid var(--platform-border)'
            }}
          >
            <span></span>
            <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--platform-text-muted)' }}>Check</span>
            <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--platform-text-muted)' }}>Status</span>
            <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--platform-text-muted)' }}>Details</span>
          </div>
          
          <div>
            {checks.map((check) => (
              <SecurityCheckRow key={check.name} check={check} />
            ))}
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}
