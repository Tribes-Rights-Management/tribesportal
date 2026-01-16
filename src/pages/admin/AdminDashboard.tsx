import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { NAV_LABELS } from "@/styles/tokens";

/**
 * ADMIN DASHBOARD — INSTITUTIONAL COMMAND CENTER (CANONICAL)
 * 
 * Design Rules:
 * - Dark canvas, no light "page canvas"
 * - Text-first hierarchy, no card metrics
 * - Status rows instead of stat cards
 * - Narrow content column (institutional density)
 * - Flat panels with hairline borders
 * - Language: Access Control, Organizations, Audit Coverage
 */
export default function AdminDashboard() {
  return (
    <div className="max-w-[560px] mx-auto px-6 py-8">
      {/* Header - dense, authoritative */}
      <header className="mb-6">
        <h1 className="text-[18px] font-medium tracking-[-0.01em] text-[var(--platform-text)]">
          {NAV_LABELS.ADMINISTRATION}
        </h1>
        <p className="text-[13px] text-[var(--platform-text-secondary)] mt-1">
          Platform governance and access control
        </p>
      </header>

      {/* System Status - text-first, not card metrics */}
      <section className="mb-6">
        <div 
          className="rounded-md"
          style={{ 
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)'
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--platform-border)' }}>
            <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--platform-text-muted)]">
              System Status
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--platform-border)' }}>
            <StatusRow label="Pending approvals" value="0" />
            <StatusRow label="Active users" value="0" />
            <StatusRow label="Active organizations" value="0" />
            <StatusRow label="Security alerts" value="0" />
          </div>
        </div>
      </section>

      {/* Navigation sections - flat panels */}
      <div 
        className="rounded-md divide-y"
        style={{ 
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)',
          borderColor: 'var(--platform-border)'
        }}
      >
        {/* Access & Identity */}
        <Section title="Access & Identity">
          <NavRow
            to="/admin/approvals"
            label="Access Control"
            meta="Pending approvals, role assignment"
          />
          <NavRow
            to="/admin/users"
            label="User Directory"
            meta="Account status, permissions"
          />
        </Section>

        {/* Organizations */}
        <Section title="Organizations">
          <NavRow
            to="/admin/tenants"
            label="Organizations"
            meta="Tenant configuration, memberships"
          />
        </Section>

        {/* Security & Governance */}
        <Section title="Security & Governance">
          <NavRow
            to="/admin/security/rls"
            label="RLS Verification"
            meta="Row-level security policy coverage"
          />
          <NavRow
            to="/admin/security/auth"
            label="Audit Coverage"
            meta="Authentication and access logging"
          />
          <NavRow
            to="/admin/security/sessions"
            label="Session Integrity"
            meta="Active sessions, token management"
          />
        </Section>

        {/* Platform */}
        <Section title="Platform">
          <NavRow
            to="/admin/settings"
            label="Settings"
            meta="Platform configuration"
          />
        </Section>
      </div>
    </div>
  );
}

/** Status row - inline text, not celebrated metric */
function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div 
      className="flex items-center justify-between px-4 py-2.5"
      style={{ borderColor: 'var(--platform-border)' }}
    >
      <span className="text-[13px] text-[var(--platform-text-secondary)]">{label}</span>
      <span className="text-[13px] font-medium text-[var(--platform-text)]">{value}</span>
    </div>
  );
}

function Section({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--platform-text-muted)] mb-2">
        {title}
      </p>
      <div className="space-y-0">
        {children}
      </div>
    </div>
  );
}

function NavRow({ 
  to, 
  label, 
  meta 
}: { 
  to: string; 
  label: string; 
  meta: string;
}) {
  return (
    <Link 
      to={to} 
      className="flex items-center justify-between py-2 -mx-1 px-1 rounded hover:bg-white/[0.03] transition-colors duration-[180ms] group"
    >
      <div>
        <p className="text-[14px] font-medium text-[var(--platform-text)]">
          {label}
        </p>
        <p className="text-[12px] text-[var(--platform-text-muted)]">
          {meta}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-[var(--platform-text-muted)] group-hover:text-[var(--platform-text-secondary)] transition-colors" />
    </Link>
  );
}
