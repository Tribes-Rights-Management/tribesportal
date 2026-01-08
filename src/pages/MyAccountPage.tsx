import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  account_status: string;
  company: string | null;
  country: string | null;
  company_type: string | null;
  last_sign_in_at: string | null;
}

const COMPANY_TYPE_LABELS: Record<string, string> = {
  indie_church: "Indie / Church",
  commercial: "Commercial",
  broadcast: "Broadcast",
};

export default function MyAccountPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showSignOutAllDialog, setShowSignOutAllDialog] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, account_status, company, country, company_type, last_sign_in_at")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  async function handleSignOutAll() {
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast({ title: "Signed out of all sessions" });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Error", description: "Failed to sign out", variant: "destructive" });
    }
    setShowSignOutAllDialog(false);
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl opacity-0" />
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl py-16">
          <p className="text-sm text-muted-foreground">
            Account settings will appear here as features are enabled.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const lastSignIn = user?.last_sign_in_at || profile.last_sign_in_at;

  return (
    <DashboardLayout>
      {/* Sign Out Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of this session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sign Out All Dialog */}
      <AlertDialog open={showSignOutAllDialog} onOpenChange={setShowSignOutAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of all sessions</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out of all devices and browsers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOutAll}>Sign out all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-2xl animate-content-fade">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-1">My Account</h1>
          <p className="text-sm text-muted-foreground">
            Your account information.
          </p>
        </div>

        <div className="space-y-12">
          {/* Account Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Account</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Full name</p>
                <p className="text-sm">{profile.name || "—"}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email address</p>
                <p className="text-sm">{profile.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Used for login and license notifications</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Role</p>
                <p className="text-sm">User</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Account status</p>
                <p className="text-sm capitalize">{profile.account_status}</p>
              </div>
            </div>
          </section>

          {/* Organization Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Organization</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Company name</p>
                <p className="text-sm">{profile.company || "—"}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Country</p>
                <p className="text-sm">{profile.country || "—"}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Company type</p>
                <p className="text-sm">
                  {profile.company_type 
                    ? COMPANY_TYPE_LABELS[profile.company_type] || profile.company_type 
                    : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Security</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Authentication method</p>
                <p className="text-sm">Email magic link</p>
              </div>
              
              {lastSignIn && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Last sign in</p>
                  <p className="text-sm">
                    {format(new Date(lastSignIn), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
              
              <div className="pt-2">
                <button
                  onClick={() => setShowSignOutAllDialog(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign out of all sessions
                </button>
              </div>
            </div>
          </section>

          {/* Sign Out - Bottom of page */}
          <section className="pt-4 border-t border-border/50">
            <button
              onClick={() => setShowSignOutDialog(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
