import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { EMPTY_STATES, WORKSPACE_LANDING } from "@/constants/institutional-copy";

/**
 * ADMIN DASHBOARD — TRIBES TEAM LANDING (CANONICAL)
 * 
 * Internal operations workspace for staff.
 * Handles approvals for ALL external access (Licensing + Portal).
 * Provides system health + audit + security views.
 * 
 * Design Rules:
 * - Dark canvas, no white page background
 * - Centered narrow column (~960-1000px max)
 * - Flat panels with hairline borders
 * - Status list (not metric cards)
 * - Navigation rows (not clickable cards)
 * - Language: declarative, institutional, non-conversational
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
            {WORKSPACE_LANDING.ADMIN.title}
          </h1>
          <p 
            className="text-[15px] mt-1.5 leading-relaxed"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            {WORKSPACE_LANDING.ADMIN.description}
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

        {/* Navigation Sections */}
        <div 
          className="rounded"
          style={{ 
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)'
          }}
        >
          {/* Organizations */}
          <NavSection title="Organizations">
            <NavRow
              to="/admin/tenants"
              label="Organizations overview"
              description="View client and licensing organizations managed by Tribes."
            />
          </NavSection>

          {/* Access & Identity */}
          <NavSection title="Access & Identity" hasBorder>
            <NavRow
              to="/admin/approvals"
              label="Access Control"
              description="Accounts, roles, and approvals"
            />
            <NavRow
              to="/admin/users"
              label="Member Directory"
              description="Account status and permissions"
            />
          </NavSection>

          {/* Security & Governance */}
          <NavSection title="Security & Governance" hasBorder>
            <NavRow
              to="/admin/rls-audit"
              label="RLS Verification"
              description="Row-level security coverage"
            />
            <NavRow
              to="/admin/security"
              label="Audit Coverage"
              description="Authentication and access logs"
            />
          </NavSection>

          {/* Platform Account */}
          <NavSection title="Platform Account" hasBorder>
            <NavRow
              to="/account"
              label="Account Settings"
              description="Profile, preferences, and security configuration"
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
