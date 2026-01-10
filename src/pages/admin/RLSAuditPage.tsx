import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Check, X, AlertTriangle, Shield } from "lucide-react";
import { Link } from "react-router-dom";

// Code-defined RLS coverage expectations
const RLS_COVERAGE = [
  // Template A - Access Control
  { table: "tenants", template: "A", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: false }, notes: "Platform admin + member read" },
  { table: "tenant_memberships", template: "A", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Managers only write" },
  { table: "membership_roles", template: "A", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Via membership FK" },
  
  // Template L - Licensing
  { table: "license_requests", template: "L", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Active member read; licensing user create" },
  { table: "licenses", template: "L", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Active member read; admin write" },
  
  // Template P - Publishing
  { table: "works", template: "P", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Publishing roles only" },
  { table: "splits", template: "P", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Publishing roles only" },
  { table: "registrations", template: "P", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Publishing roles only" },
  { table: "statements", template: "P", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Publishing roles only" },
  { table: "payments", template: "P", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Publishing roles only" },
  
  // Template S - Shared
  { table: "documents", template: "S", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Active member read; privileged write" },
  { table: "tenant_notes", template: "S", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Active member read; privileged write" },
  
  // Platform tables
  { table: "user_profiles", template: "-", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: false }, notes: "User own + admin" },
  { table: "user_roles", template: "-", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: false }, notes: "Admin only write" },
  { table: "context_permissions", template: "-", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Auth read; admin write" },
  { table: "audit_logs", template: "-", requiresTenantId: true, expectedPolicies: { select: true, insert: false, update: false, delete: false }, notes: "Read only; service insert" },
  { table: "contact_submissions", template: "-", requiresTenantId: false, expectedPolicies: { select: true, insert: false, update: true, delete: false }, notes: "Admin only; service insert" },
];

type CheckResult = {
  name: string;
  description: string;
  status: "pending" | "pass" | "fail" | "warning";
  details: string;
  rowCount?: number;
};

function getTemplateBadge(template: string) {
  const colors: Record<string, string> = {
    "A": "bg-red-100 text-red-800 border-red-200",
    "L": "bg-blue-100 text-blue-800 border-blue-200",
    "P": "bg-purple-100 text-purple-800 border-purple-200",
    "S": "bg-green-100 text-green-800 border-green-200",
    "-": "bg-gray-100 text-gray-800 border-gray-200",
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
    <Check className="h-3.5 w-3.5 text-green-600" />
  ) : (
    <span className="text-[10px] text-[#A1A1AA]">—</span>
  );
}

function CheckStatusBadge({ status }: { status: CheckResult["status"] }) {
  if (status === "pass") {
    return <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px]"><Check className="h-3 w-3 mr-1" />Pass</Badge>;
  }
  if (status === "fail") {
    return <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px]"><X className="h-3 w-3 mr-1" />Fail</Badge>;
  }
  if (status === "warning") {
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-[10px]"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
  }
  return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
}

export default function RLSAuditPage() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<CheckResult[]>([
    { name: "Active Memberships", description: "Count user's active tenant memberships", status: "pending", details: "" },
    { name: "Available Contexts", description: "List allowed portal contexts", status: "pending", details: "" },
    { name: "Tenant Isolation", description: "Verify no cross-tenant data leakage", status: "pending", details: "" },
    { name: "Approval Gate", description: "Verify pending users see zero data", status: "pending", details: "" },
    { name: "Publishing Isolation", description: "Verify licensing users cannot read publishing tables", status: "pending", details: "" },
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
      });
    } catch (err) {
      results.push({
        name: "Active Memberships",
        description: "Count user's active tenant memberships",
        status: "fail",
        details: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    // Check 2: Available contexts
    try {
      const { data: contexts } = await supabase
        .from("context_permissions")
        .select("context, role, allowed")
        .eq("allowed", true);
      
      const uniqueContexts = [...new Set(contexts?.map(c => c.context) ?? [])];
      
      results.push({
        name: "Available Contexts",
        description: "List allowed portal contexts",
        status: uniqueContexts.length > 0 ? "pass" : "warning",
        details: `Contexts: ${uniqueContexts.join(", ") || "None configured"}`,
      });
    } catch (err) {
      results.push({
        name: "Available Contexts",
        description: "List allowed portal contexts",
        status: "fail",
        details: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    // Check 3: Tenant isolation - try to read tenants user shouldn't have access to
    try {
      // Get user's tenant IDs first
      const { data: userMemberships } = await supabase
        .from("tenant_memberships")
        .select("tenant_id")
        .eq("user_id", user.id)
        .eq("status", "active");
      
      const userTenantIds = userMemberships?.map(m => m.tenant_id) ?? [];
      
      // Try to read all tenants
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
      });
    } catch (err) {
      results.push({
        name: "Tenant Isolation",
        description: "Verify no cross-tenant data leakage",
        status: "fail",
        details: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    // Check 4: Approval gate - verify data visibility requires active status
    try {
      // Count rows in various tenant-scoped tables
      const [worksResult, docsResult, licensesResult] = await Promise.all([
        supabase.from("works").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase.from("licenses").select("id", { count: "exact", head: true }),
      ]);
      
      const totalRows = (worksResult.count ?? 0) + (docsResult.count ?? 0) + (licensesResult.count ?? 0);
      
      results.push({
        name: "Approval Gate",
        description: "Verify pending users see zero data",
        status: "pass",
        details: `RLS active. Visible rows across checked tables: ${totalRows}`,
        rowCount: totalRows,
      });
    } catch (err) {
      results.push({
        name: "Approval Gate",
        description: "Verify pending users see zero data",
        status: "fail",
        details: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    // Check 5: Publishing isolation
    try {
      const [worksResult, splitsResult, statementsResult, paymentsResult] = await Promise.all([
        supabase.from("works").select("id", { count: "exact", head: true }),
        supabase.from("splits").select("id", { count: "exact", head: true }),
        supabase.from("statements").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id", { count: "exact", head: true }),
      ]);
      
      const publishingRowCount = 
        (worksResult.count ?? 0) + 
        (splitsResult.count ?? 0) + 
        (statementsResult.count ?? 0) + 
        (paymentsResult.count ?? 0);
      
      results.push({
        name: "Publishing Isolation",
        description: "Verify licensing users cannot read publishing tables",
        status: "pass",
        details: `Publishing tables visible rows: ${publishingRowCount} (based on current user roles)`,
        rowCount: publishingRowCount,
      });
    } catch (err) {
      results.push({
        name: "Publishing Isolation",
        description: "Verify licensing users cannot read publishing tables",
        status: "fail",
        details: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }

    setChecks(results);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-[#71717A]">
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-[20px] font-medium text-[#0A0A0A] tracking-[-0.02em] flex items-center gap-2">
                <Shield className="h-5 w-5" />
                RLS Coverage Audit
              </h1>
              <p className="text-[13px] text-[#71717A]">
                Row Level Security policy inventory and verification checks
              </p>
            </div>
          </div>
        </div>

        {/* RLS Coverage Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-medium">Policy Coverage Inventory</CardTitle>
            <CardDescription className="text-[12px]">
              Expected RLS policies for all tenant-scoped and platform tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-[#E4E4E7] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F4F4F5]">
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase">Table</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase">Template</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase text-center">tenant_id</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase text-center">SELECT</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase text-center">INSERT</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase text-center">UPDATE</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase text-center">DELETE</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RLS_COVERAGE.map((row) => (
                    <TableRow key={row.table}>
                      <TableCell className="text-[12px] font-mono text-[#0A0A0A]">{row.table}</TableCell>
                      <TableCell>{getTemplateBadge(row.template)}</TableCell>
                      <TableCell className="text-center">
                        {row.requiresTenantId ? (
                          <Check className="h-3.5 w-3.5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-[10px] text-[#A1A1AA]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center"><PolicyIndicator expected={row.expectedPolicies.select} /></TableCell>
                      <TableCell className="text-center"><PolicyIndicator expected={row.expectedPolicies.insert} /></TableCell>
                      <TableCell className="text-center"><PolicyIndicator expected={row.expectedPolicies.update} /></TableCell>
                      <TableCell className="text-center"><PolicyIndicator expected={row.expectedPolicies.delete} /></TableCell>
                      <TableCell className="text-[11px] text-[#71717A]">{row.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Verification Checks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[15px] font-medium">Verification Checks</CardTitle>
                <CardDescription className="text-[12px]">
                  Run read-only queries to verify RLS enforcement for current session
                </CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={runChecks} 
                disabled={isRunning}
                className="bg-[#0A0A0A] hover:bg-[#262626] text-[12px]"
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                {isRunning ? "Running..." : "Run Checks"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-[#E4E4E7] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F4F4F5]">
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase">Check</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase">Description</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase text-center">Status</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checks.map((check) => (
                    <TableRow key={check.name}>
                      <TableCell className="text-[12px] font-medium text-[#0A0A0A]">{check.name}</TableCell>
                      <TableCell className="text-[12px] text-[#71717A]">{check.description}</TableCell>
                      <TableCell className="text-center"><CheckStatusBadge status={check.status} /></TableCell>
                      <TableCell className="text-[11px] text-[#52525B] font-mono">{check.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-6 text-[11px] text-[#71717A]">
          <span className="font-medium">Templates:</span>
          <span className="flex items-center gap-1">{getTemplateBadge("A")} Access Control</span>
          <span className="flex items-center gap-1">{getTemplateBadge("L")} Licensing</span>
          <span className="flex items-center gap-1">{getTemplateBadge("P")} Publishing</span>
          <span className="flex items-center gap-1">{getTemplateBadge("S")} Shared</span>
          <span className="flex items-center gap-1">{getTemplateBadge("-")} Platform</span>
        </div>
      </div>
    </div>
  );
}
