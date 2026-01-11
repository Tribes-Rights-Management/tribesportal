import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Building2, 
  Shield, 
  Settings, 
  ArrowRight,
  Music,
  FileText,
  UserCheck,
  KeyRound,
  ClipboardCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { setActiveContext } = useAuth();
  const navigate = useNavigate();

  const handlePortalClick = (context: "publishing" | "licensing") => {
    setActiveContext(context);
    navigate(`/app/${context}`);
  };

  return (
    <div className="max-w-[960px] mx-auto px-6 py-10">
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Administration</h1>
          <p className="text-[15px] text-muted-foreground">
            Manage platform access, organizations, and security settings.
          </p>
        </div>

        {/* Portal Access */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Portal Access
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <PortalCard
              onClick={() => handlePortalClick("publishing")}
              icon={Music}
              title="Publishing Portal"
              description="Manage works, registrations, splits, and royalty statements."
            />
            <PortalCard
              onClick={() => handlePortalClick("licensing")}
              icon={FileText}
              title="Licensing Portal"
              description="Review catalog, process license requests, and manage agreements."
            />
          </div>
        </section>

        {/* Access Control */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Access Control
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AdminNavCard
              to="/admin/approvals"
              icon={UserCheck}
              title="Pending Requests"
              description="Review and approve access requests"
            />
            <AdminNavCard
              to="/admin/users"
              icon={Users}
              title="User Directory"
              description="Manage user accounts and permissions"
            />
            <AdminNavCard
              to="/admin/roles"
              icon={KeyRound}
              title="Roles & Permissions"
              description="Configure role-based access"
            />
          </div>
        </section>

        {/* Organizations */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Organizations
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AdminNavCard
              to="/admin/tenants"
              icon={Building2}
              title="Tenants"
              description="Manage organizations and scopes"
            />
          </div>
        </section>

        {/* Security & Governance */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Security & Governance
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AdminNavCard
              to="/admin/security/rls"
              icon={Shield}
              title="RLS Audit"
              description="Verify row-level security coverage"
            />
            <AdminNavCard
              to="/admin/security/auth"
              icon={ClipboardCheck}
              title="Auth Review"
              description="Authentication and session settings"
            />
          </div>
        </section>

        {/* Account */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Account
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AdminNavCard
              to="/admin/settings"
              icon={Settings}
              title="Platform Settings"
              description="Configure platform preferences"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function PortalCard({ 
  onClick, 
  icon: Icon, 
  title, 
  description 
}: { 
  onClick: () => void;
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <button 
      onClick={onClick} 
      className="group text-left w-full"
    >
      <div className="h-full p-5 rounded-lg border border-border bg-background hover:border-foreground/20 hover:bg-muted/30 transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80 transition-colors">
            <Icon className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[15px] font-medium text-foreground flex items-center gap-2">
              {title}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </button>
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
