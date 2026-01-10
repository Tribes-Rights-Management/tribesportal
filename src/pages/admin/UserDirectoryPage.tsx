import { useState, useEffect } from "react";
import { useAuth, UserProfile, UserRole, UserStatus } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function UserDirectoryPage() {
  const { profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } else {
      setUsers(data as UserProfile[]);
    }
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

    setUpdating(userId);
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", userId);

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

  const updateUserStatus = async (userId: string, newStatus: UserStatus) => {
    if (userId === currentProfile?.id) {
      toast({
        title: "Error",
        description: "You cannot change your own status",
        variant: "destructive",
      });
      return;
    }

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
      toast({
        title: "Success",
        description: "User status updated",
      });
      fetchUsers();
    }
    setUpdating(null);
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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
              Manage user roles and account status. {users.length} user(s) total.
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
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
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
                          <SelectTrigger className="w-32">
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
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
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
