import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check, X } from "lucide-react";
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

/**
 * APPROVALS PAGE — ACCESS CONTROL (CANONICAL)
 * 
 * Design Rules:
 * - Flat table layout, no card wrappers
 * - Dense, institutional spacing
 * - Explicit actions, no hover-only affordances
 * - Language: Access approved, Access denied (not "Great job!")
 */
export default function ApprovalsPage() {
  const { profile: currentProfile } = useAuth();
  const [pendingMemberships, setPendingMemberships] = useState<PendingMembership[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [formStates, setFormStates] = useState<Record<string, ApprovalFormState>>({});

  const fetchData = async () => {
    setLoading(true);
    
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
        title: "Operation failed",
        description: "Unable to retrieve pending approvals",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: tenantsData, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, name, slug")
      .order("name");

    if (tenantsError) {
      console.error("Error fetching tenants:", tenantsError);
    }

    setTenants(tenantsData || []);

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
      
      if (newContexts.length === 0) return prev;
      
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
        title: "Validation error",
        description: "Select a tenant",
        variant: "destructive",
      });
      return;
    }

    setProcessing(membership.id);

    try {
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

      await supabase
        .from("user_profiles")
        .update({ status: "active" })
        .eq("user_id", membership.user_id)
        .eq("status", "pending");

      toast({
        title: "Access approved",
        description: membership.user_email,
      });

      setPendingMemberships((prev) => prev.filter((m) => m.id !== membership.id));
    } catch (error) {
      console.error("Approval error:", error);
      toast({
        title: "Operation failed",
        description: "Unable to approve access",
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
        description: membership.user_email,
      });

      setPendingMemberships((prev) => prev.filter((m) => m.id !== membership.id));
    } catch (error) {
      console.error("Deny error:", error);
      toast({
        title: "Operation failed",
        description: "Unable to deny access",
        variant: "destructive",
      });
    }

    setProcessing(null);
  };

  const availableRoles: { value: PortalRole; label: string }[] = [
    { value: "tenant_admin", label: "Admin" },
    { value: "tenant_user", label: "User" },
    { value: "viewer", label: "Viewer" },
  ];

  const availableContexts: { value: PortalContext; label: string }[] = [
    { value: "licensing", label: "Licensing" },
    { value: "publishing", label: "Publishing" },
  ];

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
            Access Control
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">
            {pendingMemberships.length === 0 
              ? "No pending requests" 
              : `${pendingMemberships.length} pending`}
          </p>
        </div>
      </div>

      {/* Table - flat, no card wrapper */}
      <div className="border border-[#E5E5E5] rounded-md bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[14px] text-[#6B6B6B]">
            Retrieving records
          </div>
        ) : pendingMemberships.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-[#6B6B6B]">
            No pending approvals.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Organization</TableHead>
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
                    <TableCell className="text-[#6B6B6B]">
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
                        <SelectTrigger className="w-40 h-8 text-[13px]">
                          <SelectValue placeholder="Select" />
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
                        <SelectTrigger className="w-28 h-8 text-[13px]">
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
                      <div className="flex flex-col gap-1">
                        {availableContexts.map((context) => (
                          <label
                            key={context.value}
                            className="flex items-center gap-2 text-[13px] cursor-pointer"
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
                        <SelectTrigger className="w-24 h-8 text-[13px]">
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
                        <button
                          onClick={() => approveMembership(membership)}
                          disabled={processing === membership.id || !formState.tenant_id}
                          className="h-8 px-3 rounded text-[13px] font-medium bg-[#111] text-white hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => denyMembership(membership)}
                          disabled={processing === membership.id}
                          className="h-8 px-3 rounded text-[13px] font-medium border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#D4D4D4] hover:text-[#111] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <X className="h-3.5 w-3.5" />
                          Deny
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
