import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
          Administration
        </h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Platform access, governance, and security
        </p>
      </header>

      {/* White content surface */}
      <div className="bg-background rounded-xl border border-border/50 divide-y divide-border/50">
        {/* Access & Identity */}
        <ContentSection title="Access & Identity">
          <NavItem
            to="/admin/approvals"
            label="Access Control"
            description="Users, roles, and pending requests"
          />
        </ContentSection>

        {/* Organizations */}
        <ContentSection title="Organizations">
          <NavItem
            to="/admin/tenants"
            label="Organizations"
            description="Tenants and memberships"
          />
        </ContentSection>

        {/* Security & Governance */}
        <ContentSection title="Security & Governance">
          <NavItem
            to="/admin/security/rls"
            label="RLS Verification"
            description="Row-level security policy coverage"
          />
          <NavItem
            to="/admin/security/auth"
            label="Audit Coverage"
            description="Authentication and access logging"
          />
          <NavItem
            to="/admin/security/sessions"
            label="Session Integrity"
            description="Active sessions and token management"
          />
        </ContentSection>

        {/* Platform Account */}
        <ContentSection title="Platform Account">
          <NavItem
            to="/admin/settings"
            label="Account Settings"
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
    <section className="px-6 py-5">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-3">
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
      className="flex items-center justify-between py-3 group hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors duration-150"
    >
      <div className="space-y-0.5">
        <p className="text-[15px] font-medium text-foreground group-hover:text-foreground/80">
          {label}
        </p>
        <p className="text-[13px] text-muted-foreground">
          {description}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
    </Link>
  );
}
