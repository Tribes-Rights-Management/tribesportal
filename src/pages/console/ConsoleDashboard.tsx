import { useState, useEffect } from "react";
import { Monitor } from "lucide-react";
import { MOBILE_COPY } from "@/constants/institutional-copy";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { AdminListRow, AdminMetricRow, AdminSection } from "@/components/admin/AdminListRow";
import { AppPageLayout } from "@/components/app-ui";

/**
 * SYSTEM CONSOLE LANDING — EXECUTIVE-GRADE GOVERNANCE (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * PURPOSE: True executive control plane. Not a dashboard. Not operational.
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INFORMATION ARCHITECTURE (REVISED):
 * 
 * 1. GOVERNANCE OVERVIEW — Stats only (metrics that answer "is the system healthy?")
 * 2. AUDIT & ACTIVITY — Logs, trails, correlation
 * 3. REGULATORY & DISCLOSURES — Compliance exports
 * 4. FINANCIAL GOVERNANCE — Billing, revenue, invoices
 * 5. SECURITY & INTEGRITY — Access, sessions, RLS
 * 
 * VISUAL RULES:
 * - Fewer elements than any workspace
 * - More whitespace than operational pages
 * - Muted palette, no accent colors for actions
 * - No primary CTAs on landing
 * - All navigation is secondary
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface GovernanceMetrics {
  activeWorkspaces: number;
  activeUsers: number;
  pendingAccessRequests: number;
  openExceptions: number;
}

export default function AdminDashboard() {
  const isMobile = useIsMobile();
  const [metrics, setMetrics] = useState<GovernanceMetrics>({
    activeWorkspaces: 0,
    activeUsers: 0,
    pendingAccessRequests: 0,
    openExceptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      
      const [tenantsRes, usersRes, accessReqRes] = await Promise.all([
        supabase.from('tenants').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('access_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setMetrics({
        activeWorkspaces: tenantsRes.count ?? 0,
        activeUsers: usersRes.count ?? 0,
        pendingAccessRequests: accessReqRes.count ?? 0,
        openExceptions: 0,
      });
      
      setLoading(false);
    }

    fetchMetrics();
  }, []);

  return (
    <AppPageLayout title="System Console">
      {/* Subtitle */}
      <p 
        className="text-[13px] md:text-[14px] -mt-2 mb-6"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        Company governance and oversight
      </p>

      {/* Mobile: Read-only notice */}
      {isMobile && (
        <div 
          className="mb-6 flex items-center gap-2.5 text-[11px] px-3 py-2.5 rounded"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            color: 'var(--platform-text-muted)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <Monitor className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <span>{MOBILE_COPY.SYSTEM_CONSOLE_READ_ONLY}</span>
        </div>
      )}

      {/* Dashboard card */}
      <div 
        className="rounded-lg"
        style={{
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)',
        }}
      >
        <div className="p-6 md:p-8 lg:p-10">

          {/* SECTION 1: GOVERNANCE OVERVIEW */}
          <AdminSection label="Governance Overview">
            <AdminMetricRow
              to="/console/tenants"
              label="Active workspaces"
              value={loading ? "—" : metrics.activeWorkspaces.toString()}
            />
            <AdminMetricRow
              to="/console/users"
              label="Active users"
              value={loading ? "—" : metrics.activeUsers.toString()}
            />
            <AdminMetricRow
              to="/console/approvals"
              label="Pending access requests"
              value={loading ? "—" : metrics.pendingAccessRequests.toString()}
              highlight={metrics.pendingAccessRequests > 0}
            />
            <AdminMetricRow
              to="/console/security"
              label="Open exceptions"
              value={loading ? "—" : metrics.openExceptions === 0 ? "None" : metrics.openExceptions.toString()}
            />
          </AdminSection>

          {/* SECTION 2: AUDIT & ACTIVITY */}
          <AdminSection label="Audit & Activity">
            <AdminListRow
              to="/console/approvals"
              title="Activity Log"
              description="Chronological record of system events including user actions, access changes, and data modifications"
            />
            <AdminListRow
              to="/console/chain"
              title="Correlation Viewer"
              description="Cross-workspace request tracing for end-to-end audit visibility"
            />
            <AdminListRow
              to="/console/approvals"
              title="Approval History"
              description="Access grants and permission changes with full audit trail"
            />
          </AdminSection>

          {/* SECTION 3: REGULATORY & DISCLOSURES */}
          <AdminSection label="Regulatory & Disclosures">
            <AdminListRow
              to="/console/disclosures"
              title="Disclosure Exports"
              description="Generate regulatory disclosure packs for compliance and legal requests"
            />
            <AdminListRow
              to="/console/disclosures"
              title="Export History"
              description="Previously generated disclosure records with timestamps and integrity verification"
            />
          </AdminSection>

          {/* SECTION 4: FINANCIAL GOVERNANCE */}
          <AdminSection label="Financial Governance">
            <AdminListRow
              to="/console/billing"
              title="Billing Overview"
              description="Plans, pricing, and financial configuration governance"
            />
            <AdminListRow
              to="/console/billing/revenue"
              title="Revenue Overview"
              description="Aggregate revenue metrics across all organizations"
            />
            <AdminListRow
              to="/console/billing/invoices"
              title="Invoice Ledger"
              description="Read-only view of all invoices across all organizations"
            />
            <AdminListRow
              to="/console/billing/refunds"
              title="Refunds"
              description="Issue and track refunds for completed transactions"
            />
          </AdminSection>

          {/* SECTION 5: SECURITY & INTEGRITY */}
          <AdminSection label="Security & Integrity">
            <AdminListRow
              to="/console/users"
              title="Access Roles"
              description="Member directory and permissions management across all workspaces"
            />
            <AdminListRow
              to="/console/security"
              title="Session Integrity"
              description="Authentication and session configuration for secure access"
            />
            <AdminListRow
              to="/console/rls-audit"
              title="Security Events"
              description="RLS verification and access controls with real-time monitoring"
            />
          </AdminSection>

          {/* FOOTER */}
          <footer 
            className="mt-10 pt-5 text-center"
            style={{ borderTop: '1px solid var(--platform-border)' }}
          >
            <p 
              className="text-[10px] uppercase tracking-[0.1em]"
              style={{ color: 'var(--platform-text-muted)', opacity: 0.4 }}
            >
              Access and activity are logged
            </p>
          </footer>
        </div>
      </div>
    </AppPageLayout>
  );
}
