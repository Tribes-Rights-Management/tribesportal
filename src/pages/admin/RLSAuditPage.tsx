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
  // Access Control
  { table: "tenants", template: "A", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: false }, notes: "Platform admin + member read" },
  { table: "tenant_memberships", template: "A", requiresTenantId: true, expectedPolicies: { select: true, insert: true, update: true, delete: true }, notes: "Users see own; admin all" },
  
  // Platform tables
  { table: "user_profiles", template: "-", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: false }, notes: "User own + admin" },
  { table: "access_requests", template: "-", requiresTenantId: false, expectedPolicies: { select: true, insert: true, update: true, delete: false }, notes: "User own + admin" },
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
    <span className="text-[10px] text-muted-foreground">—</span>
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
    { name: "Available Contexts", description: "List allowed portal contexts from memberships", status: "pending", details: "" },
    { name: "Tenant Isolation", description: "Verify no cross-tenant data leakage", status: "pending", details: "" },
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
        .select("id, tenant_id, status, allowed_contexts")
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

    // Check 2: Available contexts from memberships
    try {
      const { data: memberships } = await supabase
        .from("tenant_memberships")
        .select("allowed_contexts")
        .eq("user_id", user.id)
        .eq("status", "active");
      
      const allContexts = new Set<string>();
      memberships?.forEach((m: any) => {
        (m.allowed_contexts || []).forEach((ctx: string) => allContexts.add(ctx));
      });
      
      const uniqueContexts = Array.from(allContexts);
      
      results.push({
        name: "Available Contexts",
        description: "List allowed portal contexts from memberships",
        status: uniqueContexts.length > 0 ? "pass" : "warning",
        details: `Contexts: ${uniqueContexts.join(", ") || "None configured"}`,
      });
    } catch (err) {
      results.push({
        name: "Available Contexts",
        description: "List allowed portal contexts from memberships",
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

    setChecks(results);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-medium flex items-center gap-2">
                <Shield className="h-5 w-5" />
                RLS Coverage Audit
              </h1>
              <p className="text-sm text-muted-foreground">
                Row Level Security policy inventory and verification checks
              </p>
            </div>
          </div>
        </div>

        {/* RLS Coverage Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Policy Coverage Inventory</CardTitle>
            <CardDescription className="text-xs">
              Expected RLS policies for all tenant-scoped and platform tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-medium uppercase">Table</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Template</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">tenant_id</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">SELECT</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">INSERT</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">UPDATE</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">DELETE</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RLS_COVERAGE.map((row) => (
                    <TableRow key={row.table}>
                      <TableCell className="text-xs font-mono">{row.table}</TableCell>
                      <TableCell>{getTemplateBadge(row.template)}</TableCell>
                      <TableCell className="text-center">
                        {row.requiresTenantId ? (
                          <Check className="h-3.5 w-3.5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center"><PolicyIndicator expected={row.expectedPolicies.select} /></TableCell>
                      <TableCell className="text-center"><PolicyIndicator expected={row.expectedPolicies.insert} /></TableCell>
                      <TableCell className="text-center"><PolicyIndicator expected={row.expectedPolicies.update} /></TableCell>
                      <TableCell className="text-center"><PolicyIndicator expected={row.expectedPolicies.delete} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.notes}</TableCell>
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
                <CardTitle className="text-base font-medium">Verification Checks</CardTitle>
                <CardDescription className="text-xs">
                  Run read-only queries to verify RLS enforcement for current session
                </CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={runChecks} 
                disabled={isRunning}
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                {isRunning ? "Running..." : "Run Checks"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-medium uppercase">Check</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Description</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">Status</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checks.map((check) => (
                    <TableRow key={check.name}>
                      <TableCell className="text-xs font-medium">{check.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{check.description}</TableCell>
                      <TableCell className="text-center"><CheckStatusBadge status={check.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{check.details}</TableCell>
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
