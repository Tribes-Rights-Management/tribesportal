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
 * WHAT THIS ANSWERS:
 * - "Is the system healthy?" → Governance Overview
 * - "Can this system be trusted under scrutiny?" → Audit & Activity
 * - "Can we respond to a formal request immediately?" → Regulatory
 * - "Is access controlled and defensible?" → Security & Integrity
 * 
 * TONE RULES:
 * - Declarative, not helpful
 * - Sparse, not dense
 * - No encouragement, no onboarding
 * - Empty states: "No issues detected." — that's it.
 * 
 * VISUAL RULES:
 * - Fewer elements than any workspace
 * - More whitespace than operational pages
 * - Muted palette, no accent colors for actions
 * - No primary CTAs on landing
 * - All navigation is secondary
 * 
 * MOBILE RULES:
 * - Read-only inspection only
 * - Vertical stacking
 * - No buttons that imply action
 * - Feels like inspection, not control
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
      className="min-h-full py-12 md:py-16 px-4 md:px-6"
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
        <header className="mb-12 md:mb-16">
          <h1 
            className="text-[22px] md:text-[26px] font-medium tracking-[-0.01em]"
            style={{ color: 'var(--platform-text)' }}
          >
            System Console
          </h1>
          <p 
            className="text-[13px] md:text-[14px] mt-2"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Company governance and oversight
          </p>
          
          {/* Mobile: Read-only notice */}
          {isMobile && (
            <div 
              className="mt-6 flex items-center gap-2.5 text-[11px] px-3 py-2.5 rounded"
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
            Purpose: "Is the system healthy?" at a glance
        ───────────────────────────────────────────────────────────────── */}
        <AdminSection label="Governance Overview">
          <AdminMetricRow
            to="/admin/tenants"
            label="Active workspaces"
            value={loading ? "—" : metrics.activeWorkspaces.toString()}
          />
          <AdminMetricRow
            to="/admin/users"
            label="Active users"
            value={loading ? "—" : metrics.activeUsers.toString()}
          />
          <AdminMetricRow
            to="/admin/approvals"
            label="Pending access requests"
            value={loading ? "—" : metrics.pendingAccessRequests.toString()}
            highlight={metrics.pendingAccessRequests > 0}
          />
          <AdminMetricRow
            to="/admin/security"
            label="Open exceptions"
            value={loading ? "—" : metrics.openExceptions === 0 ? "None" : metrics.openExceptions.toString()}
          />
        </AdminSection>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 2: AUDIT & ACTIVITY
            Purpose: "Can this system be trusted under scrutiny?"
        ───────────────────────────────────────────────────────────────── */}
        <AdminSection label="Audit & Activity">
          <AdminListRow
            to="/admin/approvals"
            title="Activity Log"
            description="Chronological record of system events including user actions, access changes, and data modifications"
          />
          <AdminListRow
            to="/admin/chain"
            title="Correlation Viewer"
            description="Cross-workspace request tracing for end-to-end audit visibility"
          />
          <AdminListRow
            to="/admin/approvals"
            title="Approval History"
            description="Access grants and permission changes with full audit trail"
          />
        </AdminSection>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 3: REGULATORY & DISCLOSURES
            Purpose: "Can we respond to a formal request immediately?"
        ───────────────────────────────────────────────────────────────── */}
        <AdminSection label="Regulatory & Disclosures">
          <AdminListRow
            to="/admin/disclosures"
            title="Disclosure Exports"
            description="Generate regulatory disclosure packs for compliance and legal requests"
          />
          <AdminListRow
            to="/admin/disclosures"
            title="Export History"
            description="Previously generated disclosure records with timestamps and integrity verification"
          />
        </AdminSection>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 4: FINANCIAL GOVERNANCE
            Purpose: "Is financial configuration controlled and auditable?"
        ───────────────────────────────────────────────────────────────── */}
        <AdminSection label="Financial Governance">
          <AdminListRow
            to="/admin/billing"
            title="Billing Overview"
            description="Plans, pricing, and financial configuration governance"
          />
          <AdminListRow
            to="/admin/billing/revenue"
            title="Revenue Overview"
            description="Aggregate revenue metrics across all organizations"
          />
          <AdminListRow
            to="/admin/billing/invoices"
            title="Invoice Ledger"
            description="Read-only view of all invoices across organizations"
          />
          <AdminListRow
            to="/admin/billing/refunds"
            title="Refunds"
            description="Issue and track refunds for completed transactions"
          />
        </AdminSection>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 5: SECURITY & INTEGRITY
            Purpose: "Is access controlled and defensible?"
        ───────────────────────────────────────────────────────────────── */}
        <AdminSection label="Security & Integrity">
          <AdminListRow
            to="/admin/users"
            title="Access Roles"
            description="Member directory and permissions management across all workspaces"
          />
          <AdminListRow
            to="/admin/security"
            title="Session Integrity"
            description="Authentication and session configuration for secure access"
          />
          <AdminListRow
            to="/admin/rls-audit"
            title="Security Events"
            description="RLS verification and access controls with real-time monitoring"
          />
        </AdminSection>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 6: HELP MANAGEMENT
            Purpose: "Content management for Help Center"
        ───────────────────────────────────────────────────────────────── */}
        <AdminSection label="Help Management">
          <AdminListRow
            to="/admin/help/articles"
            title="Articles"
            description="Create and manage Help Center articles"
          />
          <AdminListRow
            to="/admin/help/categories"
            title="Categories"
            description="Organize articles into categories"
          />
        </AdminSection>

          {/* ─────────────────────────────────────────────────────────────────
              FOOTER — Minimal, institutional
          ───────────────────────────────────────────────────────────────── */}
          <footer 
            className="mt-12 pt-6 text-center"
            style={{ borderTop: '1px solid var(--platform-border)' }}
          >
            <p 
              className="text-[11px] uppercase tracking-[0.08em]"
              style={{ color: 'var(--platform-text-muted)', opacity: 0.5 }}
            >
              Access and activity are logged
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}