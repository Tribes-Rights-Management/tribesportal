import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Mail, XCircle, Shield, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { InviteUserModal } from "@/components/admin/InviteUserModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppPageHeader } from "@/components/app-ui/AppPageHeader";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppEmptyState } from "@/components/app-ui/AppEmptyState";
import { AppButton } from "@/components/app-ui/AppButton";

interface Member {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  org_role: string;
  status: string;
  joined_at: string;
  has_admin_access: boolean;
  has_licensing_access: boolean;
}

interface Invitation {
  id: string;
  invited_email: string;
  org_role: string;
  grant_admin_module: boolean;
  grant_licensing_module: boolean;
  expires_at: string;
  created_at: string;
  status: string;
}

/**
 * ORG USERS PAGE — ORGANIZATION-SCOPED USER MANAGEMENT
 * 
 * Available at /admin/users for org admins to manage their organization's users.
 * Uses the active tenant context from AuthContext.
 */
export default function OrgUsersPage() {
  const { activeTenant, user, isPlatformAdmin } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("members");

  const organizationId = activeTenant?.tenant_id;
  const organizationName = activeTenant?.tenant_name || "Organization";

  const fetchData = async () => {
    if (!organizationId) return;
    setLoading(true);

    try {
      // Fetch members with their module access
      const { data: membershipsData, error: membershipsError } = await supabase
        .from("tenant_memberships")
        .select(`
          id,
          user_id,
          status,
          org_role,
          created_at,
          user_profiles!inner (
            email,
            full_name
          )
        `)
        .eq("tenant_id", organizationId)
        .eq("status", "active");

      if (membershipsError) throw membershipsError;

      // Fetch module access for these users
      const userIds = membershipsData?.map(m => m.user_id) || [];
      
      const { data: moduleAccessData } = await supabase
        .from("module_access")
        .select("user_id, module")
        .eq("organization_id", organizationId)
        .is("revoked_at", null)
        .in("user_id", userIds.length > 0 ? userIds : ['none']);

      const moduleAccessMap = new Map<string, Set<string>>();
      moduleAccessData?.forEach(ma => {
        if (!moduleAccessMap.has(ma.user_id)) {
          moduleAccessMap.set(ma.user_id, new Set());
        }
        moduleAccessMap.get(ma.user_id)!.add(ma.module);
      });

      const processedMembers: Member[] = (membershipsData || []).map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        email: m.user_profiles.email,
        full_name: m.user_profiles.full_name,
        org_role: m.org_role || "org_staff",
        status: m.status,
        joined_at: m.created_at,
        has_admin_access: moduleAccessMap.get(m.user_id)?.has("admin") || false,
        has_licensing_access: moduleAccessMap.get(m.user_id)?.has("licensing") || false,
      }));

      setMembers(processedMembers);

      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("invitations")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (invitationsError) throw invitationsError;

      setInvitations(invitationsData || []);
    } catch (error: any) {
      console.error("Error fetching org users:", error);
      toast({
        title: "Failed to load users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [organizationId]);

  const handleRevokeInvitation = async (invitationId: string) => {
    const { error } = await supabase
      .from("invitations")
      .update({ 
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_by: user?.id,
      })
      .eq("id", invitationId);

    if (error) {
      toast({
        title: "Failed to revoke invitation",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Invitation revoked" });
    fetchData();
  };

  const handleResendInvitation = async (email: string) => {
    // Placeholder - email sending would be implemented here
    toast({
      title: "Resend not implemented",
      description: `Would resend invitation to ${email}`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role) {
      case "org_owner": return "default";
      case "org_admin": return "secondary";
      default: return "outline";
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

  if (!organizationId) {
    return (
      <div className="p-6">
        <AppEmptyState
          message="No organization selected"
          description="Select an organization to manage users."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Users"
        description={`Manage members and invitations for ${organizationName}`}
        action={
          <AppButton onClick={() => setInviteModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite user
          </AppButton>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Pending ({invitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <AppCard className="p-0">
            {loading ? (
              <div className="p-6 sm:p-8 text-center text-muted-foreground">
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <div className="p-6 sm:p-8">
                <AppEmptyState
                  message="No members yet"
                  description="Invite users to grant them access to this organization."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {member.full_name || member.email}
                          </p>
                          {member.full_name && (
                            <p className="text-[12px] text-muted-foreground">
                              {member.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.org_role)}>
                          {getRoleLabel(member.org_role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          {member.has_admin_access && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Shield className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {member.has_licensing_access && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <FileText className="h-3 w-3" />
                              Licensing
                            </Badge>
                          )}
                          {!member.has_admin_access && !member.has_licensing_access && (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(member.joined_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 hover:bg-muted rounded">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit access</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </AppCard>
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <AppCard className="p-0">
            {loading ? (
              <div className="p-6 sm:p-8 text-center text-muted-foreground">
                Loading invitations...
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-6 sm:p-8">
                <AppEmptyState
                  message="No pending invitations"
                  description="All invitations have been accepted or expired."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        {invitation.invited_email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(invitation.org_role)}>
                          {getRoleLabel(invitation.org_role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          {invitation.grant_admin_module && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Shield className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {invitation.grant_licensing_module && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <FileText className="h-3 w-3" />
                              Licensing
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            {formatDate(invitation.expires_at)}
                          </span>
                          {isExpired(invitation.expires_at) && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 hover:bg-muted rounded">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleResendInvitation(invitation.invited_email)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRevokeInvitation(invitation.id)}
                              className="text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Revoke
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </AppCard>
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        organizationId={organizationId}
        organizationName={organizationName}
        onSuccess={() => {
          fetchData();
          setActiveTab("invitations");
        }}
      />
    </div>
  );
}
