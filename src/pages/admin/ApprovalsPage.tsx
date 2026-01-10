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
  name: string;
  slug: string;
}

interface ApprovalFormState {
  tenant_id: string;
  role: PortalRole;
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
    
    // Fetch pending memberships (status = 'pending')
    const { data: memberships, error: membershipsError } = await supabase
      .from("tenant_memberships")
      .select(`
        id,
        user_id,
        tenant_id,
        status,
        created_at,
        user_profiles!inner(email),
        tenants(name)
      `)
      .eq("status", "pending")
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
      .select("id, name, slug")
      .order("name");

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
      tenant_name: m.tenants?.name || null,
    }));

    setPendingMemberships(pending);

    // Initialize form states
    const initialStates: Record<string, ApprovalFormState> = {};
    pending.forEach((m) => {
      initialStates[m.id] = {
        tenant_id: m.tenant_id || (tenantsData?.[0]?.id || ""),
        role: "tenant_user",
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

    setProcessing(membership.id);

    try {
      // Update the membership to active and set tenant, role, contexts
      const { error: membershipError } = await supabase
        .from("tenant_memberships")
        .update({
          status: "active",
          tenant_id: formState.tenant_id,
          role: formState.role,
          allowed_contexts: formState.contexts,
          default_context: formState.default_context,
          updated_at: new Date().toISOString(),
        })
        .eq("id", membership.id);

      if (membershipError) throw membershipError;

      // Also activate the user profile if it's still pending
      await supabase
        .from("user_profiles")
        .update({ status: "active" })
        .eq("user_id", membership.user_id)
        .eq("status", "pending");

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
          status: "denied",
          updated_at: new Date().toISOString(),
        })
        .eq("id", membership.id);

      if (error) throw error;

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
    { value: "tenant_admin", label: "Tenant Admin" },
    { value: "tenant_user", label: "Tenant User" },
    { value: "viewer", label: "Viewer" },
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
                    <TableHead>Role</TableHead>
                    <TableHead>Contexts</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingMemberships.map((membership) => {
                    const formState = formStates[membership.id] || {
                      tenant_id: "",
                      role: "tenant_user" as PortalRole,
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
                                  {tenant.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={formState.role}
                            onValueChange={(value) =>
                              updateFormState(membership.id, { role: value as PortalRole })
                            }
                            disabled={processing === membership.id}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
