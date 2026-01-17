/**
 * NOTIFICATION LANGUAGE CONSTANTS — CANONICAL TONE (LOCKED)
 * 
 * The goal is calm authority, not urgency theater.
 * 
 * TONE PRINCIPLES:
 * - Neutral
 * - Precise
 * - Non-marketing
 * - Non-emotional
 * - No exclamation points
 * - No urgency language unless warranted
 * 
 * PROHIBITED LANGUAGE:
 * - "Urgent"
 * - "ASAP"
 * - "Don't forget"
 * - Emojis
 * - Marketing copy
 * - Friendly nudges
 * 
 * No feature may introduce custom notification copy outside this standard.
 */

import type { Database } from "@/integrations/supabase/types";

type NotificationType = Database["public"]["Enums"]["notification_type"];

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION TEMPLATE TYPE
// ═══════════════════════════════════════════════════════════════════════════

export interface NotificationTemplate {
  type: NotificationType;
  category: "informational" | "action_required" | "escalation" | "executive" | "financial" | "authority";
  title: string;
  message: string;
  escalation_title?: string;
  escalation_message?: string;
  executive_title?: string;
  executive_message?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// INFORMATIONAL NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const INFORMATIONAL_TEMPLATES: NotificationTemplate[] = [
  {
    type: "licensing_request",
    category: "informational",
    title: "Licensing request submitted",
    message: "A licensing request has been submitted and is awaiting review.",
    escalation_title: "Licensing request pending review",
    escalation_message: "This item has not been addressed within the expected review window and has been escalated.",
    executive_title: "Licensing request escalated",
    executive_message: "This event has been escalated for executive awareness.",
  },
  {
    type: "export_completed",
    category: "informational",
    title: "Export completed",
    message: "The requested export has been generated and is available for download.",
  },
  {
    type: "membership_change",
    category: "informational",
    title: "Membership status changed",
    message: "A membership status change has been recorded.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ACTION REQUIRED NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const ACTION_REQUIRED_TEMPLATES: NotificationTemplate[] = [
  {
    type: "licensing_request",
    category: "action_required",
    title: "Licensing request requires review",
    message: "A licensing request requires your review.",
    escalation_title: "Licensing request overdue",
    escalation_message: "This item has not been addressed within the expected review window and has been escalated.",
  },
  {
    type: "approval_timeout",
    category: "action_required",
    title: "Approval pending",
    message: "An approval request is awaiting your action.",
    escalation_title: "Approval overdue",
    escalation_message: "This item has not been addressed within the expected review window and has been escalated.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATION NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const ESCALATION_TEMPLATES: NotificationTemplate[] = [
  {
    type: "approval_timeout",
    category: "escalation",
    title: "Item escalated",
    message: "This item has not been addressed within the expected review window and has been escalated.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTIVE VISIBILITY NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const EXECUTIVE_TEMPLATES: NotificationTemplate[] = [
  {
    type: "security_event",
    category: "executive",
    title: "Security event detected",
    message: "A security-relevant event has been detected and requires attention.",
  },
  {
    type: "refund_initiated",
    category: "executive",
    title: "Refund initiated",
    message: "This event has been escalated for executive awareness.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const FINANCIAL_TEMPLATES: NotificationTemplate[] = [
  {
    type: "payment_failure",
    category: "financial",
    title: "Payment unsuccessful",
    message: "An invoice payment attempt was unsuccessful.",
    escalation_title: "Payment failure unresolved",
    escalation_message: "This payment failure has not been resolved and has been escalated.",
    executive_title: "Payment failure escalated",
    executive_message: "This event has been escalated for executive awareness.",
  },
  {
    type: "refund_initiated",
    category: "financial",
    title: "Refund initiated",
    message: "A refund has been initiated and is being processed.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// AUTHORITY NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const AUTHORITY_TEMPLATES: NotificationTemplate[] = [
  {
    type: "authority_change_proposal",
    category: "authority",
    title: "Authority change proposed",
    message: "A change to user authority has been proposed and requires approval.",
    escalation_title: "Authority change pending",
    escalation_message: "This authority change has not been addressed within the expected review window and has been escalated.",
    executive_title: "Authority change escalated",
    executive_message: "This event has been escalated for executive awareness.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

export const ALL_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  ...INFORMATIONAL_TEMPLATES,
  ...ACTION_REQUIRED_TEMPLATES,
  ...ESCALATION_TEMPLATES,
  ...EXECUTIVE_TEMPLATES,
  ...FINANCIAL_TEMPLATES,
  ...AUTHORITY_TEMPLATES,
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getNotificationTemplate(
  type: NotificationType,
  category: NotificationTemplate["category"]
): NotificationTemplate | undefined {
  return ALL_NOTIFICATION_TEMPLATES.find(
    (template) => template.type === type && template.category === category
  );
}

export function getEscalationMessage(type: NotificationType): string {
  const template = ALL_NOTIFICATION_TEMPLATES.find(
    (t) => t.type === type && t.escalation_message
  );
  return template?.escalation_message || 
    "This item has not been addressed within the expected review window and has been escalated.";
}

export function getExecutiveMessage(type: NotificationType): string {
  const template = ALL_NOTIFICATION_TEMPLATES.find(
    (t) => t.type === type && t.executive_message
  );
  return template?.executive_message || 
    "This event has been escalated for executive awareness.";
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION CATEGORY LABELS
// ═══════════════════════════════════════════════════════════════════════════

export const NOTIFICATION_CATEGORY_LABELS = {
  informational: "Informational",
  action_required: "Action required",
  escalation: "Escalation",
  executive: "Executive visibility",
  financial: "Financial",
  authority: "Authority",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// PROHIBITED LANGUAGE — ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════

export const PROHIBITED_NOTIFICATION_TERMS = [
  "urgent",
  "asap",
  "don't forget",
  "reminder:",
  "action needed!",
  "important!",
  "time-sensitive",
  "hurry",
  "quickly",
  "immediately",
  "right away",
  "critical!",
  "warning!",
  "alert!",
] as const;

/**
 * Validates notification text against prohibited terms.
 * Use this in development/testing to enforce language standards.
 */
export function validateNotificationLanguage(text: string): boolean {
  const lowerText = text.toLowerCase();
  return !PROHIBITED_NOTIFICATION_TERMS.some((term) => lowerText.includes(term));
}
