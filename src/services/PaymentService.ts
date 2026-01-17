/**
 * PAYMENT SERVICE — PROCESSOR-AGNOSTIC ABSTRACTION LAYER
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER ENFORCEMENT DIRECTIVE — LOCKED ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Core Principle:
 * Swapping payment providers must NOT require UI or authority changes.
 * 
 * This service abstracts all payment provider interactions behind a 
 * unified interface. The UI and authority layers interact only with
 * this service, never with provider-specific APIs directly.
 * 
 * PROVIDER RULES:
 * - Must never define authority (authority comes from useBillingAuthority)
 * - Must never appear in user navigation
 * - Must inherit all governance rules automatically
 * - Configuration is System Console only
 * 
 * SUPPORTED PROVIDERS (pluggable):
 * - Stripe (default)
 * - Future: Square, Adyen, etc.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS — PROVIDER-AGNOSTIC
// ═══════════════════════════════════════════════════════════════════════════

export type PaymentProvider = "stripe" | "square" | "adyen" | "none";

export type PaymentStatus = 
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "void"
  | "uncollectible";

export interface PaymentMethod {
  id: string;
  type: "card" | "bank_account" | "other";
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  dueDate: string | null;
  paidAt: string | null;
  description: string;
  lineItems: InvoiceLineItem[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId: string;
  description: string;
  tenantId: string;
  createdAt: string;
  refundedAmount?: number;
  refundedAt?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: "month" | "year" | "one_time";
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT SERVICE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface PaymentServiceConfig {
  provider: PaymentProvider;
  environment: "test" | "live";
  webhookSecret?: string;
}

export interface PaymentServiceInterface {
  // Configuration (System Console only)
  getConfig(): PaymentServiceConfig;
  getActiveProvider(): PaymentProvider;
  
  // Payment Methods (Organization scope)
  listPaymentMethods(tenantId: string): Promise<PaymentMethod[]>;
  addPaymentMethod(tenantId: string, token: string): Promise<PaymentMethod>;
  removePaymentMethod(tenantId: string, methodId: string): Promise<void>;
  setDefaultPaymentMethod(tenantId: string, methodId: string): Promise<void>;
  
  // Invoices
  listInvoices(tenantId: string): Promise<Invoice[]>;
  getInvoice(invoiceId: string): Promise<Invoice>;
  payInvoice(invoiceId: string, paymentMethodId: string): Promise<Payment>;
  downloadInvoice(invoiceId: string): Promise<Blob>;
  
  // Payments
  listPayments(tenantId: string): Promise<Payment[]>;
  getPayment(paymentId: string): Promise<Payment>;
  
  // Revenue (System Console only)
  getRevenueMetrics(periodStart: string, periodEnd: string): Promise<RevenueMetrics>;
  getAllInvoices(filters?: InvoiceFilters): Promise<Invoice[]>;
  
  // Refunds (System Console only)
  issueRefund(paymentId: string, amount: number, reason: string): Promise<Payment>;
  
  // Pricing (System Console only)
  listPlans(): Promise<PricingPlan[]>;
  createPlan(plan: Omit<PricingPlan, "id" | "createdAt" | "updatedAt">): Promise<PricingPlan>;
  updatePlan(planId: string, updates: Partial<PricingPlan>): Promise<PricingPlan>;
  deactivatePlan(planId: string): Promise<void>;
}

export interface InvoiceFilters {
  tenantId?: string;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK PAYMENT SERVICE (Development/No Provider)
// ═══════════════════════════════════════════════════════════════════════════

class MockPaymentService implements PaymentServiceInterface {
  private config: PaymentServiceConfig = {
    provider: "none",
    environment: "test",
  };

  getConfig(): PaymentServiceConfig {
    return this.config;
  }

  getActiveProvider(): PaymentProvider {
    return this.config.provider;
  }

  async listPaymentMethods(_tenantId: string): Promise<PaymentMethod[]> {
    return [];
  }

  async addPaymentMethod(_tenantId: string, _token: string): Promise<PaymentMethod> {
    throw new Error("No payment provider configured");
  }

  async removePaymentMethod(_tenantId: string, _methodId: string): Promise<void> {
    throw new Error("No payment provider configured");
  }

  async setDefaultPaymentMethod(_tenantId: string, _methodId: string): Promise<void> {
    throw new Error("No payment provider configured");
  }

  async listInvoices(_tenantId: string): Promise<Invoice[]> {
    return [];
  }

  async getInvoice(_invoiceId: string): Promise<Invoice> {
    throw new Error("Invoice not found");
  }

  async payInvoice(_invoiceId: string, _paymentMethodId: string): Promise<Payment> {
    throw new Error("No payment provider configured");
  }

  async downloadInvoice(_invoiceId: string): Promise<Blob> {
    throw new Error("No payment provider configured");
  }

  async listPayments(_tenantId: string): Promise<Payment[]> {
    return [];
  }

  async getPayment(_paymentId: string): Promise<Payment> {
    throw new Error("Payment not found");
  }

  async getRevenueMetrics(periodStart: string, periodEnd: string): Promise<RevenueMetrics> {
    return {
      totalRevenue: 0,
      monthlyRecurringRevenue: 0,
      activeSubscriptions: 0,
      churnRate: 0,
      averageRevenuePerUser: 0,
      currency: "USD",
      periodStart,
      periodEnd,
    };
  }

  async getAllInvoices(_filters?: InvoiceFilters): Promise<Invoice[]> {
    return [];
  }

  async issueRefund(_paymentId: string, _amount: number, _reason: string): Promise<Payment> {
    throw new Error("No payment provider configured");
  }

  async listPlans(): Promise<PricingPlan[]> {
    return [];
  }

  async createPlan(_plan: Omit<PricingPlan, "id" | "createdAt" | "updatedAt">): Promise<PricingPlan> {
    throw new Error("No payment provider configured");
  }

  async updatePlan(_planId: string, _updates: Partial<PricingPlan>): Promise<PricingPlan> {
    throw new Error("No payment provider configured");
  }

  async deactivatePlan(_planId: string): Promise<void> {
    throw new Error("No payment provider configured");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE FACTORY
// ═══════════════════════════════════════════════════════════════════════════

let paymentServiceInstance: PaymentServiceInterface | null = null;

/**
 * Get the payment service instance.
 * Returns a mock service if no provider is configured.
 * 
 * Usage:
 * ```tsx
 * const paymentService = getPaymentService();
 * const invoices = await paymentService.listInvoices(tenantId);
 * ```
 */
export function getPaymentService(): PaymentServiceInterface {
  if (!paymentServiceInstance) {
    // Default to mock service — real providers are configured via System Console
    paymentServiceInstance = new MockPaymentService();
  }
  return paymentServiceInstance;
}

/**
 * Configure the payment service with a specific provider.
 * This should only be called from System Console configuration.
 * 
 * @param service - The configured payment service implementation
 */
export function configurePaymentService(service: PaymentServiceInterface): void {
  paymentServiceInstance = service;
}

/**
 * Reset the payment service (for testing or provider changes)
 */
export function resetPaymentService(): void {
  paymentServiceInstance = null;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOGGING WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrap payment actions with audit logging.
 * All financial actions must be logged immutably.
 */
export async function withAuditLog<T>(
  action: string,
  details: Record<string, unknown>,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    
    // TODO: Log to audit_logs table via Supabase
    console.log("[AUDIT] Payment action completed", {
      action,
      details,
      duration: Date.now() - startTime,
      status: "success",
      timestamp: new Date().toISOString(),
    });
    
    return result;
  } catch (error) {
    // Log failed attempts too
    console.error("[AUDIT] Payment action failed", {
      action,
      details,
      duration: Date.now() - startTime,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    
    throw error;
  }
}
