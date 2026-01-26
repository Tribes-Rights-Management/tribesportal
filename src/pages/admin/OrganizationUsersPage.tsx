import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConsoleButton } from "@/components/console";
import { Plus, MoreHorizontal, Mail, XCircle, UserCheck, Shield, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PageContainer } from "@/components/ui/page-container";
import { PageShell, ContentPanel, EmptyState, LoadingState } from "@/components/ui/page-shell";
import { InviteUserModal } from "@/components/admin/InviteUserModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

/**
 * ORGANIZATION USERS PAGE — MEMBER MANAGEMENT
 * 
 * Allows org admins to:
 * - View current members and their module access
 * - View pending invitations
 * - Invite new users
 * - Revoke invitations
 */
export default function OrganizationUsersPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("members");
  
  const { members, invitations, loading, refetch } = useOrganizationMembers(orgId || null);

  // Fetch organization details
  useEffect(() => {
    if (!orgId) return;

    const fetchOrg = async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, slug")
        .eq("id", orgId)
        .single();

      if (error || !data) {
        toast({
          title: "Organization not found",
          variant: "destructive",
        });
        navigate("/console/organizations");
        return;
      }

      setOrganization(data);
    };

    fetchOrg();
  }, [orgId, navigate]);

  const handleRevokeInvitation = async (invitationId: string) => {
    const { error } = await supabase
      .from("invitations")
      .update({ 
        status: "revoked",
        revoked_at: new Date().toISOString(),
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
    refetch();
  };

  const handleResendInvitation = async (invitationId: string, email: string) => {
    // For now, just show a toast - email sending would be implemented here
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "org_owner":
        return "default";
      case "org_admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "org_owner":
        return "Owner";
      case "org_admin":
        return "Admin";
      case "org_staff":
        return "Staff";
      case "org_client":
        return "Client";
      default:
        return role;
    }
  };

  const subtitleText = loading 
    ? "Loading…" 
    : `${members.length} member${members.length !== 1 ? 's' : ''} · ${invitations.length} pending`;

  if (!organization) {
    return (
      <PageContainer>
        <div className="py-16 text-center">
          <LoadingState message="Loading organization…" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageShell
        title={organization.name}
        subtitle={subtitleText}
        backTo="/console/organizations"
        backLabel="Organizations"
      >
        <ConsoleButton
          intent="primary"
          size="sm"
          onClick={() => setInviteModalOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Invite user</span>
        </ConsoleButton>
      </PageShell>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="members">
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Pending ({invitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <ContentPanel>
            {loading ? (
              <LoadingState />
            ) : members.length === 0 ? (
              <EmptyState
                title="No members yet"
                description="Invite users to grant them access to this organization."
              />
            ) : (
              <>
                {/* Mobile view */}
                <div className="block md:hidden">
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      className="px-4 py-3.5"
                      style={{
                        borderBottom: index < members.length - 1 ? '1px solid var(--platform-border)' : undefined,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-medium truncate" style={{ color: 'var(--platform-text)' }}>
                            {member.full_name || member.email}
                          </p>
                          {member.full_name && (
                            <p className="text-[12px] truncate" style={{ color: 'var(--platform-text-secondary)' }}>
                              {member.email}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getRoleBadgeVariant(member.org_role)}>
                              {getRoleLabel(member.org_role)}
                            </Badge>
                            {member.has_admin_access && (
                              <Badge variant="outline" className="gap-1">
                                <Shield className="h-3 w-3" />
                                Admin
                              </Badge>
                            )}
                            {member.has_licensing_access && (
                              <Badge variant="outline" className="gap-1">
                                <FileText className="h-3 w-3" />
                                Licensing
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-muted rounded">
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
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Modules</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-16"></TableHead>
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
                            <div className="flex gap-1">
                              {member.has_admin_access && (
                                <Badge variant="outline" className="gap-1">
                                  <Shield className="h-3 w-3" />
                                  Admin
                                </Badge>
                              )}
                              {member.has_licensing_access && (
                                <Badge variant="outline" className="gap-1">
                                  <FileText className="h-3 w-3" />
                                  Licensing
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(member.joined_at)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-muted rounded">
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
              </>
            )}
          </ContentPanel>
        </TabsContent>

        <TabsContent value="invitations">
          <ContentPanel>
            {loading ? (
              <LoadingState />
            ) : invitations.length === 0 ? (
              <EmptyState
                title="No pending invitations"
                description="All invitations have been accepted or expired."
              />
            ) : (
              <>
                {/* Mobile view */}
                <div className="block md:hidden">
                  {invitations.map((invitation, index) => (
                    <div
                      key={invitation.id}
                      className="px-4 py-3.5"
                      style={{
                        borderBottom: index < invitations.length - 1 ? '1px solid var(--platform-border)' : undefined,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-medium truncate" style={{ color: 'var(--platform-text)' }}>
                            {invitation.invited_email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getRoleBadgeVariant(invitation.org_role)}>
                              {getRoleLabel(invitation.org_role)}
                            </Badge>
                            {isExpired(invitation.expires_at) && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                          </div>
                          <p className="text-[12px] mt-1" style={{ color: 'var(--platform-text-secondary)' }}>
                            Expires {formatDate(invitation.expires_at)}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-muted rounded">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id, invitation.invited_email)}>
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
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Modules</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="w-16"></TableHead>
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
                            <div className="flex gap-1">
                              {invitation.grant_admin_module && (
                                <Badge variant="outline" className="gap-1">
                                  <Shield className="h-3 w-3" />
                                  Admin
                                </Badge>
                              )}
                              {invitation.grant_licensing_module && (
                                <Badge variant="outline" className="gap-1">
                                  <FileText className="h-3 w-3" />
                                  Licensing
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {formatDate(invitation.expires_at)}
                              </span>
                              {isExpired(invitation.expires_at) && (
                                <Badge variant="destructive">Expired</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-muted rounded">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id, invitation.invited_email)}>
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
              </>
            )}
          </ContentPanel>
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        organizationId={organization.id}
        organizationName={organization.name}
        onSuccess={refetch}
      />
    </PageContainer>
  );
}
