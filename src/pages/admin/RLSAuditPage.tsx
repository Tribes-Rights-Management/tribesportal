import { useAuth } from "@/contexts/AuthContext";
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
import { ArrowLeft, Check, X, Shield, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

// Comprehensive RLS coverage expectations for all public tables
// This is the source of truth for expected security posture
const RLS_COVERAGE = [
  // Access Control (Template A)
  { 
    table: "tenants", 
    rlsEnabled: true, 
    policyCount: 2, 
    hasTenantId: false, 
    policiesReferenceTenantId: true,
    status: "compliant" as AuditStatus,
    notes: "Platform admin + member read via RLS" 
  },
  {
    table: "tenant_memberships", 
    rlsEnabled: true, 
    policyCount: 3, 
    hasTenantId: true, 
    policiesReferenceTenantId: true,
    status: "compliant" as AuditStatus,
    notes: "User own rows + tenant admin read + platform admin all" 
  },
  
  // Platform Tables
  { 
    table: "user_profiles", 
    rlsEnabled: true, 
    policyCount: 5, 
    hasTenantId: false, 
    policiesReferenceTenantId: false,
    status: "compliant" as AuditStatus,
    notes: "User own + platform admin all (no DELETE)" 
  },
  {
    table: "access_requests", 
    rlsEnabled: true, 
    policyCount: 3, 
    hasTenantId: false, 
    policiesReferenceTenantId: false,
    status: "compliant" as AuditStatus,
    notes: "User own requests + platform admin manage" 
  },
];

type AuditStatus = "compliant" | "warning" | "unsafe";

function StatusBadge({ status }: { status: AuditStatus }) {
  if (status === "compliant") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
        <Check className="h-3 w-3 mr-1" />
        Compliant
      </Badge>
    );
  }
  if (status === "warning") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Warning
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px]">
      <X className="h-3 w-3 mr-1" />
      Unsafe
    </Badge>
  );
}

function BooleanIndicator({ value, successLabel, failLabel }: { value: boolean; successLabel?: string; failLabel?: string }) {
  return value ? (
    <span className="flex items-center gap-1 text-emerald-600">
      <Check className="h-3.5 w-3.5" />
      {successLabel && <span className="text-[10px]">{successLabel}</span>}
    </span>
  ) : (
    <span className="flex items-center gap-1 text-muted-foreground">
      <X className="h-3.5 w-3.5" />
      {failLabel && <span className="text-[10px]">{failLabel}</span>}
    </span>
  );
}

export default function RLSAuditPage() {
  const { profile } = useAuth();

  // Platform Admin gate
  if (profile?.platform_role !== "platform_admin") {
    return null;
  }

  const compliantCount = RLS_COVERAGE.filter(r => r.status === "compliant").length;
  const warningCount = RLS_COVERAGE.filter(r => r.status === "warning").length;
  const unsafeCount = RLS_COVERAGE.filter(r => r.status === "unsafe").length;

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
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
              Row Level Security policy inventory for all public tables
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{compliantCount}</p>
                  <p className="text-xs text-muted-foreground">Compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{warningCount}</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{unsafeCount}</p>
                  <p className="text-xs text-muted-foreground">Unsafe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RLS Coverage Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Policy Coverage Inventory</CardTitle>
            <CardDescription className="text-xs">
              Audit of RLS status, policy counts, and tenant isolation for all tables in public schema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-medium uppercase">Table</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">RLS Enabled</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">Policy Count</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">Has tenant_id</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">Policies Use tenant_id</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-center">Status</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RLS_COVERAGE.map((row) => (
                    <TableRow key={row.table}>
                      <TableCell className="text-xs font-mono">{row.table}</TableCell>
                      <TableCell className="text-center">
                        <BooleanIndicator value={row.rlsEnabled} />
                      </TableCell>
                      <TableCell className="text-center text-xs">{row.policyCount}</TableCell>
                      <TableCell className="text-center">
                        <BooleanIndicator value={row.hasTenantId} />
                      </TableCell>
                      <TableCell className="text-center">
                        {row.hasTenantId ? (
                          <BooleanIndicator value={row.policiesReferenceTenantId} />
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px]">{row.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Read-only notice */}
        <div className="text-center text-xs text-muted-foreground pt-2">
          This is a read-only audit. No mutations are performed. Policy changes require database migrations.
        </div>
      </div>
    </div>
  );
}
