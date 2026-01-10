import { useState, useEffect } from "react";
import { useAuth, UserRole, UserStatus } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { writeAuditLog, AuditActions, ResourceTypes } from "@/lib/audit";
import type { Database } from "@/integrations/supabase/types";

type PortalRole = Database["public"]["Enums"]["portal_role"];
type MembershipStatus = Database["public"]["Enums"]["membership_status"];

interface TenantMembership {
  id: string;
  tenant_id: string;
  tenant_name: string;
  status: MembershipStatus;
  roles: PortalRole[];
  created_at: string;
}

interface UserWithRole {
  id: string;
  email: string;
  status: UserStatus;
  created_at: string;
  last_login_at: string | null;
  role: UserRole;
  memberships: TenantMembership[];
}

export default function UserDirectoryPage() {
  const { profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles (excluding soft-deleted)
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, email, status, created_at, last_login_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch roles
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
      toast({
        title: "Error",
        description: "Failed to load user roles",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch all memberships with tenant info and roles
    const { data: memberships, error: membershipsError } = await supabase
      .from("tenant_memberships")
      .select(`
        id,
        user_id,
        tenant_id,
        status,
        created_at,
        tenants(legal_name),
        membership_roles(role)
      `)
      .is("deleted_at", null);

    if (membershipsError) {
      console.error("Error fetching memberships:", membershipsError);
    }

    // Create maps
    const roleMap = new Map(roles?.map(r => [r.user_id, r.role as UserRole]) || []);
    
    const membershipsByUser = new Map<string, TenantMembership[]>();
    memberships?.forEach((m: any) => {
      const existing = membershipsByUser.get(m.user_id) || [];
      existing.push({
        id: m.id,
        tenant_id: m.tenant_id,
        tenant_name: m.tenants?.legal_name || "Unknown",
        status: m.status,
        roles: m.membership_roles?.map((mr: any) => mr.role) || [],
        created_at: m.created_at,
      });
      membershipsByUser.set(m.user_id, existing);
    });

    // Combine profiles with roles and memberships
    const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
      ...profile,
      role: roleMap.get(profile.id) || "client" as UserRole,
      memberships: membershipsByUser.get(profile.id) || [],
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (userId === currentProfile?.id) {
      toast({
        title: "Error",
        description: "You cannot change your own role",
        variant: "destructive",
      });
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    const oldRole = targetUser?.role;

    setUpdating(userId);
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    } else {
      await writeAuditLog({
        userId: currentProfile?.id,
        action: AuditActions.USER_ROLE_CHANGED,
        resourceType: ResourceTypes.USER_ROLE,
        resourceId: userId,
        details: {
          target_user_email: targetUser?.email,
          old_role: oldRole,
          new_role: newRole,
        },
      });

      toast({
        title: "Success",
        description: "User role updated",
      });
      fetchUsers();
    }
    setUpdating(null);
  };

  const updateUserStatus = async (userId: string, newStatus: UserStatus) => {
    if (userId === currentProfile?.id) {
      toast({
        title: "Error",
        description: "You cannot change your own status",
        variant: "destructive",
      });
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    const oldStatus = targetUser?.status;

    setUpdating(userId);
    const { error } = await supabase
      .from("user_profiles")
      .update({ status: newStatus })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      await writeAuditLog({
        userId: currentProfile?.id,
        action: AuditActions.USER_STATUS_CHANGED,
        resourceType: ResourceTypes.USER,
        resourceId: userId,
        details: {
          target_user_email: targetUser?.email,
          old_status: oldStatus,
          new_status: newStatus,
        },
      });

      toast({
        title: "Success",
        description: "User status updated",
      });
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
        title: "Error",
        description: "Failed to update membership",
        variant: "destructive",
      });
    } else {
      await writeAuditLog({
        userId: currentProfile?.id,
        action: AuditActions.TENANT_MEMBERSHIP_UPDATED,
        resourceType: ResourceTypes.TENANT_MEMBERSHIP,
        resourceId: membershipId,
        details: { new_status: newStatus },
      });

      toast({
        title: "Success",
        description: "Membership updated",
      });
      fetchUsers();
    }
    setUpdating(null);
  };

  const getMembershipBadgeVariant = (status: MembershipStatus) => {
    switch (status) {
      case "active": return "default";
      case "invited": return "secondary";
      case "suspended": return "destructive";
      default: return "outline";
    }
  };

  const formatRoles = (roles: PortalRole[]): string => {
    return roles.map(r => {
      switch (r) {
        case "tenant_owner": return "Owner";
        case "publishing_admin": return "Pub Admin";
        case "licensing_user": return "Licensing";
        case "read_only": return "Read Only";
        case "internal_admin": return "Internal";
        default: return r;
      }
    }).join(", ") || "No roles";
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold">User Directory</h1>
          </div>
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage user roles, status, and tenant memberships. {users.length} user(s) total.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
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
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <>
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.memberships.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                            >
                              {expandedUser === user.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.email}
                          {user.id === currentProfile?.id && (
                            <Badge variant="outline" className="ml-2">You</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user.id, value as UserRole)}
                            disabled={updating === user.id || user.id === currentProfile?.id}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="licensing">Licensing</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.status}
                            onValueChange={(value) => updateUserStatus(user.id, value as UserStatus)}
                            disabled={updating === user.id || user.id === currentProfile?.id}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.memberships.length === 0 ? (
                            <span className="text-muted-foreground text-sm">None</span>
                          ) : (
                            <span className="text-sm">
                              {user.memberships.filter(m => m.status === "active").length} active
                              {user.memberships.some(m => m.status === "invited") && (
                                <span className="text-muted-foreground ml-1">
                                  ({user.memberships.filter(m => m.status === "invited").length} pending)
                                </span>
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.last_login_at
                            ? new Date(user.last_login_at).toLocaleString()
                            : "Never"}
                        </TableCell>
                      </TableRow>
                      {expandedUser === user.id && user.memberships.length > 0 && (
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={7} className="py-4">
                            <div className="pl-8 space-y-3">
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                Tenant Memberships
                              </p>
                              <div className="space-y-2">
                                {user.memberships.map((membership) => (
                                  <div
                                    key={membership.id}
                                    className="flex items-center justify-between bg-background rounded-md p-3 border"
                                  >
                                    <div className="flex items-center gap-4">
                                      <span className="font-medium">{membership.tenant_name}</span>
                                      <Badge variant={getMembershipBadgeVariant(membership.status)}>
                                        {membership.status}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {formatRoles(membership.roles)}
                                      </span>
                                    </div>
                                    <Select
                                      value={membership.status}
                                      onValueChange={(value) =>
                                        updateMembershipStatus(membership.id, value as MembershipStatus)
                                      }
                                      disabled={updating === membership.id}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="invited">Invited</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
