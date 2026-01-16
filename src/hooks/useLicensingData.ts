import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type LicensingRequest = Database["public"]["Tables"]["licensing_requests"]["Row"];
type LicensingAgreement = Database["public"]["Tables"]["licensing_agreements"]["Row"];

/**
 * LICENSING MODULE DATA HOOKS
 * 
 * All queries are tenant-isolated using activeTenant.tenant_id.
 * Never query without tenant_id scope.
 */

export function useLicensingRequests() {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["licensing-requests", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("licensing_requests")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LicensingRequest[];
    },
    enabled: !!tenantId,
  });
}

export function useLicensingRequest(requestId: string | undefined) {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["licensing-request", tenantId, requestId],
    queryFn: async () => {
      if (!tenantId || !requestId) return null;

      const { data, error } = await supabase
        .from("licensing_requests")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("id", requestId)
        .single();

      if (error) throw error;
      return data as LicensingRequest;
    },
    enabled: !!tenantId && !!requestId,
  });
}

export function useLicensingAgreements() {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["licensing-agreements", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("licensing_agreements")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LicensingAgreement[];
    },
    enabled: !!tenantId,
  });
}

export function useLicensingAgreement(agreementId: string | undefined) {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["licensing-agreement", tenantId, agreementId],
    queryFn: async () => {
      if (!tenantId || !agreementId) return null;

      const { data, error } = await supabase
        .from("licensing_agreements")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("id", agreementId)
        .single();

      if (error) throw error;
      return data as LicensingAgreement;
    },
    enabled: !!tenantId && !!agreementId,
  });
}
