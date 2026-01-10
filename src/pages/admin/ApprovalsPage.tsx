import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, RefreshCw, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { writeAuditLog, AuditActions, ResourceTypes } from "@/lib/audit";
import type { Database } from "@/integrations/supabase/types";

type PortalRole = Database["public"]["Enums"]["portal_role"];
type PortalContext = Database["public"]["Enums"]["portal_context"];

interface PendingMembership {
  id: string;
  user_id: string;
  tenant_id: string | null;
  status: string;
  created_at: string;
  user_email: string;
  tenant_name: string | null;
}

interface Tenant {
  id: string;
  legal_name: string;
  slug: string;
}

interface ApprovalFormState {
  tenant_id: string;
  roles: PortalRole[];
  contexts: PortalContext[];
  default_context: PortalContext | null;
}

export default function ApprovalsPage() {
  const { profile: currentProfile } = useAuth();
  const [pendingMemberships, setPendingMemberships] = useState<PendingMembership[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [formStates, setFormStates] = useState<Record<string, ApprovalFormState>>({});

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch pending memberships (status = 'invited')
    const { data: memberships, error: membershipsError } = await supabase
      .from("tenant_memberships")
      .select(`
        id,
        user_id,
        tenant_id,
        status,
        created_at,
        user_profiles!inner(email),
        tenants(legal_name)
      `)
      .eq("status", "invited")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (membershipsError) {
      console.error("Error fetching pending memberships:", membershipsError);
      toast({
        title: "Error",
        description: "Failed to load pending approvals",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch all tenants
    const { data: tenantsData, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, legal_name, slug")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("legal_name");

    if (tenantsError) {
      console.error("Error fetching tenants:", tenantsError);
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      });
    }

    setTenants(tenantsData || []);

    // Transform memberships data
    const pending: PendingMembership[] = (memberships || []).map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      tenant_id: m.tenant_id,
      status: m.status,
      created_at: m.created_at,
      user_email: m.user_profiles?.email || "Unknown",
      tenant_name: m.tenants?.legal_name || null,
    }));

    setPendingMemberships(pending);

    // Initialize form states
    const initialStates: Record<string, ApprovalFormState> = {};
    pending.forEach((m) => {
      initialStates[m.id] = {
        tenant_id: m.tenant_id || (tenantsData?.[0]?.id || ""),
        roles: ["licensing_user"],
        contexts: ["licensing"],
        default_context: "licensing",
      };
    });
    setFormStates(initialStates);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateFormState = (membershipId: string, updates: Partial<ApprovalFormState>) => {
    setFormStates((prev) => ({
      ...prev,
      [membershipId]: {
        ...prev[membershipId],
        ...updates,
      },
    }));
  };

  const toggleRole = (membershipId: string, role: PortalRole) => {
    setFormStates((prev) => {
      const current = prev[membershipId]?.roles || [];
      const newRoles = current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role];
      return {
        ...prev,
        [membershipId]: {
          ...prev[membershipId],
          roles: newRoles.length > 0 ? newRoles : ["licensing_user"],
        },
      };
    });
  };

  const toggleContext = (membershipId: string, context: PortalContext) => {
    setFormStates((prev) => {
      const current = prev[membershipId]?.contexts || [];
      const newContexts = current.includes(context)
        ? current.filter((c) => c !== context)
        : [...current, context];
      
      // Ensure at least one context
      if (newContexts.length === 0) return prev;
      
      // Update default_context if needed
      let defaultContext = prev[membershipId]?.default_context;
      if (defaultContext && !newContexts.includes(defaultContext)) {
        defaultContext = newContexts[0];
      }
      
      return {
        ...prev,
        [membershipId]: {
          ...prev[membershipId],
          contexts: newContexts,
          default_context: defaultContext || newContexts[0],
        },
      };
    });
  };

  const approveMembership = async (membership: PendingMembership) => {
    const formState = formStates[membership.id];
    if (!formState?.tenant_id) {
      toast({
        title: "Error",
        description: "Please select a tenant",
        variant: "destructive",
      });
      return;
    }

    if (formState.roles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one role",
        variant: "destructive",
      });
      return;
    }

    setProcessing(membership.id);

    try {
      // Update the membership to active and set tenant
      const { error: membershipError } = await supabase
        .from("tenant_memberships")
        .update({
          status: "active",
          tenant_id: formState.tenant_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", membership.id);

      if (membershipError) throw membershipError;

      // Clear existing membership roles
      await supabase
        .from("membership_roles")
        .delete()
        .eq("membership_id", membership.id);

      // Add new membership roles
      const rolesToInsert = formState.roles.map((role) => ({
        membership_id: membership.id,
        role,
      }));

      const { error: rolesError } = await supabase
        .from("membership_roles")
        .insert(rolesToInsert);

      if (rolesError) throw rolesError;

      // Update user's default context if not set
      await supabase
        .from("user_profiles")
        .update({
          default_tenant_id: formState.tenant_id,
          default_context: formState.default_context,
        })
        .eq("id", membership.user_id)
        .is("default_tenant_id", null);

      // Audit log
      await writeAuditLog({
        userId: currentProfile?.id,
        tenantId: formState.tenant_id,
        action: AuditActions.MEMBERSHIP_APPROVED,
        resourceType: ResourceTypes.TENANT_MEMBERSHIP,
        resourceId: membership.id,
        details: {
          approved_user_email: membership.user_email,
          tenant_id: formState.tenant_id,
          roles: formState.roles,
        },
      });

      toast({
        title: "Access approved",
        description: `${membership.user_email} now has access`,
      });

      // Remove from list
      setPendingMemberships((prev) => prev.filter((m) => m.id !== membership.id));
    } catch (error) {
      console.error("Approval error:", error);
      toast({
        title: "Error",
        description: "Failed to approve access",
        variant: "destructive",
      });
    }

    setProcessing(null);
  };

  const denyMembership = async (membership: PendingMembership) => {
    setProcessing(membership.id);

    try {
      const { error } = await supabase
        .from("tenant_memberships")
        .update({
          status: "suspended",
          updated_at: new Date().toISOString(),
        })
        .eq("id", membership.id);

      if (error) throw error;

      // Audit log
      await writeAuditLog({
        userId: currentProfile?.id,
        action: AuditActions.MEMBERSHIP_DENIED,
        resourceType: ResourceTypes.TENANT_MEMBERSHIP,
        resourceId: membership.id,
        details: {
          denied_user_email: membership.user_email,
        },
      });

      toast({
        title: "Access denied",
        description: `${membership.user_email} was denied access`,
      });

      // Remove from list
      setPendingMemberships((prev) => prev.filter((m) => m.id !== membership.id));
    } catch (error) {
      console.error("Deny error:", error);
      toast({
        title: "Error",
        description: "Failed to deny access",
        variant: "destructive",
      });
    }

    setProcessing(null);
  };

  const availableRoles: { value: PortalRole; label: string }[] = [
    { value: "tenant_owner", label: "Owner" },
    { value: "publishing_admin", label: "Publishing Admin" },
    { value: "licensing_user", label: "Licensing User" },
    { value: "read_only", label: "Read Only" },
  ];

  const availableContexts: { value: PortalContext; label: string }[] = [
    { value: "licensing", label: "Licensing" },
    { value: "publishing", label: "Publishing" },
  ];

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
            <h1 className="text-2xl font-semibold">Pending Approvals</h1>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Access Requests</CardTitle>
            <CardDescription>
              {pendingMemberships.length === 0
                ? "No pending approvals"
                : `${pendingMemberships.length} request(s) pending review`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : pendingMemberships.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No pending approvals</p>
                <p className="text-sm mt-1">All access requests have been processed</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Contexts</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingMemberships.map((membership) => {
                    const formState = formStates[membership.id] || {
                      tenant_id: "",
                      roles: [],
                      contexts: [],
                      default_context: null,
                    };
                    
                    return (
                      <TableRow key={membership.id}>
                        <TableCell className="font-medium">
                          {membership.user_email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(membership.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={formState.tenant_id}
                            onValueChange={(value) =>
                              updateFormState(membership.id, { tenant_id: value })
                            }
                            disabled={processing === membership.id}
                          >
                            <SelectTrigger className="w-44">
                              <SelectValue placeholder="Select tenant" />
                            </SelectTrigger>
                            <SelectContent>
                              {tenants.map((tenant) => (
                                <SelectItem key={tenant.id} value={tenant.id}>
                                  {tenant.legal_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            {availableRoles.map((role) => (
                              <label
                                key={role.value}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <Checkbox
                                  checked={formState.roles.includes(role.value)}
                                  onCheckedChange={() =>
                                    toggleRole(membership.id, role.value)
                                  }
                                  disabled={processing === membership.id}
                                />
                                {role.label}
                              </label>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            {availableContexts.map((context) => (
                              <label
                                key={context.value}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <Checkbox
                                  checked={formState.contexts.includes(context.value)}
                                  onCheckedChange={() =>
                                    toggleContext(membership.id, context.value)
                                  }
                                  disabled={processing === membership.id}
                                />
                                {context.label}
                              </label>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={formState.default_context || ""}
                            onValueChange={(value) =>
                              updateFormState(membership.id, {
                                default_context: value as PortalContext,
                              })
                            }
                            disabled={processing === membership.id}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {formState.contexts.map((ctx) => (
                                <SelectItem key={ctx} value={ctx}>
                                  {ctx === "licensing" ? "Licensing" : "Publishing"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveMembership(membership)}
                              disabled={processing === membership.id || !formState.tenant_id}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => denyMembership(membership)}
                              disabled={processing === membership.id}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Deny
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
