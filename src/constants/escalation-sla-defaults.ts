/**
 * ESCALATION SLA DEFAULTS — CANONICAL BASELINE (LOCKED)
 * 
 * These SLAs are not aggressive and not casual.
 * They communicate seriousness, predictability, and accountability.
 * 
 * RULES:
 * - SLAs are role-based, not user-based
 * - Escalation never skips authority layers
 * - Escalations create immutable audit events
 * - Mobile and desktop behavior identical
 * 
 * Only Platform Executives may modify these rules.
 */

import type { Database } from "@/integrations/supabase/types";

type NotificationType = Database["public"]["Enums"]["notification_type"];
type NotificationPriority = Database["public"]["Enums"]["notification_priority"];
type PlatformRole = Database["public"]["Enums"]["platform_role"];

// ═══════════════════════════════════════════════════════════════════════════
// SLA CONFIGURATION TYPE
// ═══════════════════════════════════════════════════════════════════════════

export interface EscalationSLAConfig {
  notification_type: NotificationType;
  priority: NotificationPriority;
  initial_notification_minutes: number;
  escalation_minutes: number;
  executive_escalation_minutes: number | null;
  escalation_target_role: PlatformRole;
  requires_manual_escalation: boolean;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHORITY & GOVERNANCE SLAs
// ═══════════════════════════════════════════════════════════════════════════

export const AUTHORITY_GOVERNANCE_SLAS: EscalationSLAConfig[] = [
  {
    notification_type: "authority_change_proposal",
    priority: "high",
    initial_notification_minutes: 0, // Immediate
    escalation_minutes: 24 * 60, // 24 hours
    executive_escalation_minutes: 48 * 60, // 48 hours
    escalation_target_role: "platform_admin",
    requires_manual_escalation: false,
    description: "Authority change proposals require timely review to maintain governance integrity.",
  },
  {
    notification_type: "membership_change",
    priority: "high",
    initial_notification_minutes: 0, // Immediate
    escalation_minutes: null as unknown as number, // No auto-escalation
    executive_escalation_minutes: 0, // Immediate executive visibility
    escalation_target_role: "platform_admin",
    requires_manual_escalation: true,
    description: "Role revocation and suspension events require immediate executive visibility.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// LICENSING OPERATIONS SLAs
// ═══════════════════════════════════════════════════════════════════════════

export const LICENSING_OPERATIONS_SLAS: EscalationSLAConfig[] = [
  {
    notification_type: "licensing_request",
    priority: "normal",
    initial_notification_minutes: 0, // Immediate
    escalation_minutes: 48 * 60, // 48 hours to senior admin
    executive_escalation_minutes: 72 * 60, // 72 hours
    escalation_target_role: "platform_admin",
    requires_manual_escalation: false,
    description: "New licensing requests require timely acknowledgment and review.",
  },
  {
    notification_type: "approval_timeout",
    priority: "high",
    initial_notification_minutes: 24 * 60, // 24 hour reminder
    escalation_minutes: 72 * 60, // 72 hours
    executive_escalation_minutes: null,
    escalation_target_role: "platform_admin",
    requires_manual_escalation: false,
    description: "Pending license approvals require follow-up to prevent delays.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// BILLING & PAYMENTS SLAs
// ═══════════════════════════════════════════════════════════════════════════

export const BILLING_PAYMENTS_SLAS: EscalationSLAConfig[] = [
  {
    notification_type: "payment_failure",
    priority: "critical",
    initial_notification_minutes: 0, // Immediate to Org Admin
    escalation_minutes: 24 * 60, // 24 hour reminder
    executive_escalation_minutes: 72 * 60, // 72 hours
    escalation_target_role: "platform_admin",
    requires_manual_escalation: false,
    description: "Payment failures require prompt attention to maintain account standing.",
  },
  {
    notification_type: "refund_initiated",
    priority: "high",
    initial_notification_minutes: 0, // Immediate executive notification
    escalation_minutes: null as unknown as number, // No auto-escalation
    executive_escalation_minutes: 0, // Immediate
    escalation_target_role: "platform_admin",
    requires_manual_escalation: true,
    description: "Refunds require executive awareness and manual governance.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY & SYSTEM SLAs
// ═══════════════════════════════════════════════════════════════════════════

export const SECURITY_SYSTEM_SLAS: EscalationSLAConfig[] = [
  {
    notification_type: "security_event",
    priority: "critical",
    initial_notification_minutes: 0, // Immediate
    escalation_minutes: 0, // Immediate — no delay, no batching
    executive_escalation_minutes: 0, // Immediate
    escalation_target_role: "platform_admin",
    requires_manual_escalation: false,
    description: "Security events require immediate executive and security visibility.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// OPERATIONAL SLAs
// ═══════════════════════════════════════════════════════════════════════════

export const OPERATIONAL_SLAS: EscalationSLAConfig[] = [
  {
    notification_type: "export_completed",
    priority: "normal",
    initial_notification_minutes: 0, // Immediate
    escalation_minutes: null as unknown as number, // No escalation needed
    executive_escalation_minutes: null,
    escalation_target_role: "platform_admin",
    requires_manual_escalation: true,
    description: "Export completion notifications are informational only.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED DEFAULT SLAs
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_ESCALATION_SLAS: EscalationSLAConfig[] = [
  ...AUTHORITY_GOVERNANCE_SLAS,
  ...LICENSING_OPERATIONS_SLAS,
  ...BILLING_PAYMENTS_SLAS,
  ...SECURITY_SYSTEM_SLAS,
  ...OPERATIONAL_SLAS,
];

// ═══════════════════════════════════════════════════════════════════════════
// SLA HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getSLAForNotificationType(
  type: NotificationType,
  priority: NotificationPriority
): EscalationSLAConfig | undefined {
  return DEFAULT_ESCALATION_SLAS.find(
    (sla) => sla.notification_type === type && sla.priority === priority
  );
}

export function formatSLADuration(minutes: number | null): string {
  if (minutes === null || minutes === 0) return "Immediate";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function getSLACategory(type: NotificationType): string {
  const authorityTypes: NotificationType[] = ["authority_change_proposal", "membership_change"];
  const licensingTypes: NotificationType[] = ["licensing_request", "approval_timeout"];
  const billingTypes: NotificationType[] = ["payment_failure", "refund_initiated"];
  const securityTypes: NotificationType[] = ["security_event"];
  
  if (authorityTypes.includes(type)) return "Authority & Governance";
  if (licensingTypes.includes(type)) return "Licensing Operations";
  if (billingTypes.includes(type)) return "Billing & Payments";
  if (securityTypes.includes(type)) return "Security & System";
  return "Operational";
}
