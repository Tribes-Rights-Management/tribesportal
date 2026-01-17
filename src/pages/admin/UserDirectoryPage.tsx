import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MemberDetailsSheet } from "@/components/admin/MemberDetailsSheet";
import type { Database } from "@/integrations/supabase/types";

type PlatformRole = Database["public"]["Enums"]["platform_role"];
type PortalRole = Database["public"]["Enums"]["portal_role"];
type MembershipStatus = Database["public"]["Enums"]["membership_status"];

interface TenantMembership {
  id: string;
  tenant_id: string;
  tenant_name: string;
  status: MembershipStatus;
  role: PortalRole;
  allowed_contexts: string[];
  created_at: string;
}

interface UserWithProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  platform_role: PlatformRole;
  status: MembershipStatus;
  created_at: string;
  memberships: TenantMembership[];
}

/**
 * MEMBER DIRECTORY PAGE — ACCESS MANAGEMENT (AUTHORITY UX CANON)
 * 
 * Purpose: Directory listing for user discovery
 * 
 * Compliance:
 * - No disabled inputs for display data
 * - Status shown as pills, not form controls
 * - Mobile: Vertical card list, no horizontal scrolling
 * - Desktop: Table with read-only display, "Authority" action for editing
 * - Row click opens Member Details sheet
 */
