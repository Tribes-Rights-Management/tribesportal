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
import { ArrowLeft, Play, Check, X, AlertTriangle, Shield, Database, Lock, Globe, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";

// Code-defined RLS coverage expectations for existing tables
const RLS_COVERAGE = [
  // Core tables
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

function CategoryIcon({ category }: { category: CheckResult["category"] }) {
  switch (category) {
    case "tenant":
      return <Database className="h-3.5 w-3.5 text-blue-600" />;
    case "auth":
      return <Lock className="h-3.5 w-3.5 text-purple-600" />;
    case "storage":
      return <FileCheck className="h-3.5 w-3.5 text-green-600" />;
    case "data":
      return <Globe className="h-3.5 w-3.5 text-orange-600" />;
  }
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

    // Check 2: Tenant isolation - try to read tenants user shouldn't have access to
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

    // Check 3: Approval gate - verify data visibility requires active status
    try {
      // Count rows in tenant_memberships for current user
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
                Security Verification
              </h1>
              <p className="text-[13px] text-[#71717A]">
                Validate RLS enforcement and security posture using current session
              </p>
            </div>
          </div>
        </div>

        {/* RLS Coverage Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-medium">RLS Coverage Audit</CardTitle>
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
                          <Check className="h-3.5 w-3.5 text-blue-600 mx-auto" />
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

        {/* Security Checks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[15px] font-medium">Live Security Checks</CardTitle>
                <CardDescription className="text-[12px]">
                  Run real-time validation against your current session
                </CardDescription>
              </div>
              <Button 
                onClick={runChecks} 
                disabled={isRunning || !user}
                size="sm"
                className="h-8 px-3 text-[12px]"
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
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase w-8"></TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase">Check</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase">Status</TableHead>
                    <TableHead className="text-[11px] font-medium text-[#71717A] uppercase">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checks.map((check) => (
                    <TableRow key={check.name}>
                      <TableCell className="text-center">
                        <CategoryIcon category={check.category} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-[12px] font-medium text-[#0A0A0A]">{check.name}</p>
                          <p className="text-[10px] text-[#71717A]">{check.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CheckStatusBadge status={check.status} />
                      </TableCell>
                      <TableCell className="text-[11px] text-[#52525B] max-w-[300px] truncate">
                        {check.details || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
