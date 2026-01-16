import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { NAV_LABELS } from "@/styles/tokens";

/**
 * ADMIN DASHBOARD — GOVERNANCE COMMAND CENTER (CANONICAL)
 * 
 * Design Rules:
 * - Text-first hierarchy, no card metrics
 * - Inline status descriptions, not celebrated numbers
 * - Tables prioritized over cards
 * - Dense, institutional spacing
 * - Language: Access Control, Organizations, Audit Coverage
 */
export default function AdminDashboard() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-8">
      {/* Header - dense, authoritative */}
      <header className="mb-6">
        <h1 className="text-[20px] font-medium tracking-[-0.01em] text-[#111]">
          {NAV_LABELS.ADMINISTRATION}
        </h1>
        <p className="text-[13px] text-[#6B6B6B] mt-1">
          Platform governance and access control
        </p>
      </header>

      {/* Navigation sections - flat, functional */}
      <div className="border border-[#E5E5E5] rounded-md divide-y divide-[#E5E5E5] bg-white">
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

function Section({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#8A8A8A] mb-2">
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
      className="flex items-center justify-between py-2 -mx-1 px-1 rounded hover:bg-[#F5F5F5] transition-colors duration-[180ms] group"
    >
      <div>
        <p className="text-[14px] font-medium text-[#111]">
          {label}
        </p>
        <p className="text-[12px] text-[#8A8A8A]">
          {meta}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-[#D4D4D4] group-hover:text-[#8A8A8A] transition-colors" />
    </Link>
  );
}
