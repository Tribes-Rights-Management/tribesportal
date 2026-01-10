import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LogOut, Users, Building2, ClipboardCheck, Shield, ChevronDown, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState({ tenants: 0, users: 0 });
  const [securityExpanded, setSecurityExpanded] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      const [tenantsRes, usersRes] = await Promise.all([
        supabase.from("tenants").select("id", { count: "exact", head: true }),
        supabase.from("user_profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      setStats({
        tenants: tenantsRes.count ?? 0,
        users: usersRes.count ?? 0,
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Platform Administration</h1>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        {/* Platform Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Role</p>
            <p className="font-medium">Platform Administrator</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Active Tenants</p>
            <p className="font-medium">{stats.tenants}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Active Users</p>
            <p className="font-medium">{stats.users}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Security Status</p>
            <p className="font-medium flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Healthy
            </p>
          </div>
        </div>

        {/* Access Control — Primary */}
        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>Approve users and manage platform access</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admin/approvals">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Pending Approvals
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                User Directory
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Organizations — Secondary */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>Manage tenant organizations and access scopes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/admin/tenants">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Tenants
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Security & Governance — Collapsed */}
        <Collapsible open={securityExpanded} onOpenChange={setSecurityExpanded}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer select-none hover:bg-muted/50 transition-colors rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Security & Governance</CardTitle>
                    <CardDescription>Audit tools and compliance verification</CardDescription>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      securityExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="flex flex-wrap gap-3 pt-0">
                <Button asChild variant="outline">
                  <Link to="/admin/rls-audit">
                    <Shield className="mr-2 h-4 w-4" />
                    RLS Coverage Audit
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/admin/security">
                    <Shield className="mr-2 h-4 w-4" />
                    Security Verification
                  </Link>
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
}
