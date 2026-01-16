import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Monitor } from "lucide-react";
import { MOBILE_COPY } from "@/constants/institutional-copy";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

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
      <div className="max-w-[800px] mx-auto">
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
        <Section label="Governance Overview">
          <MetricRow
            to="/admin/tenants"
            label="Active workspaces"
            value={loading ? "—" : metrics.activeWorkspaces.toString()}
          />
          <MetricRow
            to="/admin/users"
            label="Active users"
            value={loading ? "—" : metrics.activeUsers.toString()}
          />
          <MetricRow
            to="/admin/approvals"
            label="Pending access requests"
            value={loading ? "—" : metrics.pendingAccessRequests.toString()}
            highlight={metrics.pendingAccessRequests > 0}
          />
          <MetricRow
            to="/admin/security"
            label="Open exceptions"
            value={loading ? "—" : metrics.openExceptions === 0 ? "None" : metrics.openExceptions.toString()}
          />
        </Section>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 2: AUDIT & ACTIVITY
            Purpose: "Can this system be trusted under scrutiny?"
        ───────────────────────────────────────────────────────────────── */}
        <Section label="Audit & Activity">
          <NavRow
            to="/admin/approvals"
            label="Activity Log"
            description="Chronological record of system events"
          />
          <NavRow
            to="/admin/chain"
            label="Correlation Viewer"
            description="Cross-workspace request tracing"
          />
          <NavRow
            to="/admin/approvals"
            label="Approval History"
            description="Access grants and permission changes"
          />
        </Section>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 3: REGULATORY & DISCLOSURES
            Purpose: "Can we respond to a formal request immediately?"
        ───────────────────────────────────────────────────────────────── */}
        <Section label="Regulatory & Disclosures">
          <NavRow
            to="/admin/disclosures"
            label="Disclosure Exports"
            description="Generate regulatory disclosure packs"
          />
          <NavRow
            to="/admin/disclosures"
            label="Export History"
            description="Previously generated disclosure records"
          />
        </Section>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 4: SECURITY & INTEGRITY
            Purpose: "Is access controlled and defensible?"
        ───────────────────────────────────────────────────────────────── */}
        <Section label="Security & Integrity">
          <NavRow
            to="/admin/users"
            label="Access Roles"
            description="Member directory and permissions"
          />
          <NavRow
            to="/admin/security"
            label="Session Integrity"
            description="Authentication and session configuration"
          />
          <NavRow
            to="/admin/rls-audit"
            label="Security Events"
            description="RLS verification and access controls"
          />
        </Section>

        {/* ─────────────────────────────────────────────────────────────────
            FOOTER — Minimal, institutional
        ───────────────────────────────────────────────────────────────── */}
        <footer 
          className="mt-16 pt-8 text-center"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}
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
  );
}

/**
 * SECTION — Sparse grouping with small caps label
 */
function Section({ 
  label, 
  children 
}: { 
  label: string; 
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 md:mb-12">
      <h2 
        className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.1em] mb-4 md:mb-5"
        style={{ color: 'var(--platform-text-muted)', opacity: 0.7 }}
      >
        {label}
      </h2>
      <div 
        className="rounded-lg overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * METRIC ROW — Read-only count with subtle link
 * No action affordance. Link goes to detail view.
 */
function MetricRow({ 
  to, 
  label, 
  value,
  highlight = false
}: { 
  to: string; 
  label: string; 
  value: string;
  highlight?: boolean;
}) {
  return (
    <Link 
      to={to} 
      className="flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4 transition-colors duration-150 group"
      style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <span 
        className="text-[13px] md:text-[14px]"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span 
          className="text-[13px] md:text-[14px] font-medium tabular-nums"
          style={{ 
            color: highlight ? 'rgba(255, 255, 255, 0.9)' : 'var(--platform-text-muted)'
          }}
        >
          {value}
        </span>
        <ChevronRight 
          className="h-3.5 w-3.5 opacity-30 group-hover:opacity-50 transition-opacity"
          style={{ color: 'var(--platform-text-muted)' }}
        />
      </div>
    </Link>
  );
}

/**
 * NAV ROW — Secondary navigation link
 * No primary CTA styling. Subtle, intentional.
 */
function NavRow({ 
  to, 
  label, 
  description 
}: { 
  to: string; 
  label: string; 
  description: string;
}) {
  return (
    <Link 
      to={to} 
      className="flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4 transition-colors duration-150 group"
      style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div className="min-w-0 flex-1">
        <p 
          className="text-[13px] md:text-[14px]"
          style={{ color: 'var(--platform-text)' }}
        >
          {label}
        </p>
        <p 
          className="text-[11px] md:text-[12px] mt-0.5 truncate"
          style={{ color: 'var(--platform-text-muted)', opacity: 0.7 }}
        >
          {description}
        </p>
      </div>
      <ChevronRight 
        className="h-3.5 w-3.5 shrink-0 ml-3 opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ color: 'var(--platform-text-muted)' }}
      />
    </Link>
  );
}