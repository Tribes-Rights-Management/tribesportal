import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, 
  Users, 
  Building2, 
  Shield, 
  Settings, 
  ArrowRight,
  Music,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium tracking-tight">Tribes</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">Administration</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Hero */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Command Center</h1>
            <p className="text-muted-foreground">
              Select a portal to manage or access platform administration tools.
            </p>
          </div>

          {/* Choose Your Path */}
          <section className="space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Choose Your Path
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Publishing Portal */}
              <Link to="/app/publishing" className="group">
                <Card className="h-full border-border hover:border-foreground/20 transition-colors cursor-pointer">
                  <CardHeader className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-foreground/5 transition-colors">
                      <Music className="h-6 w-6 text-foreground/70" />
                    </div>
                    <div className="space-y-1.5">
                      <CardTitle className="text-lg font-medium flex items-center justify-between">
                        Publishing Portal
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Manage works, registrations, splits, and royalty statements for publishing clients.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>

              {/* Licensing Portal */}
              <Link to="/app/licensing" className="group">
                <Card className="h-full border-border hover:border-foreground/20 transition-colors cursor-pointer">
                  <CardHeader className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-foreground/5 transition-colors">
                      <FileText className="h-6 w-6 text-foreground/70" />
                    </div>
                    <div className="space-y-1.5">
                      <CardTitle className="text-lg font-medium flex items-center justify-between">
                        Licensing Portal
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Review catalog, process license requests, and manage licensing agreements.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </section>

          {/* Administration */}
          <section className="space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Administration
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <AdminNavCard
                to="/admin/approvals"
                icon={Users}
                title="Access Control"
                description="Approve users and manage permissions"
              />
              <AdminNavCard
                to="/admin/tenants"
                icon={Building2}
                title="Organizations"
                description="Manage tenants and access scopes"
              />
              <AdminNavCard
                to="/admin/security"
                icon={Shield}
                title="Security & Governance"
                description="Audit RLS and platform security"
              />
              <AdminNavCard
                to="/admin/settings"
                icon={Settings}
                title="Account Settings"
                description="Platform configuration"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
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
      <div className="h-full p-4 rounded-lg border border-border hover:border-foreground/20 hover:bg-muted/50 transition-all">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-foreground/5 transition-colors">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-medium truncate">{title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
