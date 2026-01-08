import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  AccessApproveModal, 
  AccessRejectModal,
  AuditLogHeader 
} from "@/components/admin/AdminGuardrails";

interface AccessRequestProfile {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  company_type: string | null;
  company_description: string | null;
  country: string | null;
  account_status: string;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

interface AuditLogEntry {
  id: string;
  created_at: string;
  action: string;
  actor_id: string;
  target_email: string | null;
  details: unknown;
}

const COMPANY_TYPE_LABELS: Record<string, string> = {
  // Legacy types
  indie_church: "Indie / Church",
  commercial: "Commercial",
  broadcast: "Broadcast",
  // New licensing account types
  licensing_commercial_brand: "Commercial / Brand",
  licensing_broadcast_media: "Broadcast / Media",
  licensing_church_ministry: "Church / Ministry",
  licensing_agency: "Agency",
  licensing_independent_creator: "Independent Creator",
  licensing_other: "Other",
  // Fallback for old format
  licensing_commercial: "Commercial",
  licensing_broadcast: "Broadcast",
  licensing_ministry: "Ministry",
};

const ACTION_LABELS: Record<string, string> = {
  access_request_approved: "Approved access request",
  access_request_rejected: "Rejected access request",
};

export default function AdminAccessRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<AccessRequestProfile | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile();
      if (isSuperAdmin) {
        fetchAuditLog();
      }
    }
  }, [id, isSuperAdmin]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ title: "Error", description: "Failed to load request", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAuditLog() {
    try {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("target_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAuditLog(data || []);
    } catch (error) {
      console.error("Error fetching audit log:", error);
    }
  }

  async function handleApprove() {
    if (!profile) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("approve-access-request", {
        body: { profileId: profile.id },
      });

      if (error) throw error;

      toast({ title: "Access approved", description: "The user can now sign in." });
      navigate("/admin/access-requests");
    } catch (error: any) {
      console.error("Error approving:", error);
      toast({ title: "Error", description: error.message || "Failed to approve request", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setShowApproveDialog(false);
    }
  }

  async function handleReject() {
    if (!profile) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("reject-access-request", {
        body: { profileId: profile.id },
      });

      if (error) throw error;

      toast({ title: "Request rejected" });
      navigate("/admin/access-requests");
    } catch (error: any) {
      console.error("Error rejecting:", error);
      toast({ title: "Error", description: error.message || "Failed to reject request", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setShowRejectDialog(false);
    }
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
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">Request not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  const isPending = profile.account_status === "pending";

  return (
    <DashboardLayout>
      {/* Approve Dialog */}
      <AccessApproveModal
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        isProcessing={isProcessing}
        userName={profile.name || profile.email}
      />

      {/* Reject Dialog */}
      <AccessRejectModal
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={handleReject}
        isProcessing={isProcessing}
      />

      <div className="max-w-2xl animate-content-fade">
        {/* Back link */}
        <Link 
          to="/admin/access-requests" 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
        >
          Access Requests
        </Link>

        {/* Header with actions */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="mb-1">{profile.name || profile.email}</h1>
            <p className="text-sm text-muted-foreground capitalize">{profile.account_status}</p>
          </div>
          
          {isSuperAdmin && isPending && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveDialog(true)}
                disabled={isProcessing}
                className="text-sm text-foreground hover:text-foreground/80 transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => setShowRejectDialog(true)}
                disabled={isProcessing}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Request details */}
        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Contact</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                <p className="text-sm">{profile.name || "—"}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="text-sm">{profile.email}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Country</p>
                <p className="text-sm">{profile.country || "—"}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Company</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Company name</p>
                <p className="text-sm">{profile.company || "—"}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Company type</p>
                <p className="text-sm">
                  {profile.company_type 
                    ? COMPANY_TYPE_LABELS[profile.company_type] || profile.company_type 
                    : "—"}
                </p>
              </div>
              
              {profile.company_description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{profile.company_description}</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Request</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Submitted</p>
                <p className="text-sm">
                  {format(new Date(profile.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              
              {profile.approved_at && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {profile.account_status === "active" ? "Approved" : "Processed"}
                  </p>
                  <p className="text-sm">
                    {format(new Date(profile.approved_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Audit Log - Super Admin only */}
          {isSuperAdmin && auditLog.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-border/50">
              <h2 className="text-sm font-medium text-muted-foreground">Activity</h2>
              <AuditLogHeader />
              
              <div className="space-y-3">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="text-sm">
                    <p>
                      {ACTION_LABELS[entry.action] || entry.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
