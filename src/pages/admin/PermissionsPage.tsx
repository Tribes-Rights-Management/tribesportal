import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { PermissionConfirmDialog } from "@/components/admin/PermissionConfirmDialog";
import { CapabilitiesMatrix } from "@/components/admin/CapabilitiesMatrix";
import { ScopeAssignments } from "@/components/admin/ScopeAssignments";
import { AuditMetadata } from "@/components/admin/AuditMetadata";

type PlatformRole = Database["public"]["Enums"]["platform_role"];
type PortalRole = Database["public"]["Enums"]["portal_role"];
type MembershipStatus = Database["public"]["Enums"]["membership_status"];
type PortalContext = Database["public"]["Enums"]["portal_context"];

interface TenantMembership {
  id: string;
  tenant_id: string;
  tenant_name: string;
  status: MembershipStatus;
  role: PortalRole;
  allowed_contexts: PortalContext[];
  created_at: string;
  updated_at: string;
}

interface UserPermissions {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  platform_role: PlatformRole;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
  memberships: TenantMembership[];
}

interface PendingChange {
  type: "role" | "status" | "membership_role" | "membership_status" | "contexts";
  label: string;
  impact: string;
  currentValue: string;
  newValue: string;
  targetId: string;
  membershipId?: string;
}

/**
 * PERMISSIONS PAGE — INSTITUTIONAL GOVERNANCE SURFACE
 * 
 * Design Rules:
 * - Dedicated governance page, not buried in settings
 * - Three-layer model: Role → Scope → Capabilities
 * - Explicit confirmation for all changes
 * - Audit metadata always visible
 * - No casual toggles or autosave
 */
