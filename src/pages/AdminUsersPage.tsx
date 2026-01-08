import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout } from "@/components/PortalLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

interface UserWithRoles {
  id: string;
  email: string;
  display_name: string | null;
  roles: AppRole[];
}

export default function AdminUsersPage() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<AppRole>("user");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  async function fetchUsers() {
    setLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, display_name");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }

    const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => ({
      id: profile.id,
      email: profile.email || "No email",
      display_name: profile.display_name,
      roles: (roles || [])
        .filter((r) => r.user_id === profile.id)
        .map((r) => r.role as AppRole),
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  }

  async function addRole(userId: string, role: AppRole) {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (error) {
      toast({
        title: "Error adding role",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Role added" });
      fetchUsers();
    }
    setSelectedUserId(null);
  }

  async function removeRole(userId: string, role: AppRole) {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) {
      toast({
        title: "Error removing role",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Role removed" });
      fetchUsers();
    }
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <PortalLayout title="User Management">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">User Management</h2>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>

        {loading ? (
          <div className="animate-pulse text-muted-foreground">Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.display_name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.length === 0 ? (
                        <span className="text-muted-foreground text-sm">No roles</span>
                      ) : (
                        user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={role === "admin" ? "destructive" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => removeRole(user.id, role)}
                            title="Click to remove"
                          >
                            {role} ×
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {selectedUserId === user.id ? (
                      <div className="flex gap-2 items-center">
                        <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="moderator">moderator</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={() => addRole(user.id, selectedRole)}>
                          Add
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedUserId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setSelectedUserId(user.id)}>
                        Add Role
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </PortalLayout>
  );
}
