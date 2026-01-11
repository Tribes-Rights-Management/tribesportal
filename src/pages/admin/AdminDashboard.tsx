import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
          Administration
        </h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Platform access, governance, and security
        </p>
      </header>

      {/* Sections */}
      <div className="space-y-10">
        {/* Access & Identity */}
        <Section title="Access & Identity">
          <NavItem
            to="/admin/approvals"
            label="Access Control"
            description="Users, roles, and pending requests"
          />
        </Section>

        {/* Organizations */}
        <Section title="Organizations">
          <NavItem
            to="/admin/tenants"
            label="Organizations"
            description="Tenants and memberships"
          />
        </Section>

        {/* Security & Governance */}
        <Section title="Security & Governance">
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
        </Section>

        {/* Platform Account */}
        <Section title="Platform Account">
          <NavItem
            to="/admin/settings"
            label="Account Settings"
            description="Platform configuration and preferences"
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
    <section>
      <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-3">
        {title}
      </h2>
      <div className="border-t border-border">
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
      className="flex items-center justify-between py-4 border-b border-border group hover:bg-muted/30 -mx-3 px-3 transition-colors duration-150"
    >
      <div className="space-y-0.5">
        <p className="text-[15px] font-medium text-foreground group-hover:text-foreground/80">
          {label}
        </p>
        <p className="text-[13px] text-muted-foreground">
          {description}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
    </Link>
  );
}

function AdminNavCard({ 
  to, 
  icon: Icon, 
  title, 
  description 
}: { 
  to: string; 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <Link to={to} className="group">
      <div className="h-full p-4 rounded-lg border border-border bg-background hover:border-foreground/15 hover:bg-muted/30 transition-all duration-200">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[14px] font-medium text-foreground">{title}</p>
            <p className="text-[12px] text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
