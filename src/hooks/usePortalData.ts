import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type PortalDocument = Database["public"]["Tables"]["portal_documents"]["Row"];
type PortalStatement = Database["public"]["Tables"]["portal_statements"]["Row"];
type PortalAgreement = Database["public"]["Tables"]["portal_agreements"]["Row"];

/**
 * CLIENT PORTAL MODULE DATA HOOKS
 * 
 * All queries are tenant-isolated using activeTenant.tenant_id.
 * Never query without tenant_id scope.
 */

export function usePortalDocuments() {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["portal-documents", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("portal_documents")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PortalDocument[];
    },
    enabled: !!tenantId,
  });
}

export function usePortalDocument(documentId: string | undefined) {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["portal-document", tenantId, documentId],
    queryFn: async () => {
      if (!tenantId || !documentId) return null;

      const { data, error } = await supabase
        .from("portal_documents")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("id", documentId)
        .single();

      if (error) throw error;
      return data as PortalDocument;
    },
    enabled: !!tenantId && !!documentId,
  });
}

export function usePortalStatements() {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["portal-statements", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("portal_statements")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PortalStatement[];
    },
    enabled: !!tenantId,
  });
}

export function usePortalStatement(statementId: string | undefined) {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["portal-statement", tenantId, statementId],
    queryFn: async () => {
      if (!tenantId || !statementId) return null;

      const { data, error } = await supabase
        .from("portal_statements")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("id", statementId)
        .single();

      if (error) throw error;
      return data as PortalStatement;
    },
    enabled: !!tenantId && !!statementId,
  });
}

export function usePortalAgreements() {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["portal-agreements", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("portal_agreements")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PortalAgreement[];
    },
    enabled: !!tenantId,
  });
}

export function usePortalAgreement(agreementId: string | undefined) {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["portal-agreement", tenantId, agreementId],
    queryFn: async () => {
      if (!tenantId || !agreementId) return null;

      const { data, error } = await supabase
        .from("portal_agreements")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("id", agreementId)
        .single();

      if (error) throw error;
      return data as PortalAgreement;
    },
    enabled: !!tenantId && !!agreementId,
  });
}
