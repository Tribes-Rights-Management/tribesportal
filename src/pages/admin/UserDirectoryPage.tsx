import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
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

export default function UserDirectoryPage() {
  const { profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, user_id, email, full_name, platform_role, status, created_at")
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

    // Fetch all memberships with tenant info
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

    // Create membership map by user_id
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

    // Combine profiles with memberships
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
        title: "Error",
        description: "You cannot change your own role",
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
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "User role updated",
      });
      fetchUsers();
    }
    setUpdating(null);
  };

  const updateUserStatus = async (userId: string, userProfileId: string, newStatus: MembershipStatus) => {
    if (userId === currentProfile?.user_id) {
      toast({
        title: "Error",
        description: "You cannot change your own status",
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
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
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
      case "pending": return "secondary";
      case "denied": return "destructive";
      case "suspended": return "destructive";
      case "revoked": return "destructive";
      default: return "outline";
    }
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
              <div className="text-center py-8 text-[#6B6B6B] text-[14px]">Loading data</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-[#6B6B6B] text-[14px]">No records available.</div>
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
                          {user.user_id === currentProfile?.user_id && (
                            <Badge variant="outline" className="ml-2">You</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.platform_role}
                            onValueChange={(value) => updatePlatformRole(user.user_id, user.id, value as PlatformRole)}
                            disabled={updating === user.id || user.user_id === currentProfile?.user_id}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="platform_admin">Platform Admin</SelectItem>
                              <SelectItem value="platform_user">Platform User</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.status}
                            onValueChange={(value) => updateUserStatus(user.user_id, user.id, value as MembershipStatus)}
                            disabled={updating === user.id || user.user_id === currentProfile?.user_id}
                          >
                            <SelectTrigger className="w-28">
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
                        <TableCell>
                          {user.memberships.length === 0 ? (
                            <span className="text-muted-foreground text-sm">None</span>
                          ) : (
                            <span className="text-sm">
                              {user.memberships.filter(m => m.status === "active").length} active
                              {user.memberships.some(m => m.status === "pending") && (
                                <span className="text-muted-foreground ml-1">
                                  ({user.memberships.filter(m => m.status === "pending").length} pending)
                                </span>
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                      {expandedUser === user.id && user.memberships.length > 0 && (
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={6} className="py-4">
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
                                        {formatRole(membership.role)}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
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
                                      <SelectTrigger className="w-32">
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