export default function UserDirectoryPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, user_id, email, full_name, platform_role, status, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      toast({
        title: "Operation failed",
        description: "Unable to retrieve users",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: memberships, error: membershipsError } = await supabase
      .from("tenant_memberships")
      .select(`
        id,
        user_id,
        tenant_id,
        status,
        role,
        allowed_contexts,
        created_at,
        tenants(name)
      `);

    if (membershipsError) {
      console.error("Error fetching memberships:", membershipsError);
    }

    const membershipsByUser = new Map<string, TenantMembership[]>();
    memberships?.forEach((m: any) => {
      const existing = membershipsByUser.get(m.user_id) || [];
      existing.push({
        id: m.id,
        tenant_id: m.tenant_id,
        tenant_name: m.tenants?.name || "Unknown",
        status: m.status,
        role: m.role,
        allowed_contexts: m.allowed_contexts || [],
        created_at: m.created_at,
      });
      membershipsByUser.set(m.user_id, existing);
    });

    const usersWithMemberships: UserWithProfile[] = (profiles || []).map(profile => ({
      ...profile,
      memberships: membershipsByUser.get(profile.user_id) || [],
    }));

    setUsers(usersWithMemberships);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // These update functions are passed to MemberDetailsSheet for when edit mode is available
  const updatePlatformRole = async (userId: string, userProfileId: string, newRole: PlatformRole) => {
    if (userId === currentProfile?.user_id) {
      toast({
        title: "Operation denied",
        description: "Cannot modify own role",
        variant: "destructive",
      });
      return;
    }

    setUpdating(userProfileId);
    const { error } = await supabase
      .from("user_profiles")
      .update({ platform_role: newRole })
      .eq("id", userProfileId);

    if (error) {
      toast({
        title: "Operation failed",
        description: "Unable to update role",
        variant: "destructive",
      });
    } else {
      toast({ title: "Role updated" });
      fetchUsers();
    }
    setUpdating(null);
  };

  const updateUserStatus = async (userId: string, userProfileId: string, newStatus: MembershipStatus) => {
    if (userId === currentProfile?.user_id) {
      toast({
        title: "Operation denied",
        description: "Cannot modify own status",
        variant: "destructive",
      });
      return;
    }

    setUpdating(userProfileId);
    const { error } = await supabase
      .from("user_profiles")
      .update({ status: newStatus })
      .eq("id", userProfileId);

    if (error) {
      toast({
        title: "Operation failed",
        description: "Unable to update status",
        variant: "destructive",
      });
    } else {
      toast({ title: "Status updated" });
      fetchUsers();
    }
    setUpdating(null);
  };

  const updateMembershipStatus = async (membershipId: string, newStatus: MembershipStatus) => {
    setUpdating(membershipId);
    const { error } = await supabase
      .from("tenant_memberships")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", membershipId);

    if (error) {
      toast({
        title: "Operation failed",
        description: "Unable to update membership",
        variant: "destructive",
      });
    } else {
      toast({ title: "Membership updated" });
      fetchUsers();
    }
    setUpdating(null);
  };

  const formatRole = (role: PortalRole): string => {
    switch (role) {
      case "tenant_admin": return "Admin";
      case "tenant_user": return "Member";
      case "viewer": return "Viewer";
      default: return role;
    }
  };

  const formatPlatformRole = (role: PlatformRole): string => {
    switch (role) {
      case "platform_admin": return "Admin";
      case "platform_user": return "User";
      case "external_auditor": return "Auditor";
      default: return role;
    }
  };

  const formatContexts = (contexts: string[]): string => {
    return contexts.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") || "None";
  };

  const formatStatus = (status: MembershipStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: MembershipStatus) => {
    switch (status) {
      case "active":
        return { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80" };
      case "pending":
        return { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15" };
      case "suspended":
        return { bg: "rgba(249, 115, 22, 0.15)", text: "#fb923c" };
      case "revoked":
      case "denied":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" };
      default:
        return { bg: "rgba(255,255,255,0.06)", text: "var(--platform-text)" };
    }
  };

  const handleRowClick = (user: UserWithProfile) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  return (
    <div 
      className="min-h-full py-6 sm:py-10 px-4 sm:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link 
            to="/admin" 
            className="h-11 w-11 sm:h-8 sm:w-8 rounded flex items-center justify-center transition-colors shrink-0"
            style={{ color: 'var(--platform-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" />
          </Link>
          <div className="min-w-0">
            <h1 
              className="text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em]"
              style={{ color: 'var(--platform-text)' }}
            >
              Member Directory
            </h1>
            <p 
              className="text-[14px] sm:text-[15px] mt-0.5"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {users.length} account(s)
            </p>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div 
            className="py-16 text-center text-[14px] rounded-lg"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-secondary)' 
            }}
          >
            Retrieving records
          </div>
        ) : users.length === 0 ? (
          <div 
            className="py-16 text-center rounded-lg"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-secondary)' 
            }}
          >
            <p className="text-[14px]">No users.</p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--platform-text-muted)' }}>
              Records will appear when users are provisioned.
            </p>
          </div>
        ) : isMobile ? (
          /* Mobile: Vertical Card List */
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleRowClick(user)}
                className="w-full text-left rounded-lg p-4 transition-colors"
                style={{ 
                  backgroundColor: 'var(--platform-surface)',
                  border: '1px solid var(--platform-border)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--platform-surface)'}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Primary: Email */}
                    <div 
                      className="text-[15px] font-medium break-words"
                      style={{ color: 'var(--platform-text)' }}
                    >
                      {user.email}
                      {user.user_id === currentProfile?.user_id && (
                        <span 
                          className="ml-2 text-[10px] uppercase tracking-wide"
                          style={{ color: 'var(--platform-text-muted)' }}
                        >
                          (you)
                        </span>
                      )}
                    </div>
                    
                    {/* Secondary: Role + Status as pills */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: 'var(--platform-text-secondary)',
                        }}
                      >
                        {formatPlatformRole(user.platform_role)}
                      </span>
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ 
                          backgroundColor: getStatusColor(user.status).bg,
                          color: getStatusColor(user.status).text,
                        }}
                      >
                        {formatStatus(user.status)}
                      </span>
                      {user.memberships.filter(m => m.status === "active").length > 0 && (
                        <span 
                          className="text-[11px]"
                          style={{ color: 'var(--platform-text-muted)' }}
                        >
                          {user.memberships.filter(m => m.status === "active").length} org(s)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Chevron */}
                  <ChevronRight 
                    className="h-5 w-5 shrink-0 mt-0.5" 
                    style={{ color: 'var(--platform-text-muted)' }} 
                  />
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Desktop: Table Layout with Read-Only Display */
          <div 
            className="rounded overflow-hidden"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)'
            }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Platform Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Memberships</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <>
                    <TableRow 
                      key={user.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(user)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {user.memberships.length > 0 && (
                          <button
                            className="h-6 w-6 rounded flex items-center justify-center transition-colors"
                            style={{ color: 'var(--platform-text-secondary)' }}
                            onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {expandedUser === user.id ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.email}
                        {user.user_id === currentProfile?.user_id && (
                          <span 
                            className="ml-2 text-[10px] uppercase tracking-wide"
                            style={{ color: 'var(--platform-text-muted)' }}
                          >
                            (you)
                          </span>
                        )}
                      </TableCell>
                      {/* Platform Role - READ-ONLY PILL (no Select control) */}
                      <TableCell>
                        <span 
                          className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium"
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            color: 'var(--platform-text)',
                          }}
                        >
                          {formatPlatformRole(user.platform_role)}
                        </span>
                      </TableCell>
                      {/* Status - READ-ONLY PILL (no Select control) */}
                      <TableCell>
                        <span 
                          className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium"
                          style={{ 
                            backgroundColor: getStatusColor(user.status).bg,
                            color: getStatusColor(user.status).text,
                          }}
                        >
                          {formatStatus(user.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px]">
                        {user.memberships.length === 0 ? (
                          <span style={{ color: 'var(--platform-text-muted)' }}>None</span>
                        ) : (
                          <span>
                            {user.memberships.filter(m => m.status === "active").length} active
                            {user.memberships.some(m => m.status === "pending") && (
                              <span className="ml-1" style={{ color: 'var(--platform-text-muted)' }}>
                                ({user.memberships.filter(m => m.status === "pending").length} pending)
                              </span>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ color: 'var(--platform-text-secondary)' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/admin/users/${user.user_id}/permissions`)}
                          className="flex items-center gap-1 px-2 py-1 text-[12px] rounded transition-colors"
                          style={{ color: 'var(--platform-text-secondary)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          Authority
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </TableCell>
                    </TableRow>
                    {expandedUser === user.id && user.memberships.length > 0 && (
                      <TableRow style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                        <TableCell colSpan={7} className="py-3">
                          <div className="pl-8 space-y-2">
                            <p 
                              className="text-[10px] font-medium uppercase tracking-[0.04em] mb-2"
                              style={{ color: 'var(--platform-text-muted)' }}
                            >
                              Organization Memberships
                            </p>
                            {user.memberships.map((membership) => (
                              <div
                                key={membership.id}
                                className="flex items-center justify-between rounded px-3 py-2"
                                style={{ 
                                  backgroundColor: 'var(--platform-surface)',
                                  border: '1px solid var(--platform-border)'
                                }}
                              >
                                <div className="flex items-center gap-3 text-[13px]">
                                  <span 
                                    className="font-medium"
                                    style={{ color: 'var(--platform-text)' }}
                                  >
                                    {membership.tenant_name}
                                  </span>
                                  {/* Status - READ-ONLY PILL */}
                                  <span 
                                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                                    style={{ 
                                      backgroundColor: getStatusColor(membership.status).bg,
                                      color: getStatusColor(membership.status).text,
                                    }}
                                  >
                                    {formatStatus(membership.status)}
                                  </span>
                                  {/* Role - READ-ONLY PILL */}
                                  <span 
                                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px]"
                                    style={{ 
                                      backgroundColor: 'rgba(255,255,255,0.04)',
                                      color: 'var(--platform-text-secondary)',
                                    }}
                                  >
                                    {formatRole(membership.role)}
                                  </span>
                                  <span 
                                    className="text-[11px]"
                                    style={{ color: 'var(--platform-text-muted)' }}
                                  >
                                    {formatContexts(membership.allowed_contexts)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Member Details Sheet */}
      <MemberDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        user={selectedUser}
        currentUserId={currentProfile?.user_id}
        updating={updating}
        onUpdatePlatformRole={updatePlatformRole}
        onUpdateUserStatus={updateUserStatus}
        onUpdateMembershipStatus={updateMembershipStatus}
      />
    </div>
  );
}