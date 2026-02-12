import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Shield, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppPageLayout } from "@/components/app-ui";
import { ContentPanel, EmptyState, LoadingState } from "@/components/ui/page-shell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
 * 
 * Note: Client invitations are managed from Rights → Clients → Client Detail → Settings tab.
 */
export default function OrganizationUsersPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  
  const { members, loading } = useOrganizationMembers(orgId || null);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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

  if (!organization) {
    return (
      <AppPageLayout title="Loading...">
        <div className="py-16 text-center">
          <LoadingState message="Loading organization…" />
        </div>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout
      title={organization.name}
      backLink={{ to: "/console/tenants", label: "Organizations" }}
    >
      <ContentPanel>
        {loading ? (
          <LoadingState />
        ) : members.length === 0 ? (
          <EmptyState
            title="No members yet"
            description="Members are added when users accept organization invitations."
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
    </AppPageLayout>
  );
}
