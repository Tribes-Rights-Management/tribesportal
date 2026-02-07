import { useState, useEffect } from "react";
import { Monitor } from "lucide-react";
import { MOBILE_COPY } from "@/constants/institutional-copy";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { AdminListRow, AdminMetricRow, AdminSection } from "@/components/admin/AdminListRow";

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
 * KEY ARCHITECTURAL DECISIONS:
 * - Stats (AdminMetricRow) live ONLY in Governance Overview
 * - Navigation items (AdminListRow) are separate from stats
 * - Help Workstation is now a standalone module (not in console)
 * - Removed redundant "Help Center Management" section — that content is
 *   accessible through Help Workstation's internal navigation
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
        openExceptions: 0, // Future: count from alerts/exceptions table
      });
      
      setLoading(false);
    }

    fetchMetrics();
  }, []);

  return (
    <div 
      className="min-h-full py-10 md:py-14 px-[20px] md:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      {/* Main content card - elevated surface above page background */}
      <div 
        className="max-w-[860px] mx-auto rounded-lg"
        style={{
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)',
        }}
      >
        <div className="p-6 md:p-8 lg:p-10">
          {/* ─────────────────────────────────────────────────────────────────
              HEADER — Sparse, authoritative
          ───────────────────────────────────────────────────────────────── */}
          <header className="mb-10 md:mb-12">
            <h1 className="page-title">System Console</h1>
            <p 
              className="text-[13px] md:text-[14px] mt-1.5"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Company governance and oversight
            </p>
            
            {/* Mobile: Read-only notice */}
            {isMobile && (
              <div 
                className="mt-5 flex items-center gap-2.5 text-[11px] px-3 py-2.5 rounded"
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
          </header>

          {/* ─────────────────────────────────────────────────────────────────
              SECTION 1: GOVERNANCE OVERVIEW
              Purpose: "Is the system healthy?" — Stats ONLY, no navigation items
          ───────────────────────────────────────────────────────────────── */}
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

          {/* ─────────────────────────────────────────────────────────────────
              SECTION 2: WORKSTATIONS (REMOVED)
              Help Workstation is now a standalone module accessible via /workspaces
              Not shown in System Console anymore
          ───────────────────────────────────────────────────────────────── */}

          {/* ─────────────────────────────────────────────────────────────────
              SECTION 3: AUDIT & ACTIVITY
              Purpose: "Can this system be trusted under scrutiny?"
          ───────────────────────────────────────────────────────────────── */}
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

          {/* ─────────────────────────────────────────────────────────────────
              SECTION 4: REGULATORY & DISCLOSURES
              Purpose: "Can we respond to a formal request immediately?"
          ───────────────────────────────────────────────────────────────── */}
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

          {/* ─────────────────────────────────────────────────────────────────
              SECTION 5: FINANCIAL GOVERNANCE
              Purpose: "Is financial configuration controlled and auditable?"
          ───────────────────────────────────────────────────────────────── */}
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

          {/* ─────────────────────────────────────────────────────────────────
              SECTION 6: SECURITY & INTEGRITY
              Purpose: "Is access controlled and defensible?"
          ───────────────────────────────────────────────────────────────── */}
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

          {/* ─────────────────────────────────────────────────────────────────
              FOOTER — Minimal, institutional
          ───────────────────────────────────────────────────────────────── */}
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
    </div>
  );
}