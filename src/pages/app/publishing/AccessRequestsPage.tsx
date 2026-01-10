import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Clock, UserCircle } from "lucide-react";
import { format } from "date-fns";

type PendingMembership = {
  id: string;
  user_id: string;
  tenant_id: string;
  status: string;
  created_at: string;
  user_email?: string;
};

type PortalRole = "tenant_owner" | "publishing_admin" | "licensing_user" | "read_only" | "internal_admin";

export default function AccessRequestsPage() {
  const { activeTenant } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, PortalRole>>({}); 

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
        .eq("status", "invited")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user emails for each membership
      const userIds = memberships?.map((m) => m.user_id) ?? [];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, email")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.email]) ?? []);

      return memberships?.map((m) => ({
        ...m,
        user_email: profileMap.get(m.user_id) ?? "Unknown",
      })) as PendingMembership[];
    },
    enabled: !!activeTenant?.tenant_id,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ membershipId, role }: { membershipId: string; role: PortalRole }) => {
      // Update membership status to active
      const { error: membershipError } = await supabase
        .from("tenant_memberships")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("id", membershipId);

      if (membershipError) throw membershipError;

      // Assign the selected role
      const { error: roleError } = await supabase
        .from("membership_roles")
        .insert({ membership_id: membershipId, role });

      if (roleError) throw roleError;
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

  // Deny mutation (soft deny - set to suspended)
  const denyMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase
        .from("tenant_memberships")
        .update({ status: "suspended", updated_at: new Date().toISOString() })
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
    const role = selectedRoles[membershipId] ?? "read_only";
    approveMutation.mutate({ membershipId, role });
  };

  const handleDeny = (membershipId: string) => {
    denyMutation.mutate(membershipId);
  };

  const handleRoleChange = (membershipId: string, role: PortalRole) => {
    setSelectedRoles((prev) => ({ ...prev, [membershipId]: role }));
  };

  if (!activeTenant) {
    return (
      <div className="text-center py-12 text-[#71717A]">
        No tenant selected
      </div>
    );
  }

  return (
    <div className="max-w-[1000px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-medium text-[#0A0A0A] tracking-[-0.02em]">
          Access Requests
        </h1>
        <p className="mt-2 text-[14px] text-[#71717A]">
          Review and approve pending access requests for {activeTenant.tenant_name}.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-[#71717A]">
          Loading requests...
        </div>
      ) : pendingRequests?.length === 0 ? (
        <div className="border border-[#E4E4E7] rounded-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-[#F4F4F5] flex items-center justify-center">
              <Check className="h-6 w-6 text-[#71717A]" />
            </div>
          </div>
          <p className="text-[15px] text-[#52525B] font-medium">
            No pending requests
          </p>
          <p className="mt-1 text-[13px] text-[#A1A1AA]">
            All access requests have been processed.
          </p>
        </div>
      ) : (
        <div className="border border-[#E4E4E7] rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FAFAFA]">
                <TableHead className="text-[12px] font-medium text-[#71717A] uppercase tracking-wide">
                  User
                </TableHead>
                <TableHead className="text-[12px] font-medium text-[#71717A] uppercase tracking-wide">
                  Requested
                </TableHead>
                <TableHead className="text-[12px] font-medium text-[#71717A] uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="text-[12px] font-medium text-[#71717A] uppercase tracking-wide">
                  Assign Role
                </TableHead>
                <TableHead className="text-[12px] font-medium text-[#71717A] uppercase tracking-wide text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                        <UserCircle className="h-4 w-4 text-[#71717A]" />
                      </div>
                      <span className="text-[13px] text-[#0A0A0A] font-medium">
                        {request.user_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[13px] text-[#71717A]">
                      {format(new Date(request.created_at), "MMM d, yyyy")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[11px] font-normal border-[#FCD34D] bg-[#FFFBEB] text-[#92400E]"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={selectedRoles[request.id] ?? "read_only"}
                      onValueChange={(value) => handleRoleChange(request.id, value as PortalRole)}
                    >
                      <SelectTrigger className="h-8 w-[160px] text-[12px] border-[#E4E4E7]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read_only" className="text-[12px]">
                          Read Only
                        </SelectItem>
                        <SelectItem value="licensing_user" className="text-[12px]">
                          Licensing User
                        </SelectItem>
                        <SelectItem value="publishing_admin" className="text-[12px]">
                          Publishing Admin
                        </SelectItem>
                        <SelectItem value="tenant_owner" className="text-[12px]">
                          Tenant Owner
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeny(request.id)}
                        disabled={denyMutation.isPending}
                        className="h-8 px-3 text-[12px] text-[#71717A] border-[#E4E4E7] hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#FECACA]"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Deny
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={approveMutation.isPending}
                        className="h-8 px-3 text-[12px] bg-[#0A0A0A] hover:bg-[#262626]"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
