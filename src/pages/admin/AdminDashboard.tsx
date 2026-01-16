import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { EMPTY_STATES, WORKSPACE_LANDING } from "@/constants/institutional-copy";

/**
 * SYSTEM CONSOLE DASHBOARD — COMPANY-LEVEL GOVERNANCE (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER ENFORCEMENT DIRECTIVE — LOCKED ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * System Console is NOT a workspace. It is company-level governance.
 * 
 * PURPOSE:
 * - Governance dashboards
 * - Security posture
 * - Audit logs
 * - Regulatory disclosures
 * - Cross-workspace reporting
 * - Correlation views
 * 
 * WHAT SYSTEM CONSOLE MUST NEVER CONTAIN:
 * - Licensing
 * - Tribes Admin
 * - Operational queues
 * - Catalogs
 * - Requests
 * - Client or licensee actions
 * 
 * UI RULES:
 * - Dark canvas, sparse, supervisory
 * - No workspace selector
 * - No product navigation
 * - Accessed only via user/profile menu
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function AdminDashboard() {
  return (
    <div 
      className="min-h-full py-10 px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px] mx-auto">
        {/* Page Header */}
        <header className="mb-8">
          <h1 
            className="text-[28px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--platform-text)' }}
          >
            {WORKSPACE_LANDING.SYSTEM_CONSOLE.title}
          </h1>
          <p 
            className="text-[15px] mt-1.5 leading-relaxed"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            {WORKSPACE_LANDING.SYSTEM_CONSOLE.description}
          </p>
        </header>

        {/* Pending Approvals Section */}
        <section className="mb-6">
          <div 
            className="rounded"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)'
            }}
          >
            <div 
              className="px-5 py-3"
              style={{ borderBottom: '1px solid var(--platform-border)' }}
            >
              <p 
                className="text-[10px] font-medium uppercase tracking-[0.08em]"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                Pending Approvals
              </p>
            </div>
            <div className="px-5 py-8 text-center">
              <p 
                className="text-[14px] font-medium"
                style={{ color: 'var(--platform-text-secondary)' }}
              >
                {EMPTY_STATES.PENDING_APPROVALS.title}
              </p>
              <p 
                className="text-[13px] mt-1"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                {EMPTY_STATES.PENDING_APPROVALS.description}
              </p>
            </div>
          </div>
        </section>

        {/* System Alerts Section */}
        <section className="mb-6">
          <div 
            className="rounded"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)'
            }}
          >
            <div 
              className="px-5 py-3"
              style={{ borderBottom: '1px solid var(--platform-border)' }}
            >
              <p 
                className="text-[10px] font-medium uppercase tracking-[0.08em]"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                System Alerts
              </p>
            </div>
            <div className="px-5 py-8 text-center">
              <p 
                className="text-[14px] font-medium"
                style={{ color: 'var(--platform-text-secondary)' }}
              >
                {EMPTY_STATES.SYSTEM_ALERTS.title}
              </p>
              <p 
                className="text-[13px] mt-1"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                {EMPTY_STATES.SYSTEM_ALERTS.description}
              </p>
            </div>
          </div>
        </section>

        {/* Navigation Sections — GOVERNANCE ONLY */}
        <div 
          className="rounded"
          style={{ 
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)'
          }}
        >
          {/* Governance */}
          <NavSection title="Governance">
            <NavRow
              to="/admin/disclosures"
              label="Regulatory Disclosures"
              description="Disclosure registry and export history"
            />
            <NavRow
              to="/admin/chain"
              label="Correlation Chain"
              description="Cross-workspace activity tracing"
            />
          </NavSection>

          {/* Security & Compliance */}
          <NavSection title="Security & Compliance" hasBorder>
            <NavRow
              to="/admin/rls-audit"
              label="RLS Verification"
              description="Row-level security coverage audit"
            />
            <NavRow
              to="/admin/security"
              label="Authentication & Access"
              description="Auth configuration and session integrity"
            />
          </NavSection>

          {/* Audit */}
          <NavSection title="Audit Oversight" hasBorder>
            <NavRow
              to="/admin/approvals"
              label="Access Control Log"
              description="Approval history and access grants"
            />
            <NavRow
              to="/admin/users"
              label="Member Directory"
              description="Account status and permissions"
            />
          </NavSection>

          {/* Organizations (read-only view) */}
          <NavSection title="Cross-Workspace" hasBorder>
            <NavRow
              to="/admin/tenants"
              label="Workspaces Overview"
              description="View registered workspaces (read-only)"
            />
          </NavSection>
        </div>
      </div>
    </div>
  );
}

/** 
 * Navigation Section — small caps header with grouped rows
 */
function NavSection({ 
  title, 
  children,
  hasBorder = false
}: { 
  title: string; 
  children: React.ReactNode;
  hasBorder?: boolean;
}) {
  return (
    <div 
      className="px-5 py-4"
      style={hasBorder ? { borderTop: '1px solid var(--platform-border)' } : undefined}
    >
      <p 
        className="text-[10px] font-medium uppercase tracking-[0.08em] mb-3"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        {title}
      </p>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

/** 
 * Navigation Row — full-width click target, no icons
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
      className="flex items-center justify-between py-2.5 -mx-2 px-2 rounded transition-colors duration-[180ms] group"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div>
        <p 
          className="text-[15px] font-medium"
          style={{ color: 'var(--platform-text)' }}
        >
          {label}
        </p>
        <p 
          className="text-[13px] mt-0.5"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          {description}
        </p>
      </div>
      <ChevronRight 
        className="h-4 w-4 shrink-0 transition-colors duration-[180ms]"
        style={{ color: 'var(--platform-text-muted)' }}
      />
    </Link>
  );
}
