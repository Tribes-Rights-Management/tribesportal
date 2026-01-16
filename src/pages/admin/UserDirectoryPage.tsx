import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
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
 * USER DIRECTORY PAGE — ACCESS MANAGEMENT (INSTITUTIONAL STANDARD)
 * 
 * Design Rules:
 * - Dark canvas, flat panels with hairline borders
 * - Table sits within centered content column
 * - No shadows, no cards, no elevation
 * - Plain text status, no badges or pills
 * - Restrained hover states
 */
export default function UserDirectoryPage() {
  const navigate = useNavigate();
  const { profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

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

  const formatContexts = (contexts: string[]): string => {
    return contexts.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") || "None";
  };

  return (
    <div 
      className="min-h-full py-10 px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link 
            to="/admin" 
            className="h-8 w-8 rounded flex items-center justify-center transition-colors"
            style={{ color: 'var(--platform-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 
              className="text-[28px] font-semibold tracking-[-0.02em]"
              style={{ color: 'var(--platform-text)' }}
            >
              Member Directory
            </h1>
            <p 
              className="text-[15px] mt-0.5"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {users.length} account(s)
            </p>
          </div>
        </div>

        {/* Table Panel */}
        <div 
          className="rounded overflow-hidden"
          style={{ 
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)'
          }}
        >
          {loading ? (
            <div 
              className="py-16 text-center text-[14px]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Retrieving records
            </div>
          ) : users.length === 0 ? (
            <div 
              className="py-16 text-center"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              <p className="text-[14px]">No users.</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--platform-text-muted)' }}>
                Records will appear when users are provisioned.
              </p>
            </div>
          ) : (
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
                    <TableRow key={user.id}>
                      <TableCell>
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
                      <TableCell>
                        <Select
                          value={user.platform_role}
                          onValueChange={(value) => updatePlatformRole(user.user_id, user.id, value as PlatformRole)}
                          disabled={updating === user.id || user.user_id === currentProfile?.user_id}
                        >
                          <SelectTrigger className="w-28 h-8 text-[13px] bg-transparent border-white/10 text-white/90">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1B] border-white/10">
                            <SelectItem value="platform_admin" className="text-white/80 focus:bg-white/10 focus:text-white">Admin</SelectItem>
                            <SelectItem value="platform_user" className="text-white/80 focus:bg-white/10 focus:text-white">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.status}
                          onValueChange={(value) => updateUserStatus(user.user_id, user.id, value as MembershipStatus)}
                          disabled={updating === user.id || user.user_id === currentProfile?.user_id}
                        >
                          <SelectTrigger className="w-28 h-8 text-[13px] bg-transparent border-white/10 text-white/90">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1B] border-white/10">
                            <SelectItem value="active" className="text-white/80 focus:bg-white/10 focus:text-white">Active</SelectItem>
                            <SelectItem value="pending" className="text-white/80 focus:bg-white/10 focus:text-white">Pending</SelectItem>
                            <SelectItem value="suspended" className="text-white/80 focus:bg-white/10 focus:text-white">Suspended</SelectItem>
                            <SelectItem value="revoked" className="text-white/80 focus:bg-white/10 focus:text-white">Revoked</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <TableCell>
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
                      <TableRow style={{ backgroundColor: 'var(--platform-surface-2)' }}>
                        <TableCell colSpan={6} className="py-3">
                          <div className="pl-8 space-y-2">
                            <p 
                              className="text-[10px] font-medium uppercase tracking-[0.04em] mb-2"
                              style={{ color: 'var(--platform-text-muted)' }}
                            >
                              Tenant Memberships
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
                                <div className="flex items-center gap-4 text-[13px]">
                                  <span 
                                    className="font-medium"
                                    style={{ color: 'var(--platform-text)' }}
                                  >
                                    {membership.tenant_name}
                                  </span>
                                  <span style={{ color: 'var(--platform-text-secondary)' }}>
                                    {membership.status}
                                  </span>
                                  <span style={{ color: 'var(--platform-text-muted)' }}>
                                    {formatRole(membership.role)}
                                  </span>
                                  <span style={{ color: 'var(--platform-text-muted)' }}>
                                    ({formatContexts(membership.allowed_contexts)})
                                  </span>
                                </div>
                                <Select
                                  value={membership.status}
                                  onValueChange={(value) =>
                                    updateMembershipStatus(membership.id, value as MembershipStatus)
                                  }
                                  disabled={updating === membership.id}
                                >
                                  <SelectTrigger className="w-28 h-7 text-[12px] bg-transparent border-white/10 text-white/90">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#1A1A1B] border-white/10">
                                    <SelectItem value="active" className="text-white/80 focus:bg-white/10 focus:text-white">Active</SelectItem>
                                    <SelectItem value="pending" className="text-white/80 focus:bg-white/10 focus:text-white">Pending</SelectItem>
                                    <SelectItem value="suspended" className="text-white/80 focus:bg-white/10 focus:text-white">Suspended</SelectItem>
                                    <SelectItem value="revoked" className="text-white/80 focus:bg-white/10 focus:text-white">Revoked</SelectItem>
                                    <SelectItem value="denied" className="text-white/80 focus:bg-white/10 focus:text-white">Denied</SelectItem>
                                  </SelectContent>
                                </Select>
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
          )}
        </div>
      </div>
    </div>
  );
}
