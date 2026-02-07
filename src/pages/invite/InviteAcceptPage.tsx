import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppButton, AppChip } from "@/components/app-ui";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, Shield, FileText } from "lucide-react";

interface InvitationDetails {
  id: string;
  organization_name: string;
  org_role: string;
  grant_admin_module: boolean;
  grant_licensing_module: boolean;
  invited_email: string;
  expires_at: string;
  status: string;
}

export default function InviteAcceptPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided");
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      const { data, error: fetchError } = await supabase
        .from("invitations")
        .select(`
          id, org_role, grant_admin_module, grant_licensing_module,
          invited_email, expires_at, status,
          tenants:organization_id (name)
        `)
        .eq("token", token)
        .single();

      if (fetchError || !data) { setError("Invalid or expired invitation"); setLoading(false); return; }
      if (data.status !== "pending") { setError(`This invitation has already been ${data.status}`); setLoading(false); return; }
      if (new Date(data.expires_at) < new Date()) { setError("This invitation has expired"); setLoading(false); return; }

      setInvitation({
        id: data.id,
        organization_name: (data.tenants as any)?.name || "Unknown",
        org_role: data.org_role,
        grant_admin_module: data.grant_admin_module,
        grant_licensing_module: data.grant_licensing_module,
        invited_email: data.invited_email,
        expires_at: data.expires_at,
        status: data.status,
      });
      setLoading(false);
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token || !user) return;
    setAccepting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await supabase.functions.invoke("accept-invite", { body: { token } });
      if (response.error) throw response.error;
      if (!response.data?.success) throw new Error(response.data?.error || "Failed to accept");
      toast({ title: "Invitation accepted", description: `You now have access to ${invitation?.organization_name}` });
      await refreshProfile();
      navigate("/workspaces");
    } catch (err: any) {
      console.error("Accept error:", err);
      toast({ title: "Failed to accept invitation", description: err.message || "An error occurred", variant: "destructive" });
    } finally {
      setAccepting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "org_owner": return "Owner";
      case "org_admin": return "Admin";
      case "org_staff": return "Staff";
      case "org_client": return "Client";
      default: return role;
    }
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--app-bg)' }}>
        <div className="max-w-md w-full text-center">
          <h1 className="text-[24px] font-semibold mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to accept this invitation.</p>
          <AppButton onClick={() => navigate(`/auth/sign-in?returnTo=/invite/accept?token=${token}`)}>Sign in</AppButton>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--app-bg)' }}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--app-bg)' }}>
        <div className="max-w-md w-full text-center">
          <XCircle className="h-5 w-5 text-destructive mx-auto mb-4" strokeWidth={1.25} />
          <h1 className="text-[24px] font-semibold mb-2">Invalid invitation</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <AppButton variant="secondary" onClick={() => navigate("/workspaces")}>Go to workspaces</AppButton>
        </div>
      </div>
    );
  }

  if (invitation && user?.email?.toLowerCase() !== invitation.invited_email.toLowerCase()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--app-bg)' }}>
        <div className="max-w-md w-full text-center">
          <XCircle className="h-5 w-5 text-amber-500 mx-auto mb-4" strokeWidth={1.25} />
          <h1 className="text-[24px] font-semibold mb-2">Wrong account</h1>
          <p className="text-muted-foreground mb-2">This invitation was sent to <strong>{invitation.invited_email}</strong></p>
          <p className="text-muted-foreground mb-6">You're signed in as <strong>{user?.email}</strong></p>
          <AppButton variant="secondary" onClick={() => navigate("/auth/sign-in")}>Sign in with different account</AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--app-bg)' }}>
      <div className="max-w-md w-full">
        <div className="bg-card rounded-xl border border-border p-6">
          <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-4" strokeWidth={1.25} />
          <h1 className="text-[22px] font-semibold text-center mb-2">You're invited</h1>
          <p className="text-center text-muted-foreground mb-6">Join <strong>{invitation?.organization_name}</strong></p>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Role</span>
              <AppChip status="pending" label={getRoleLabel(invitation?.org_role || "")} />
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Access</span>
              <div className="flex gap-1">
                {invitation?.grant_admin_module && <AppChip status="pass" label="Admin" />}
                {invitation?.grant_licensing_module && <AppChip status="pass" label="Licensing" />}
              </div>
            </div>
          </div>

          <AppButton className="w-full" onClick={handleAccept} disabled={accepting} loading={accepting} loadingText="Accepting…">
            Accept invitation
          </AppButton>
        </div>
      </div>
    </div>
  );
}
