import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
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
 * USER DIRECTORY PAGE — ACCESS MANAGEMENT (CANONICAL)
 * 
 * Design Rules:
 * - Flat table layout, no card wrappers
 * - Dense, institutional spacing
 * - Explicit actions, no hover-only affordances
 */
export default function UserDirectoryPage() {
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
      case "tenant_user": return "User";
      case "viewer": return "Viewer";
      default: return role;
    }
  };

  const formatContexts = (contexts: string[]): string => {
    return contexts.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") || "None";
  };

  const getStatusStyle = (status: MembershipStatus): string => {
    switch (status) {
      case "active": return "text-[#111]";
      case "pending": return "text-[#8A8A8A]";
      case "denied": 
      case "suspended": 
      case "revoked": return "text-[#DC2626]";
      default: return "text-[#6B6B6B]";
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link 
          to="/admin" 
          className="h-8 w-8 rounded flex items-center justify-center hover:bg-black/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#6B6B6B]" />
        </Link>
        <div>
          <h1 className="text-[20px] font-medium tracking-[-0.01em] text-[#111]">
            User Directory
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">
            {users.length} user(s)
          </p>
        </div>
      </div>

      {/* Table - flat, no card wrapper */}
      <div className="border border-[#E5E5E5] rounded-md bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[14px] text-[#6B6B6B]">
            Retrieving records
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-[#6B6B6B]">
            No users.
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <>
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.memberships.length > 0 && (
                        <button
                          className="h-6 w-6 rounded flex items-center justify-center hover:bg-black/5"
                          onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                        >
                          {expandedUser === user.id ? (
                            <ChevronUp className="h-3.5 w-3.5 text-[#6B6B6B]" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-[#6B6B6B]" />
                          )}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.email}
                      {user.user_id === currentProfile?.user_id && (
                        <span className="ml-2 text-[11px] text-[#8A8A8A] uppercase tracking-wide">(you)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.platform_role}
                        onValueChange={(value) => updatePlatformRole(user.user_id, user.id, value as PlatformRole)}
                        disabled={updating === user.id || user.user_id === currentProfile?.user_id}
                      >
                        <SelectTrigger className="w-32 h-8 text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="platform_admin">Admin</SelectItem>
                          <SelectItem value="platform_user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.status}
                        onValueChange={(value) => updateUserStatus(user.user_id, user.id, value as MembershipStatus)}
                        disabled={updating === user.id || user.user_id === currentProfile?.user_id}
                      >
                        <SelectTrigger className="w-28 h-8 text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="revoked">Revoked</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {user.memberships.length === 0 ? (
                        <span className="text-[#8A8A8A]">None</span>
                      ) : (
                        <span>
                          {user.memberships.filter(m => m.status === "active").length} active
                          {user.memberships.some(m => m.status === "pending") && (
                            <span className="text-[#8A8A8A] ml-1">
                              ({user.memberships.filter(m => m.status === "pending").length} pending)
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-[#6B6B6B]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  {expandedUser === user.id && user.memberships.length > 0 && (
                    <TableRow className="bg-[#FAFAFA]">
                      <TableCell colSpan={6} className="py-3">
                        <div className="pl-8 space-y-2">
                          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#8A8A8A] mb-2">
                            Tenant Memberships
                          </p>
                          {user.memberships.map((membership) => (
                            <div
                              key={membership.id}
                              className="flex items-center justify-between bg-white rounded border border-[#E8E8E8] px-3 py-2"
                            >
                              <div className="flex items-center gap-4 text-[13px]">
                                <span className="font-medium">{membership.tenant_name}</span>
                                <span className={getStatusStyle(membership.status)}>
                                  {membership.status}
                                </span>
                                <span className="text-[#8A8A8A]">
                                  {formatRole(membership.role)}
                                </span>
                                <span className="text-[#8A8A8A]">
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
                                <SelectTrigger className="w-28 h-7 text-[12px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="suspended">Suspended</SelectItem>
                                  <SelectItem value="revoked">Revoked</SelectItem>
                                  <SelectItem value="denied">Denied</SelectItem>
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
  );
}
