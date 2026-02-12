import { cn } from "@/lib/utils";
import { Circle, Clock, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

/**
 * QUEUE STATUS BADGE
 * Maps internal queue statuses to client-friendly labels with color coding.
 */

type QueueStatus = "submitted" | "pending" | "in_review" | "needs_revision" | "approved" | "rejected";

interface QueueStatusBadgeProps {
  status: string;
  /** If true, show client-friendly labels */
  clientFacing?: boolean;
  className?: string;
}

const statusConfig: Record<QueueStatus, {
  internalLabel: string;
  clientLabel: string;
  icon: React.ReactNode;
  classes: string;
}> = {
  submitted: {
    internalLabel: "Submitted",
    clientLabel: "Submitted",
    icon: <Circle className="h-3 w-3" />,
    classes: "bg-muted/40 text-muted-foreground border-border/40",
  },
  pending: {
    internalLabel: "Pending",
    clientLabel: "Submitted",
    icon: <Clock className="h-3 w-3" />,
    classes: "bg-muted/40 text-muted-foreground border-border/40",
  },
  in_review: {
    internalLabel: "In Review",
    clientLabel: "In Review",
    icon: <Eye className="h-3 w-3" />,
    classes: "bg-amber-500/8 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  needs_revision: {
    internalLabel: "Needs Revision",
    clientLabel: "Update Requested",
    icon: <AlertTriangle className="h-3 w-3" />,
    classes: "bg-amber-500/8 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  approved: {
    internalLabel: "Approved",
    clientLabel: "Delivered for Registration",
    icon: <CheckCircle className="h-3 w-3" />,
    classes: "bg-muted/30 text-muted-foreground border-border/30",
  },
  rejected: {
    internalLabel: "Rejected",
    clientLabel: "Not Accepted",
    icon: <XCircle className="h-3 w-3" />,
    classes: "bg-red-500/8 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export function QueueStatusBadge({ status, clientFacing = false, className }: QueueStatusBadgeProps) {
  const config = statusConfig[status as QueueStatus] || statusConfig.pending;
  const label = clientFacing ? config.clientLabel : config.internalLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-full border",
        "select-none pointer-events-none",
        config.classes,
        className,
      )}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {config.icon}
      <span>{label}</span>
    </span>
  );
}
