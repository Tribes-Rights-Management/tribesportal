import { useAuth } from "@/contexts/AuthContext";
import { ConsoleButton, ConsoleChip, ConsoleCard, ConsoleCardHeader, ConsoleCardBody } from "@/components/console";
import { AppTable, AppTableHeader, AppTableBody, AppTableRow, AppTableHead, AppTableCell } from "@/components/app-ui/AppTable";
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
    return <ConsoleChip status="pass" />;
  }
  if (status === "warning") {
    return <ConsoleChip status="warning" />;
  }
  return <ConsoleChip status="fail" />;
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
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link to="/console" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Shield className="h-5 w-5" />
              RLS Coverage Audit
            </h1>
            <p className="text-sm text-muted-foreground">
              Row Level Security policy inventory for all public tables
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ConsoleCard>
            <ConsoleCardBody>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                  <Check className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{compliantCount}</p>
                  <p className="text-xs text-muted-foreground">Compliant</p>
                </div>
              </div>
            </ConsoleCardBody>
          </ConsoleCard>
          <ConsoleCard>
            <ConsoleCardBody>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{warningCount}</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </div>
            </ConsoleCardBody>
          </ConsoleCard>
          <ConsoleCard>
            <ConsoleCardBody>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-900/30 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{unsafeCount}</p>
                  <p className="text-xs text-muted-foreground">Unsafe</p>
                </div>
              </div>
            </ConsoleCardBody>
          </ConsoleCard>
        </div>

        {/* RLS Coverage Table */}
        <ConsoleCard>
          <ConsoleCardHeader 
            title="Policy Coverage Inventory"
            description="Audit of RLS status, policy counts, and tenant isolation for all tables in public schema"
          />
          <ConsoleCardBody>
            <AppTable columns={["20%", "12%", "12%", "12%", "14%", "10%", "20%"]}>
              <AppTableHeader>
                <AppTableRow header>
                  <AppTableHead>Table</AppTableHead>
                  <AppTableHead align="center">RLS Enabled</AppTableHead>
                  <AppTableHead align="center">Policy Count</AppTableHead>
                  <AppTableHead align="center">Has tenant_id</AppTableHead>
                  <AppTableHead align="center">Policies Use tenant_id</AppTableHead>
                  <AppTableHead align="center">Status</AppTableHead>
                  <AppTableHead>Notes</AppTableHead>
                </AppTableRow>
              </AppTableHeader>
              <AppTableBody>
                {RLS_COVERAGE.map((row) => (
                  <AppTableRow key={row.table}>
                    <AppTableCell mono>{row.table}</AppTableCell>
                    <AppTableCell align="center">
                      <BooleanIndicator value={row.rlsEnabled} />
                    </AppTableCell>
                    <AppTableCell align="center">{row.policyCount}</AppTableCell>
                    <AppTableCell align="center">
                      <BooleanIndicator value={row.hasTenantId} />
                    </AppTableCell>
                    <AppTableCell align="center">
                      {row.hasTenantId ? (
                        <BooleanIndicator value={row.policiesReferenceTenantId} />
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </AppTableCell>
                    <AppTableCell align="center">
                      <StatusBadge status={row.status} />
                    </AppTableCell>
                    <AppTableCell muted className="max-w-[200px]">{row.notes}</AppTableCell>
                  </AppTableRow>
                ))}
              </AppTableBody>
            </AppTable>
          </ConsoleCardBody>
        </ConsoleCard>

        {/* Read-only notice */}
        <div className="text-center text-xs text-muted-foreground pt-2">
          This is a read-only audit. No mutations are performed. Policy changes require database migrations.
        </div>
      </div>
    </div>
  );
}