export default function PermissionsPage() {
  const { userId } = useParams<{ userId: string }>();
  const { profile: currentProfile } = useAuth();
  const [user, setUser] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchUser = async () => {
    if (!userId) return;
    setLoading(true);

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      toast({
        title: "Operation failed",
        description: "Unable to retrieve user record",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: memberships, error: membershipsError } = await supabase
      .from("tenant_memberships")
      .select(`
        id,
        tenant_id,
        status,
        role,
        allowed_contexts,
        created_at,
        updated_at,
        tenants(name)
      `)
      .eq("user_id", userId);

    if (membershipsError) {
      console.error("Error fetching memberships:", membershipsError);
    }

    const processedMemberships: TenantMembership[] = (memberships || []).map((m: any) => ({
      id: m.id,
      tenant_id: m.tenant_id,
      tenant_name: m.tenants?.name || "Unknown",
      status: m.status,
      role: m.role,
      allowed_contexts: m.allowed_contexts || [],
      created_at: m.created_at,
      updated_at: m.updated_at,
    }));

    setUser({
      id: profile.id,
      user_id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      platform_role: profile.platform_role,
      status: profile.status,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      memberships: processedMemberships,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const formatRole = (role: PlatformRole | PortalRole): string => {
    switch (role) {
      case "platform_admin": return "Platform Administrator";
      case "platform_user": return "Platform User";
      case "tenant_admin": return "Organization Administrator";
      case "tenant_user": return "Organization User";
      case "viewer": return "Viewer";
      default: return role;
    }
  };

  const formatStatus = (status: MembershipStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getRoleDescription = (role: PlatformRole): string => {
    switch (role) {
      case "platform_admin":
        return "Full administrative authority. Can manage all users, organizations, and system configuration. Access to security and governance surfaces.";
      case "platform_user":
        return "Standard platform access. Authority limited to assigned organizations and contexts. No administrative capabilities.";
      default:
        return "";
    }
  };

  const getTenantRoleDescription = (role: PortalRole): string => {
    switch (role) {
      case "tenant_admin":
        return "Full authority within assigned organization. Can manage organization members and configurations.";
      case "tenant_user":
        return "Standard organization access. Can view, submit, and manage records within permitted contexts.";
      case "viewer":
        return "Read-only access. Can view records within permitted contexts. Cannot modify or submit records.";
      default:
        return "";
    }
  };

  // Prepare change for confirmation
  const prepareRoleChange = (newRole: PlatformRole) => {
    if (!user) return;
    setPendingChange({
      type: "role",
      label: "Platform Role",
      impact: newRole === "platform_admin"
        ? "You are granting full administrative authority. This user will have access to all platform governance surfaces and can manage all users and organizations."
        : "You are restricting this user to standard platform access. Administrative capabilities will be revoked.",
      currentValue: formatRole(user.platform_role),
      newValue: formatRole(newRole),
      targetId: newRole,
    });
  };

  const prepareStatusChange = (newStatus: MembershipStatus) => {
    if (!user) return;
    setPendingChange({
      type: "status",
      label: "Account Status",
      impact: newStatus === "suspended"
        ? "You are suspending this account. The user will lose access to all platform features until status is restored."
        : newStatus === "revoked"
        ? "You are revoking this account. This is a permanent action that cannot be easily reversed."
        : newStatus === "active"
        ? "You are activating this account. The user will regain access according to their assigned role and scopes."
        : "You are changing the account status. Access may be affected.",
      currentValue: formatStatus(user.status),
      newValue: formatStatus(newStatus),
      targetId: newStatus,
    });
  };

  const prepareMembershipRoleChange = (membership: TenantMembership, newRole: PortalRole) => {
    setPendingChange({
      type: "membership_role",
      label: `Organization Role (${membership.tenant_name})`,
      impact: newRole === "tenant_admin"
        ? `You are granting administrative authority within ${membership.tenant_name}. This user will be able to manage organization members and configurations.`
        : newRole === "viewer"
        ? `You are restricting this user to read-only access within ${membership.tenant_name}.`
        : `You are assigning standard user access within ${membership.tenant_name}.`,
      currentValue: formatRole(membership.role),
      newValue: formatRole(newRole),
      targetId: newRole,
      membershipId: membership.id,
    });
  };

  const prepareMembershipStatusChange = (membership: TenantMembership, newStatus: MembershipStatus) => {
    setPendingChange({
      type: "membership_status",
      label: `Organization Access (${membership.tenant_name})`,
      impact: newStatus === "revoked"
        ? `You are revoking access to ${membership.tenant_name}. The user will no longer be able to access any records within this organization.`
        : newStatus === "suspended"
        ? `You are suspending access to ${membership.tenant_name}. Access will be temporarily restricted.`
        : `You are restoring access to ${membership.tenant_name}.`,
      currentValue: formatStatus(membership.status),
      newValue: formatStatus(newStatus),
      targetId: newStatus,
      membershipId: membership.id,
    });
  };

  const prepareContextChange = (membership: TenantMembership, newContexts: PortalContext[]) => {
    const contextLabels = (contexts: PortalContext[]) => 
      contexts.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") || "None";
    
    setPendingChange({
      type: "contexts",
      label: `Context Access (${membership.tenant_name})`,
      impact: `You are modifying context access within ${membership.tenant_name}. This determines which portal sections the user can access.`,
      currentValue: contextLabels(membership.allowed_contexts),
      newValue: contextLabels(newContexts),
      targetId: JSON.stringify(newContexts),
      membershipId: membership.id,
    });
  };

  // Execute confirmed changes
  const executeChange = async () => {
    if (!pendingChange || !user) return;
    setProcessing(true);

    try {
      switch (pendingChange.type) {
        case "role":
          await supabase
            .from("user_profiles")
            .update({ platform_role: pendingChange.targetId as PlatformRole })
            .eq("id", user.id);
          break;

        case "status":
          await supabase
            .from("user_profiles")
            .update({ status: pendingChange.targetId as MembershipStatus })
            .eq("id", user.id);
          break;

        case "membership_role":
          await supabase
            .from("tenant_memberships")
            .update({ 
              role: pendingChange.targetId as PortalRole,
              updated_at: new Date().toISOString(),
            })
            .eq("id", pendingChange.membershipId);
          break;

        case "membership_status":
          await supabase
            .from("tenant_memberships")
            .update({ 
              status: pendingChange.targetId as MembershipStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", pendingChange.membershipId);
          break;

        case "contexts":
          await supabase
            .from("tenant_memberships")
            .update({ 
              allowed_contexts: JSON.parse(pendingChange.targetId),
              updated_at: new Date().toISOString(),
            })
            .eq("id", pendingChange.membershipId);
          break;
      }

      toast({ title: "Authority updated" });
      fetchUser();
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Operation failed",
        description: "Unable to update authority",
        variant: "destructive",
      });
    }

    setPendingChange(null);
    setProcessing(false);
  };

  const isSelf = user?.user_id === currentProfile?.user_id;

  if (loading) {
    return (
      <div 
        className="min-h-full py-10 px-6"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <div className="max-w-[800px] mx-auto">
          <div 
            className="py-16 text-center text-[14px]"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            Retrieving authority record
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="min-h-full py-10 px-6"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <div className="max-w-[800px] mx-auto">
          <div 
            className="py-16 text-center text-[14px]"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            User record not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-full py-10 px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Link 
              to="/admin/users" 
              className="h-8 w-8 rounded flex items-center justify-center transition-colors"
              style={{ color: 'var(--platform-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--muted) / 0.5)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="page-title">Authority Record</h1>
              <p 
                className="text-[15px] mt-0.5"
                style={{ color: 'var(--platform-text-secondary)' }}
              >
                Role assignment, scope delegation, capability matrix
              </p>
            </div>
          </div>
          
          {/* Edit Mode Toggle */}
          {!isSelf && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 text-[13px] font-medium rounded transition-colors"
              style={{ 
                backgroundColor: editMode ? 'hsl(var(--muted))' : 'transparent',
                color: 'var(--platform-text-secondary)',
                border: '1px solid var(--platform-border)'
              }}
              onMouseEnter={(e) => {
                if (!editMode) e.currentTarget.style.backgroundColor = 'hsl(var(--muted) / 0.5)';
              }}
              onMouseLeave={(e) => {
                if (!editMode) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
            </button>
          )}
        </div>

        {/* Section 1: User Identity */}
        <section className="mb-8">
          <h2 
            className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            User Identity
          </h2>
          <div 
            className="rounded p-4 sm:p-6"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)'
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p 
                  className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Full Name
                </p>
                <p 
                  className="text-[15px]"
                  style={{ color: 'var(--platform-text)' }}
                >
                  {user.full_name || "Not provided"}
                </p>
              </div>
              <div>
                <p 
                  className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Email
                </p>
                <p 
                  className="text-[15px] font-mono"
                  style={{ color: 'var(--platform-text)' }}
                >
                  {user.email}
                </p>
              </div>
              <div>
                <p 
                  className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Current Role
                </p>
                <p 
                  className="text-[15px] font-medium"
                  style={{ color: 'var(--platform-text)' }}
                >
                  {formatRole(user.platform_role)}
                </p>
              </div>
              <div>
                <p 
                  className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Account Status
                </p>
                <p 
                  className="text-[15px]"
                  style={{ color: 'var(--platform-text)' }}
                >
                  {formatStatus(user.status)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Assigned Role */}
        <section className="mb-8">
          <h2 
            className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Assigned Role
          </h2>
          <div 
            className="rounded p-6"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)'
            }}
          >
            <div className="space-y-4">
              {/* Platform Role Selection */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p 
                    className="text-[15px] font-medium mb-1"
                    style={{ color: 'var(--platform-text)' }}
                  >
                    {formatRole(user.platform_role)}
                  </p>
                  <p 
                    className="text-[13px]"
                    style={{ color: 'var(--platform-text-secondary)' }}
                  >
                    {getRoleDescription(user.platform_role)}
                  </p>
                </div>
                {editMode && !isSelf && (
                  <div className="flex gap-2">
                    {user.platform_role !== "platform_admin" && (
                      <button
                        onClick={() => prepareRoleChange("platform_admin")}
                        className="px-3 py-1.5 text-[12px] rounded transition-colors"
                        style={{ 
                          color: 'var(--platform-text-secondary)',
                          border: '1px solid var(--platform-border)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--muted) / 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Grant Admin
                      </button>
                    )}
                    {user.platform_role !== "platform_user" && (
                      <button
                        onClick={() => prepareRoleChange("platform_user")}
                        className="px-3 py-1.5 text-[12px] rounded transition-colors"
                        style={{ 
                          color: 'var(--platform-text-secondary)',
                          border: '1px solid var(--platform-border)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--muted) / 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Restrict to User
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Account Status */}
              {editMode && !isSelf && (
                <div 
                  className="pt-4 mt-4"
                  style={{ borderTop: '1px solid var(--platform-border)' }}
                >
                  <p 
                    className="text-[11px] font-medium uppercase tracking-[0.04em] mb-3"
                    style={{ color: 'var(--platform-text-muted)' }}
                  >
                    Account Status Actions
                  </p>
                  <div className="flex gap-2">
                    {user.status !== "active" && (
                      <button
                        onClick={() => prepareStatusChange("active")}
                        className="px-3 py-1.5 text-[12px] rounded transition-colors"
                        style={{ 
                          color: 'var(--platform-text-secondary)',
                          border: '1px solid var(--platform-border)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--muted) / 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Activate
                      </button>
                    )}
                    {user.status !== "suspended" && (
                      <button
                        onClick={() => prepareStatusChange("suspended")}
                        className="px-3 py-1.5 text-[12px] rounded transition-colors"
                        style={{ 
                          color: 'var(--platform-text-secondary)',
                          border: '1px solid var(--platform-border)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--muted) / 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Suspend
                      </button>
                    )}
                    {user.status !== "revoked" && (
                      <button
                        onClick={() => prepareStatusChange("revoked")}
                        className="px-3 py-1.5 text-[12px] rounded transition-colors"
                        style={{ 
                          color: 'hsl(var(--destructive))',
                          border: '1px solid #4A2525'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(181,69,69,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Scope Assignments */}
        <ScopeAssignments
          memberships={user.memberships}
          editMode={editMode && !isSelf}
          formatRole={formatRole}
          formatStatus={formatStatus}
          getTenantRoleDescription={getTenantRoleDescription}
          onRoleChange={prepareMembershipRoleChange}
          onStatusChange={prepareMembershipStatusChange}
          onContextChange={prepareContextChange}
        />

        {/* Section 4: Capabilities Matrix */}
        <CapabilitiesMatrix
          platformRole={user.platform_role}
          memberships={user.memberships}
        />

        {/* Section 5: Audit Metadata */}
        <AuditMetadata
          createdAt={user.created_at}
          updatedAt={user.updated_at}
        />

        {/* Self-edit warning */}
        {isSelf && (
          <div 
            className="mt-8 p-4 rounded text-[13px]"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-muted)'
            }}
          >
            Authority records cannot be self-modified. Contact another administrator to adjust your permissions.
          </div>
        )}

        {/* Confirmation Dialog */}
        <PermissionConfirmDialog
          open={!!pendingChange}
          onClose={() => setPendingChange(null)}
          onConfirm={executeChange}
          change={pendingChange}
          processing={processing}
        />
      </div>
    </div>
  );
}
