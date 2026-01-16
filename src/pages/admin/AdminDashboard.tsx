import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { StatusIndicator } from "@/components/app/StatusIndicator";
import { DASHBOARD_LABELS, NAV_LABELS } from "@/styles/tokens";

/**
 * ADMIN DASHBOARD — SYSTEM STATUS VIEW
 * 
 * Dashboard Rules:
 * - Status over summary
 * - Show counts, states, alerts
 * - No charts for storytelling
 * - Communicate operational state, not performance
 * 
 * Role-based Entry:
 * - Platform admins land here by default
 * - This is the governance command center
 */
export default function AdminDashboard() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      {/* Header - functional, restrained */}
      <header className="mb-8">
        <h1 className="text-[24px] font-semibold tracking-tight text-[#111]">
          {NAV_LABELS.ADMINISTRATION}
        </h1>
        <p className="text-[14px] text-[#6B6B6B] mt-1">
          Platform access, governance, and security
        </p>
      </header>

      {/* Status indicators - operational state */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatusIndicator 
          label={DASHBOARD_LABELS.PENDING_APPROVALS} 
          count={0}
          level="warning"
        />
        <StatusIndicator 
          label={DASHBOARD_LABELS.ACTIVE_USERS} 
          count={0}
        />
        <StatusIndicator 
          label={DASHBOARD_LABELS.ACTIVE_TENANTS} 
          count={0}
        />
        <StatusIndicator 
          label={DASHBOARD_LABELS.SECURITY_ALERTS} 
          count={0}
        />
      </div>

      {/* Navigation sections - flat, functional */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
        {/* Access & Identity */}
        <ContentSection title="Access & Identity">
          <NavItem
            to="/admin/approvals"
            label={NAV_LABELS.ACCESS_CONTROL}
            description="Users, roles, and pending requests"
          />
        </ContentSection>

        {/* Organizations */}
        <ContentSection title="Organizations">
          <NavItem
            to="/admin/tenants"
            label={NAV_LABELS.ORGANIZATIONS}
            description="Tenants and memberships"
          />
        </ContentSection>

        {/* Security & Governance */}
        <ContentSection title="Security & Governance">
          <NavItem
            to="/admin/security/rls"
            label={NAV_LABELS.RLS_VERIFICATION}
            description="Row-level security policy coverage"
          />
          <NavItem
            to="/admin/security/auth"
            label={NAV_LABELS.AUDIT_COVERAGE}
            description="Authentication and access logging"
          />
          <NavItem
            to="/admin/security/sessions"
            label={NAV_LABELS.SESSION_INTEGRITY}
            description="Active sessions and token management"
          />
        </ContentSection>

        {/* Platform Account */}
        <ContentSection title="Platform Account">
          <NavItem
            to="/admin/settings"
            label={NAV_LABELS.ACCOUNT_SETTINGS}
            description="Platform configuration and preferences"
          />
        </ContentSection>
      </div>
    </div>
  );
}

function ContentSection({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 py-4">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B6B6B] mb-2">
        {title}
      </h2>
      <div className="space-y-0">
        {children}
      </div>
    </section>
  );
}

function NavItem({ 
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
      className="flex items-center justify-between py-2.5 group hover:bg-[#F5F5F5] -mx-2 px-2 rounded-md transition-colors duration-[180ms]"
    >
      <div className="space-y-0.5">
        <p className="text-[14px] font-medium text-[#111]">
          {label}
        </p>
        <p className="text-[12px] text-[#6B6B6B]">
          {description}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-[#D4D4D4] group-hover:text-[#6B6B6B] transition-colors" />
    </Link>
  );
}
