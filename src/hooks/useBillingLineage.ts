/**
 * BILLING LINEAGE HOOKS
 * 
 * Provides access to the contract → invoice → payment lineage
 * with proper scope enforcement.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Contract {
  id: string;
  tenant_id: string;
  contract_number: string;
  title: string;
  description: string | null;
  version: number;
  version_hash: string;
  parent_contract_id: string | null;
  status: "draft" | "active" | "amended" | "terminated" | "expired";
  effective_date: string | null;
  expiration_date: string | null;
  terminated_at: string | null;
  document_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  correlation_id: string | null;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  contract_id: string;
  contract_version_hash: string;
  invoice_number: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string | null;
  paid_at: string | null;
  voided_at: string | null;
  description: string | null;
  notes: string | null;
  provider_invoice_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  correlation_id: string | null;
  // Joined fields
  contract?: Contract;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_amount: number;
  amount: number;
  license_id: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "succeeded" | "failed" | "cancelled" | "refunded" | "partially_refunded";
  payment_method_type: string | null;
  payment_method_last4: string | null;
  provider_payment_id: string | null;
  provider_charge_id: string | null;
  processed_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
  correlation_id: string | null;
  // Joined fields
  invoice?: Invoice;
}

export interface Refund {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  reason: "duplicate" | "fraudulent" | "requested_by_customer" | "service_not_provided" | "other";
  reason_description: string | null;
  status: "pending" | "processing" | "succeeded" | "failed" | "cancelled" | "refunded" | "partially_refunded";
  provider_refund_id: string | null;
  issued_by: string;
  issued_at: string;
  created_at: string;
  correlation_id: string | null;
}

export interface PaymentLineage {
  payment_id: string;
  payment_amount: number;
  payment_status: string;
  invoice_id: string;
  invoice_number: string;
  invoice_amount: number;
  contract_id: string;
  contract_number: string;
  contract_version: number;
  contract_version_hash: string;
  organization_id: string;
  organization_name: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch contracts for the active tenant
 */
export function useContracts() {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["contracts", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Contract[];
    },
    enabled: !!tenantId,
  });
}

/**
 * Fetch a single contract by ID
 */
export function useContract(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => {
      if (!contractId) return null;

      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (error) throw error;
      return data as Contract;
    },
    enabled: !!contractId,
  });
}

/**
 * Fetch invoices for the active tenant with contract lineage
 */
export function useInvoices() {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["invoices", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          contract:contracts(*)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!tenantId,
  });
}

/**
 * Fetch a single invoice with full lineage
 */
export function useInvoice(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          contract:contracts(*)
        `)
        .eq("id", invoiceId)
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!invoiceId,
  });
}

/**
 * Fetch invoices linked to a specific contract
 */
export function useContractInvoices(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-invoices", contractId],
    queryFn: async () => {
      if (!contractId) return [];

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("contract_id", contractId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!contractId,
  });
}

/**
 * Fetch payments for the active tenant with invoice lineage
 */
export function usePayments() {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  return useQuery({
    queryKey: ["payments", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          invoice:invoices(
            *,
            contract:contracts(*)
          )
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!tenantId,
  });
}

/**
 * Fetch payments for a specific invoice
 */
export function useInvoicePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["invoice-payments", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!invoiceId,
  });
}

/**
 * Fetch full payment lineage (Platform/Tenant Admin only)
 */
export function usePaymentLineage(paymentId: string | undefined) {
  return useQuery({
    queryKey: ["payment-lineage", paymentId],
    queryFn: async () => {
      if (!paymentId) return null;

      const { data, error } = await supabase
        .rpc("get_payment_lineage", { p_payment_id: paymentId });

      if (error) throw error;
      return data?.[0] as PaymentLineage | undefined;
    },
    enabled: !!paymentId,
  });
}

/**
 * Fetch all contracts (Platform Admin only)
 */
export function useAllContracts() {
  return useQuery({
    queryKey: ["all-contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          tenant:tenants(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Fetch all invoices (Platform Admin only)
 */
export function useAllInvoices() {
  return useQuery({
    queryKey: ["all-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          tenant:tenants(id, name),
          contract:contracts(id, contract_number, title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Fetch all refunds (Platform Admin only)
 */
export function useAllRefunds() {
  return useQuery({
    queryKey: ["all-refunds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refunds")
        .select(`
          *,
          payment:payments(
            id,
            amount,
            invoice:invoices(
              id,
              invoice_number,
              contract:contracts(id, contract_number)
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
