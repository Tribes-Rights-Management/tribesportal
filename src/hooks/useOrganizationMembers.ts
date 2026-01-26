import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type OrgRole = Database["public"]["Enums"]["org_role"];
type AccessLevel = Database["public"]["Enums"]["access_level"];
type MembershipStatus = Database["public"]["Enums"]["membership_status"];

export interface OrganizationMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  org_role: OrgRole;
  status: MembershipStatus;
  has_admin_access: boolean;
  has_licensing_access: boolean;
  admin_access_level: AccessLevel | null;
  licensing_access_level: AccessLevel | null;
  joined_at: string;
}

export interface PendingInvitation {
  id: string;
  invited_email: string;
  org_role: OrgRole;
  grant_admin_module: boolean;
  grant_licensing_module: boolean;
  admin_access_level: AccessLevel | null;
  licensing_access_level: AccessLevel | null;
  created_at: string;
  expires_at: string;
  invited_by_email: string;
}

export function useOrganizationMembers(organizationId: string | null) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setMembers([]);
      setInvitations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch members with their module access
      const { data: memberships, error: membershipsError } = await supabase
        .from("tenant_memberships")
        .select(`
          id,
          user_id,
          org_role,
          status,
          created_at,
          user_profiles!inner (
            email,
            full_name
          )
        `)
        .eq("tenant_id", organizationId)
        .order("created_at", { ascending: false });

      if (membershipsError) throw membershipsError;

      // Fetch module access for all members
      const { data: moduleAccess, error: moduleError } = await supabase
        .from("module_access")
        .select("user_id, module, access_level")
        .eq("organization_id", organizationId)
        .is("revoked_at", null);

      if (moduleError) throw moduleError;

      // Build member objects
      const memberList: OrganizationMember[] = (memberships || []).map((m: any) => {
        const userModules = (moduleAccess || []).filter((ma: any) => ma.user_id === m.user_id);
        const adminAccess = userModules.find((ma: any) => ma.module === "admin");
        const licensingAccess = userModules.find((ma: any) => ma.module === "licensing");

        return {
          id: m.id,
          user_id: m.user_id,
          email: m.user_profiles.email,
          full_name: m.user_profiles.full_name,
          org_role: m.org_role,
          status: m.status,
          has_admin_access: !!adminAccess,
          has_licensing_access: !!licensingAccess,
          admin_access_level: adminAccess?.access_level || null,
          licensing_access_level: licensingAccess?.access_level || null,
          joined_at: m.created_at,
        };
      });

      setMembers(memberList);

      // Fetch pending invitations
      const { data: invites, error: invitesError } = await supabase
        .from("invitations")
        .select(`
          id,
          invited_email,
          org_role,
          grant_admin_module,
          grant_licensing_module,
          admin_access_level,
          licensing_access_level,
          created_at,
          expires_at,
          invited_by:user_profiles!invitations_invited_by_user_id_fkey (
            email
          )
        `)
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (invitesError) throw invitesError;

      const invitationList: PendingInvitation[] = (invites || []).map((inv: any) => ({
        id: inv.id,
        invited_email: inv.invited_email,
        org_role: inv.org_role,
        grant_admin_module: inv.grant_admin_module,
        grant_licensing_module: inv.grant_licensing_module,
        admin_access_level: inv.admin_access_level,
        licensing_access_level: inv.licensing_access_level,
        created_at: inv.created_at,
        expires_at: inv.expires_at,
        invited_by_email: inv.invited_by?.email || "Unknown",
      }));

      setInvitations(invitationList);
    } catch (err: any) {
      console.error("Error fetching organization members:", err);
      setError(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    members,
    invitations,
    loading,
    error,
    refetch: fetchData,
  };
}
