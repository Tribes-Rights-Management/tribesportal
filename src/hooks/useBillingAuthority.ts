import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";

/**
 * BILLING AUTHORITY HOOK — INSTITUTIONAL FINANCIAL GOVERNANCE
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER ENFORCEMENT DIRECTIVE — LOCKED ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Core Principle:
 * - Billing authority is separate from operational authority
 * - No user may configure billing AND submit payments at the same scope
 * - All billing actions generate immutable audit events
 * 
 * System Console governs money. It never moves money.
 * 
 * AUTHORITY MATRIX (FROM SCREENSHOTS):
 * 
 * | Action                    | Platform Exec | Tribes Admin | Org Admin | Member |
 * |---------------------------|---------------|--------------|-----------|--------|
 * | Configure pricing         | ✅            | ❌           | ❌        | ❌     |
 * | Connect payment provider  | ✅            | ❌           | ❌        | ❌     |
 * | View platform revenue     | ✅            | ❌           | ❌        | ❌     |
 * | View org invoices         | 🔒 (all orgs) | 🔒 (own org) | ✅        | ✅     |
 * | Pay invoice               | ❌            | ❌           | ✅        | ✅     |
 * | Update payment method     | ❌            | ❌           | ✅        | ❌     |
 * | Issue refunds             | ✅            | ❌           | ❌        | ❌     |
 * | Export financial records  | ✅            | ❌           | ❌        | ❌     |
 * 
 * 🔒 = visible only within allowed scope
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// BILLING PERMISSION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type BillingPermission =
  // System Console (Platform Scope) — Governance Only
  | "billing:configure_pricing"
  | "billing:connect_provider"
  | "billing:view_revenue"
  | "billing:view_all_invoices"
  | "billing:issue_refunds"
  | "billing:export_financial"
  
  // Organization Workspace (Org Scope) — Operations
  | "billing:view_invoices"
  | "billing:pay_invoices"
  | "billing:manage_payment_methods"
  | "billing:view_history"
  | "billing:download_receipts";

export type BillingScope = "system" | "organization";

export interface BillingAuthorityResult {
  // Scope identification
  currentScope: BillingScope | null;
  
  // Permission checks
  hasPermission: (permission: BillingPermission) => boolean;
  hasAnyPermission: (permissions: BillingPermission[]) => boolean;
  
  // System Console (Governance) permissions
  canConfigurePricing: boolean;
  canConnectProvider: boolean;
  canViewRevenue: boolean;
  canViewAllInvoices: boolean;
  canIssueRefunds: boolean;
  canExportFinancial: boolean;
  
  // Organization (Operations) permissions
  canViewOrgInvoices: boolean;
  canPayInvoices: boolean;
  canManagePaymentMethods: boolean;
  canViewHistory: boolean;
  canDownloadReceipts: boolean;
  
  // Scope access
  canAccessSystemBilling: boolean;
  canAccessOrgBilling: boolean;
  
  // Read-only mode
  isReadOnlyMode: boolean;
}

/**
 * useBillingAuthority
 * 
 * Resolves billing permissions based on user role and current scope.
 * Enforces the canonical billing hierarchy from the governance spec.
 * 
 * Usage:
 * ```tsx
 * const { canPayInvoices, canConfigurePricing } = useBillingAuthority();
 * 
 * // In System Console:
 * {canConfigurePricing && <PricingConfiguration />}
 * 
 * // In Organization workspace:
 * {canPayInvoices && <PayInvoiceButton />}
 * ```
 */
