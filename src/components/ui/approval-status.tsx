import { cn } from "@/lib/utils";
import { APPROVAL_LABELS } from "@/styles/tokens";

/**
 * APPROVAL STATUS DISPLAY — DELIBERATE STATE CHANGES
 * 
 * Rules:
 * - Sensitive actions require explicit approval workflows
 * - Pending states must be clearly labeled
 * - Approvals require named actors
 * - Treat approvals as governance events
 */

export type ApprovalState = "pending" | "approved" | "rejected" | "withdrawn" | "expired";

interface ApprovalStatusProps {
  state: ApprovalState;
  className?: string;
}

/**
 * Approval state indicator - clear, unambiguous
 */
export function ApprovalStatus({ state, className }: ApprovalStatusProps) {
  const labels: Record<ApprovalState, string> = {
    pending: APPROVAL_LABELS.PENDING_APPROVAL,
    approved: APPROVAL_LABELS.APPROVED,
    rejected: APPROVAL_LABELS.REJECTED,
    withdrawn: APPROVAL_LABELS.WITHDRAWN,
    expired: APPROVAL_LABELS.EXPIRED,
  };
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.02em] rounded",
        state === "pending" && "bg-[var(--warning-bg)] text-[var(--warning-text)]",
        state === "approved" && "bg-[var(--success-bg)] text-[var(--success-text)]",
        state === "rejected" && "bg-[var(--error-bg)] text-[var(--error-text)]",
        state === "withdrawn" && "bg-muted text-muted-foreground",
        state === "expired" && "bg-muted text-muted-foreground",
        className
      )}
    >
      {labels[state]}
    </span>
  );
}

/**
 * APPROVAL METADATA — Who approved/rejected and when
 */
interface ApprovalMetadataProps {
  state: ApprovalState;
  submittedBy?: string;
  submittedAt?: string;
  processedBy?: string;
  processedAt?: string;
  reason?: string;
  className?: string;
}

export function ApprovalMetadata({
  state,
  submittedBy,
  submittedAt,
  processedBy,
  processedAt,
  reason,
  className,
}: ApprovalMetadataProps) {
  return (
    <div className={cn("text-[12px] text-muted-foreground space-y-1", className)}>
      {/* Submitted info */}
      {submittedBy && (
        <div className="flex items-baseline gap-2">
          <span className="text-muted-foreground">{APPROVAL_LABELS.SUBMITTED_BY}</span>
          <span>{submittedBy}</span>
          {submittedAt && <span className="text-muted-foreground">· {submittedAt}</span>}
        </div>
      )}
      
      {/* Processed info */}
      {processedBy && state === "approved" && (
        <div className="flex items-baseline gap-2">
          <span className="text-muted-foreground">{APPROVAL_LABELS.APPROVED_BY}</span>
          <span>{processedBy}</span>
          {processedAt && <span className="text-muted-foreground">· {processedAt}</span>}
        </div>
      )}
      
      {processedBy && state === "rejected" && (
        <div className="flex items-baseline gap-2">
          <span className="text-muted-foreground">{APPROVAL_LABELS.REJECTED_BY}</span>
          <span>{processedBy}</span>
          {processedAt && <span className="text-muted-foreground">· {processedAt}</span>}
        </div>
      )}
      
      {/* Rejection reason */}
      {reason && state === "rejected" && (
        <div className="mt-2">
          <span className="text-muted-foreground">{APPROVAL_LABELS.REJECTION_REASON}</span>
          <p className="text-foreground mt-0.5">{reason}</p>
        </div>
      )}
    </div>
  );
}

/**
 * PENDING APPROVAL BANNER — Clear visual indicator
 */
interface PendingApprovalBannerProps {
  type: string;
  submittedBy?: string;
  submittedAt?: string;
  className?: string;
}

export function PendingApprovalBanner({
  type,
  submittedBy,
  submittedAt,
  className,
}: PendingApprovalBannerProps) {
  return (
    <div
      className={cn(
        "bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-md px-4 py-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-[var(--warning-text)]">
            {APPROVAL_LABELS.PENDING_APPROVAL}
          </p>
          <p className="text-[12px] text-[var(--warning-text)] opacity-80 mt-0.5">
            {type}
            {submittedBy && ` · Submitted by ${submittedBy}`}
            {submittedAt && ` · ${submittedAt}`}
          </p>
        </div>
      </div>
    </div>
  );
}
