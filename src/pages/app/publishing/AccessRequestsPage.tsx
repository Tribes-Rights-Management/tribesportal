import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AppButton,
  AppTable,
  AppTableBody,
  AppTableCell,
  AppTableHead,
  AppTableHeader,
  AppTableRow,
  AppChip,
} from "@/components/app-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // TODO: needs AppSelect migration
import { toast } from "sonner";
import { Check, X, Clock, UserCircle } from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type PortalRole = Database["public"]["Enums"]["portal_role"];
type PortalContext = Database["public"]["Enums"]["portal_context"];

type PendingMembership = {
  id: string;
  user_id: string;
  tenant_id: string;
  status: string;
  created_at: string;
  user_email?: string;
};

export default function AccessRequestsPage() {
  const { activeTenant } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, PortalRole>>({});
  const [selectedContexts, setSelectedContexts] = useState<Record<string, PortalContext[]>>({});

  // Fetch pending memberships for the active tenant
  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ["pending-memberships", activeTenant?.tenant_id],
    queryFn: async () => {
      if (!activeTenant?.tenant_id) return [];

      // Get pending memberships
      const { data: memberships, error } = await supabase
        .from("tenant_memberships")
        .select("id, user_id, tenant_id, status, created_at")
        .eq("tenant_id", activeTenant.tenant_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user emails for each membership
      const userIds = memberships?.map((m) => m.user_id) ?? [];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, email")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.email]) ?? []);

      return memberships?.map((m) => ({
        ...m,
        user_email: profileMap.get(m.user_id) ?? "Unknown",
      })) as PendingMembership[];
    },
    enabled: !!activeTenant?.tenant_id,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ 
      membershipId, 
      role, 
      contexts 
    }: { 
      membershipId: string; 
      role: PortalRole; 
      contexts: PortalContext[];
    }) => {
      // Update membership status to active and set role/contexts
      const { error } = await supabase
        .from("tenant_memberships")
        .update({ 
          status: "active", 
          role,
          allowed_contexts: contexts,
          default_context: contexts[0] ?? null,
          updated_at: new Date().toISOString() 
        })
        .eq("id", membershipId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Access approved");
      queryClient.invalidateQueries({ queryKey: ["pending-memberships"] });
    },
    onError: (error) => {
      toast.error("Failed to approve access");
      console.error("Approval error:", error);
    },
  });

  // Deny mutation
  const denyMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase
        .from("tenant_memberships")
        .update({ status: "denied", updated_at: new Date().toISOString() })
        .eq("id", membershipId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Access denied");
      queryClient.invalidateQueries({ queryKey: ["pending-memberships"] });
    },
    onError: (error) => {
      toast.error("Failed to deny access");
      console.error("Deny error:", error);
    },
  });

  const handleApprove = (membershipId: string) => {
    const role = selectedRoles[membershipId] ?? "tenant_user";
    const contexts = selectedContexts[membershipId] ?? ["publishing"];
    approveMutation.mutate({ membershipId, role, contexts });
  };

  const handleDeny = (membershipId: string) => {
    denyMutation.mutate(membershipId);
  };

  const handleRoleChange = (membershipId: string, role: PortalRole) => {
    setSelectedRoles((prev) => ({ ...prev, [membershipId]: role }));
  };

  const handleContextToggle = (membershipId: string, context: PortalContext) => {
    setSelectedContexts((prev) => {
      const current = prev[membershipId] ?? ["publishing"];
      if (current.includes(context)) {
        // Don't remove if it's the last one
        if (current.length === 1) return prev;
        return { ...prev, [membershipId]: current.filter(c => c !== context) };
      } else {
        return { ...prev, [membershipId]: [...current, context] };
      }
    });
  };

  if (!activeTenant) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tenant selected
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px]">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-[24px] font-medium text-foreground tracking-[-0.02em]">
          Access Requests
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Review and approve pending access requests for {activeTenant.tenant_name}.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading requests...
        </div>
      ) : pendingRequests?.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Check className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-[15px] text-foreground font-medium">
            No pending requests
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            All access requests have been processed.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <AppTable>
            <AppTableHeader>
              <AppTableRow className="bg-muted/50">
                <AppTableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                  User
                </AppTableHead>
                <AppTableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                  Requested
                </AppTableHead>
                <AppTableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                  Status
                </AppTableHead>
                <AppTableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                  Role
                </AppTableHead>
                <AppTableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
                  Contexts
                </AppTableHead>
                <AppTableHead className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                  Actions
                </AppTableHead>
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody>
              {pendingRequests?.map((request) => (
                <AppTableRow key={request.id}>
                  <AppTableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-[13px] text-foreground font-medium">
                        {request.user_email}
                      </span>
                    </div>
                  </AppTableCell>
                  <AppTableCell>
                    <span className="text-[13px] text-muted-foreground">
                      {format(new Date(request.created_at), "MMM d, yyyy")}
                    </span>
                  </AppTableCell>
                  <AppTableCell>
                    <AppChip
                      variant="outline"
                      className="text-[11px] font-normal border-amber-400 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </AppChip>
                  </AppTableCell>
                  <AppTableCell>
                    <Select
                      value={selectedRoles[request.id] ?? "tenant_user"}
                      onValueChange={(value) => handleRoleChange(request.id, value as PortalRole)}
                    >
                      <SelectTrigger className="h-8 w-[140px] text-[12px] border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer" className="text-[12px]">
                          Viewer
                        </SelectItem>
                        <SelectItem value="tenant_user" className="text-[12px]">
                          Tenant User
                        </SelectItem>
                        <SelectItem value="tenant_admin" className="text-[12px]">
                          Tenant Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </AppTableCell>
                  <AppTableCell>
                    <div className="flex gap-1">
                      <AppButton
                        variant={(selectedContexts[request.id] ?? ["publishing"]).includes("publishing") ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleContextToggle(request.id, "publishing")}
                        className="h-7 px-2 text-[10px]"
                      >
                        Publishing
                      </AppButton>
                      <AppButton
                        variant={(selectedContexts[request.id] ?? ["publishing"]).includes("licensing") ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleContextToggle(request.id, "licensing")}
                        className="h-7 px-2 text-[10px]"
                      >
                        Licensing
                      </AppButton>
                    </div>
                  </AppTableCell>
                  <AppTableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <AppButton
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeny(request.id)}
                        disabled={denyMutation.isPending}
                        className="h-8 px-3 text-[12px]"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Deny
                      </AppButton>
                      <AppButton
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(request.id)}
                        disabled={approveMutation.isPending}
                        className="h-8 px-3 text-[12px]"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </AppButton>
                    </div>
                  </AppTableCell>
                </AppTableRow>
              ))}
            </AppTableBody>
          </AppTable>
        </div>
      )}
    </div>
  );
}
