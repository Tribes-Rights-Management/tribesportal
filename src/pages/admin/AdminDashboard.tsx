import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Current session information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>
                <p className="font-medium capitalize">{profile?.role}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium capitalize">{profile?.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Login:</span>
                <p className="font-medium">
                  {profile?.last_login_at 
                    ? new Date(profile.last_login_at).toLocaleString() 
                    : "First login"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administration</CardTitle>
            <CardDescription>Manage users and system settings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                User Directory
              </Link>
            </Button>
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
        </Card>
      </div>
    </div>
  );
}