export function useBillingAuthority(): BillingAuthorityResult {
  const { profile, activeTenant, isPlatformAdmin } = useAuth();
  const { isTenantAdmin, isMember, isExternalAuditor, isViewer } = useRoleAccess();

  return useMemo(() => {
    // Determine current scope based on active tenant
    const currentScope: BillingScope | null = activeTenant ? "organization" : 
      isPlatformAdmin ? "system" : null;

    // Role-based permission resolution
    const isPlatformExec = isPlatformAdmin;
    const isOrgAdmin = isTenantAdmin;
    const isOrgMember = isMember || isViewer;
    const isReadOnlyMode = isExternalAuditor;

    // ─────────────────────────────────────────────────────────────────────────
    // SYSTEM CONSOLE PERMISSIONS (Platform Scope — Governance Only)
    // These actions GOVERN money but never MOVE money
    // ─────────────────────────────────────────────────────────────────────────
    const canConfigurePricing = isPlatformExec;
    const canConnectProvider = isPlatformExec;
    const canViewRevenue = isPlatformExec;
    const canViewAllInvoices = isPlatformExec; // Read-only, scoped visibility
    const canIssueRefunds = isPlatformExec;
    const canExportFinancial = isPlatformExec;

    // ─────────────────────────────────────────────────────────────────────────
    // ORGANIZATION PERMISSIONS (Org Scope — Operations)
    // These actions MOVE money within org boundary
    // ─────────────────────────────────────────────────────────────────────────
    const canViewOrgInvoices = isOrgAdmin || isOrgMember;
    const canPayInvoices = isOrgAdmin || isOrgMember;
    const canManagePaymentMethods = isOrgAdmin; // Only admins can update payment methods
    const canViewHistory = isOrgAdmin || isOrgMember;
    const canDownloadReceipts = isOrgAdmin || isOrgMember;

    // Scope access
    const canAccessSystemBilling = isPlatformExec;
    const canAccessOrgBilling = isOrgAdmin || isOrgMember;

    // Permission check function
    const hasPermission = (permission: BillingPermission): boolean => {
      switch (permission) {
        // System Console permissions
        case "billing:configure_pricing": return canConfigurePricing;
        case "billing:connect_provider": return canConnectProvider;
        case "billing:view_revenue": return canViewRevenue;
        case "billing:view_all_invoices": return canViewAllInvoices;
        case "billing:issue_refunds": return canIssueRefunds;
        case "billing:export_financial": return canExportFinancial;
        
        // Organization permissions
        case "billing:view_invoices": return canViewOrgInvoices;
        case "billing:pay_invoices": return canPayInvoices;
        case "billing:manage_payment_methods": return canManagePaymentMethods;
        case "billing:view_history": return canViewHistory;
        case "billing:download_receipts": return canDownloadReceipts;
        
        default: return false; // DEFAULT DENY
      }
    };

    const hasAnyPermission = (permissions: BillingPermission[]): boolean => {
      return permissions.some(hasPermission);
    };

    return {
      currentScope,
      hasPermission,
      hasAnyPermission,
      
      // System Console
      canConfigurePricing,
      canConnectProvider,
      canViewRevenue,
      canViewAllInvoices,
      canIssueRefunds,
      canExportFinancial,
      
      // Organization
      canViewOrgInvoices,
      canPayInvoices,
      canManagePaymentMethods,
      canViewHistory,
      canDownloadReceipts,
      
      // Scope access
      canAccessSystemBilling,
      canAccessOrgBilling,
      
      // Read-only mode
      isReadOnlyMode,
    };
  }, [profile, activeTenant, isPlatformAdmin, isTenantAdmin, isMember, isExternalAuditor, isViewer]);
}

/**
 * BILLING NAVIGATION REGISTRY
 * 
 * System Console Billing (governance):
 * - /admin/billing — Overview
 * - /admin/billing/plans — Plans & Pricing
 * - /admin/billing/revenue — Revenue Overview
 * - /admin/billing/invoices — All Invoices (read-only)
 * - /admin/billing/providers — Payment Providers
 * 
 * Organization Billing (operations):
 * - /portal/payments — Portal Payments Overview
 * - /portal/payments/invoices — Org Invoices
 * - /portal/payments/methods — Payment Methods
 * - /portal/payments/history — Payment History
 * 
 * - /licensing/payments — Licensing Payments Overview
 * - /licensing/payments/fees — License Fees
 * - /licensing/payments/receipts — Receipts
 */
export const BILLING_ROUTES = {
  // System Console (Governance)
  system: {
    root: "/admin/billing",
    plans: "/admin/billing/plans",
    revenue: "/admin/billing/revenue",
    invoices: "/admin/billing/invoices",
    providers: "/admin/billing/providers",
  },
  
  // Portal (Organization Operations)
  portal: {
    root: "/portal/payments",
    invoices: "/portal/payments/invoices",
    methods: "/portal/payments/methods",
    history: "/portal/payments/history",
  },
  
  // Licensing (Organization Operations)
  licensing: {
    root: "/licensing/payments",
    fees: "/licensing/payments/fees",
    receipts: "/licensing/payments/receipts",
  },
} as const;
