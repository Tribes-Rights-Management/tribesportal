import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * ADMIN DASHBOARD — INSTITUTIONAL CONTROL SURFACE (CANONICAL)
 * 
 * This is NOT a dashboard. It is a system administration surface.
 * 
 * Design Rules:
 * - Dark canvas, no white page background
 * - Centered narrow column (~960-1000px max)
 * - Flat panels with hairline borders
 * - Status list (not metric cards)
 * - Navigation rows (not clickable cards)
 * - Typography matches auth (30-32px H1, reduced weights)
 * - Language: declarative, institutional, non-conversational
 */
export default function AdminDashboard() {
  return (
    <div 
      className="min-h-full py-10 px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px] mx-auto">
        {/* Page Header - auth-matched typography */}
        <header className="mb-8">
          <h1 
            className="text-[28px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--platform-text)' }}
          >
            Administration
          </h1>
          <p 
            className="text-[15px] mt-1.5 leading-relaxed"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            Platform access, governance, and security
          </p>
        </header>

        {/* System Status - vertical list, not cards */}
        <section className="mb-8">
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
                System Status
              </p>
            </div>
            <div>
              <StatusRow label="Pending approvals" value="0" />
              <StatusRow label="Active users" value="0" />
              <StatusRow label="Active organizations" value="0" />
              <StatusRow label="Security alerts" value="0" />
            </div>
          </div>
        </section>

        {/* Navigation Sections - rows, not cards */}
        <div 
          className="rounded"
          style={{ 
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)'
          }}
        >
          {/* Access & Identity */}
          <NavSection title="Access & Identity">
            <NavRow
              to="/admin/approvals"
              label="Access Control"
              description="Users, roles, and approvals"
            />
            <NavRow
              to="/admin/users"
              label="User Directory"
              description="Account status and permissions"
            />
          </NavSection>

          {/* Organizations */}
          <NavSection title="Organizations" hasBorder>
            <NavRow
              to="/admin/tenants"
              label="Organizations"
              description="Tenant configuration, memberships"
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
              to="/admin/settings"
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
 * Status Row — inline label + right-aligned value
 * Administrative truth, not analytics
 */
function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div 
      className="flex items-center justify-between px-5 py-3"
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      <span 
        className="text-[14px]"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {label}
      </span>
      <span 
        className="text-[14px] font-medium tabular-nums"
        style={{ color: 'var(--platform-text)' }}
      >
        {value}
      </span>
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
 * Feels like entering a secured subsystem
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
