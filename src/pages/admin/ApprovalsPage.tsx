import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
 * APPROVALS PAGE — ACCESS CONTROL (AUTHORITY UX CANON)
 * 
 * Purpose: Approve/deny pending membership requests
 * 
 * Compliance:
 * - Mobile: Vertical card list, no horizontal scrolling
 * - Desktop: Table within centered content column
 * - Editable controls only for form inputs (this is an action page)
 * - Clear action hierarchy
 */
export default function ApprovalsPage() {
  const isMobile = useIsMobile();
  const { profile: currentProfile } = useAuth();
  const [pendingMemberships, setPendingMemberships] = useState<PendingMembership[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [formStates, setFormStates] = useState<Record<string, ApprovalFormState>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
        description: "Select an organization",
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
    { value: "tenant_admin", label: "Administrator" },
    { value: "tenant_user", label: "Member" },
    { value: "viewer", label: "Viewer" },
  ];

  const availableContexts: { value: PortalContext; label: string }[] = [
    { value: "licensing", label: "Licensing" },
    { value: "publishing", label: "Publishing" },
  ];

  return (
    <div 
      className="min-h-full py-6 sm:py-10 px-4 sm:px-6"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link 
            to="/admin" 
            className="h-11 w-11 sm:h-8 sm:w-8 rounded flex items-center justify-center transition-colors shrink-0"
            style={{ color: 'var(--platform-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" />
          </Link>
          <div>
            <h1 
              className="text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em]"
              style={{ color: 'var(--platform-text)' }}
            >
              Access Control
            </h1>
            <p 
              className="text-[14px] sm:text-[15px] mt-0.5"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {pendingMemberships.length === 0 
                ? "No pending requests" 
                : `${pendingMemberships.length} pending`}
            </p>
          </div>
        </div>

        {/* Content Panel */}
        <div 
          className="rounded-lg sm:rounded overflow-hidden"
          style={{ 
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)'
          }}
        >
          {loading ? (
            <div 
              className="py-16 text-center text-[14px]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Retrieving records
            </div>
          ) : pendingMemberships.length === 0 ? (
            <div 
              className="py-16 text-center px-4"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              <p className="text-[14px]">No pending approvals.</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--platform-text-muted)' }}>
                Records will appear when users request access.
              </p>
            </div>
          ) : isMobile ? (
            /* Mobile: Vertical Card List */
            <div className="divide-y" style={{ borderColor: 'var(--platform-border)' }}>
              {pendingMemberships.map((membership) => {
                const formState = formStates[membership.id] || {
                  tenant_id: "",
                  role: "tenant_user" as PortalRole,
                  contexts: [],
                  default_context: null,
                };
                const isExpanded = expandedCard === membership.id;
                
                return (
                  <div key={membership.id} className="p-4">
                    {/* Card Header */}
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : membership.id)}
                      className="w-full flex items-start justify-between gap-3 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div 
                          className="text-[15px] font-medium break-words"
                          style={{ color: 'var(--platform-text)' }}
                        >
                          {membership.user_email}
                        </div>
                        <div 
                          className="text-[13px] mt-1"
                          style={{ color: 'var(--platform-text-secondary)' }}
                        >
                          Requested {new Date(membership.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <ChevronRight 
                        className={`h-5 w-5 shrink-0 mt-0.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        style={{ color: 'var(--platform-text-muted)' }} 
                      />
                    </button>

                    {/* Expanded Form */}
                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        {/* Organization */}
                        <div>
                          <label 
                            className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
                            style={{ color: 'var(--platform-text-muted)' }}
                          >
                            Organization
                          </label>
                          <Select
                            value={formState.tenant_id}
                            onValueChange={(value) =>
                              updateFormState(membership.id, { tenant_id: value })
                            }
                            disabled={processing === membership.id}
                          >
                            <SelectTrigger 
                              className="w-full h-11 text-[14px] bg-transparent"
                              style={{ 
                                borderColor: 'var(--platform-border)',
                                color: 'var(--platform-text)',
                              }}
                            >
                              <SelectValue placeholder="Select organization" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1B] border-white/10">
                              {tenants.map((tenant) => (
                                <SelectItem 
                                  key={tenant.id} 
                                  value={tenant.id}
                                  className="text-white/80 focus:bg-white/10 focus:text-white"
                                >
                                  {tenant.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Role */}
                        <div>
                          <label 
                            className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
                            style={{ color: 'var(--platform-text-muted)' }}
                          >
                            Role
                          </label>
                          <Select
                            value={formState.role}
                            onValueChange={(value) =>
                              updateFormState(membership.id, { role: value as PortalRole })
                            }
                            disabled={processing === membership.id}
                          >
                            <SelectTrigger 
                              className="w-full h-11 text-[14px] bg-transparent"
                              style={{ 
                                borderColor: 'var(--platform-border)',
                                color: 'var(--platform-text)',
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1B] border-white/10">
                              {availableRoles.map((role) => (
                                <SelectItem 
                                  key={role.value} 
                                  value={role.value}
                                  className="text-white/80 focus:bg-white/10 focus:text-white"
                                >
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Context Access */}
                        <div>
                          <label 
                            className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
                            style={{ color: 'var(--platform-text-muted)' }}
                          >
                            Context Access
                          </label>
                          <div className="space-y-2">
                            {availableContexts.map((context) => (
                              <label
                                key={context.value}
                                className="flex items-center gap-3 h-11 px-3 rounded-lg cursor-pointer"
                                style={{ 
                                  backgroundColor: formState.contexts.includes(context.value) 
                                    ? 'rgba(255,255,255,0.04)' 
                                    : 'transparent',
                                  border: '1px solid var(--platform-border)',
                                }}
                              >
                                <Checkbox
                                  checked={formState.contexts.includes(context.value)}
                                  onCheckedChange={() =>
                                    toggleContext(membership.id, context.value)
                                  }
                                  disabled={processing === membership.id}
                                  className="border-white/20 data-[state=checked]:bg-white/90 data-[state=checked]:border-white/90"
                                />
                                <span 
                                  className="text-[14px]"
                                  style={{ color: 'var(--platform-text)' }}
                                >
                                  {context.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Default Context */}
                        {formState.contexts.length > 1 && (
                          <div>
                            <label 
                              className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
                              style={{ color: 'var(--platform-text-muted)' }}
                            >
                              Default Context
                            </label>
                            <Select
                              value={formState.default_context || ""}
                              onValueChange={(value) =>
                                updateFormState(membership.id, {
                                  default_context: value as PortalContext,
                                })
                              }
                              disabled={processing === membership.id}
                            >
                              <SelectTrigger 
                                className="w-full h-11 text-[14px] bg-transparent"
                                style={{ 
                                  borderColor: 'var(--platform-border)',
                                  color: 'var(--platform-text)',
                                }}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1A1A1B] border-white/10">
                                {formState.contexts.map((ctx) => (
                                  <SelectItem 
                                    key={ctx} 
                                    value={ctx}
                                    className="text-white/80 focus:bg-white/10 focus:text-white"
                                  >
                                    {ctx === "licensing" ? "Licensing" : "Publishing"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => approveMembership(membership)}
                            disabled={processing === membership.id || !formState.tenant_id}
                            className="flex-1 h-11 rounded-lg text-[14px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ 
                              backgroundColor: 'var(--platform-text)',
                              color: 'var(--platform-canvas)'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => denyMembership(membership)}
                            disabled={processing === membership.id}
                            className="flex-1 h-11 rounded-lg text-[14px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ 
                              border: '1px solid var(--platform-border)',
                              color: 'var(--platform-text-secondary)'
                            }}
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Desktop: Table Layout */
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
                      <TableCell style={{ color: 'var(--platform-text-secondary)' }}>
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
                          <SelectTrigger className="w-40 h-8 text-[13px] bg-transparent border-white/10 text-white/90">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1B] border-white/10">
                            {tenants.map((tenant) => (
                              <SelectItem 
                                key={tenant.id} 
                                value={tenant.id}
                                className="text-white/80 focus:bg-white/10 focus:text-white"
                              >
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
                          <SelectTrigger className="w-28 h-8 text-[13px] bg-transparent border-white/10 text-white/90">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1B] border-white/10">
                            {availableRoles.map((role) => (
                              <SelectItem 
                                key={role.value} 
                                value={role.value}
                                className="text-white/80 focus:bg-white/10 focus:text-white"
                              >
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
                              className="flex items-center gap-2 text-[13px] cursor-pointer"
                              style={{ color: 'var(--platform-text-secondary)' }}
                            >
                              <Checkbox
                                checked={formState.contexts.includes(context.value)}
                                onCheckedChange={() =>
                                  toggleContext(membership.id, context.value)
                                }
                                disabled={processing === membership.id}
                                className="border-white/20 data-[state=checked]:bg-white/90 data-[state=checked]:border-white/90"
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
                          <SelectTrigger className="w-24 h-8 text-[13px] bg-transparent border-white/10 text-white/90">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1B] border-white/10">
                            {formState.contexts.map((ctx) => (
                              <SelectItem 
                                key={ctx} 
                                value={ctx}
                                className="text-white/80 focus:bg-white/10 focus:text-white"
                              >
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
                            className="h-8 px-3 rounded text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ 
                              backgroundColor: 'var(--platform-text)',
                              color: 'var(--platform-canvas)'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => denyMembership(membership)}
                            disabled={processing === membership.id}
                            className="h-8 px-3 rounded text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ 
                              border: '1px solid var(--platform-border)',
                              color: 'var(--platform-text-secondary)'
                            }}
                          >
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
    </div>
  );
}