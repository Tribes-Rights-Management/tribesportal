import { useState } from "react";
import { AppButton } from "@/components/app-ui";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateQueueStatus } from "@/hooks/use-song-queue";
import { toast } from "sonner";

/**
 * QUEUE STATUS CONTROL
 * Staff-only controls for changing queue item status.
 */

interface QueueStatusControlProps {
  queueId: string;
  currentStatus: string;
  onStatusChange?: () => void;
}

export function QueueStatusControl({ queueId, currentStatus, onStatusChange }: QueueStatusControlProps) {
  const updateStatus = useUpdateQueueStatus();
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [revisionRequest, setRevisionRequest] = useState("");

  const handleStatusChange = (newStatus: string, extra?: { rejectionReason?: string; revisionRequest?: string }) => {
    updateStatus.mutate(
      { queueId, status: newStatus, ...extra },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
          setShowRejectInput(false);
          setShowRevisionInput(false);
          setRejectionReason("");
          setRevisionRequest("");
          onStatusChange?.();
        },
        onError: (err) => toast.error(`Failed to update status: ${err.message}`),
      }
    );
  };

  // Don't show controls for terminal statuses
  if (currentStatus === "approved" || currentStatus === "rejected") {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Revision request input */}
      {showRevisionInput && (
        <div className="space-y-2">
          <Textarea
            placeholder="Describe what needs to be updated..."
            value={revisionRequest}
            onChange={(e) => setRevisionRequest(e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex gap-2">
            <AppButton
              size="sm"
              onClick={() => handleStatusChange("needs_revision", { revisionRequest })}
              disabled={!revisionRequest.trim() || updateStatus.isPending}
              loading={updateStatus.isPending}
            >
              Send Revision Request
            </AppButton>
            <AppButton size="sm" variant="ghost" onClick={() => setShowRevisionInput(false)}>
              Cancel
            </AppButton>
          </div>
        </div>
      )}

      {/* Rejection reason input */}
      {showRejectInput && (
        <div className="space-y-2">
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex gap-2">
            <AppButton
              size="sm"
              variant="danger"
              onClick={() => handleStatusChange("rejected", { rejectionReason })}
              disabled={!rejectionReason.trim() || updateStatus.isPending}
              loading={updateStatus.isPending}
            >
              Confirm Rejection
            </AppButton>
            <AppButton size="sm" variant="ghost" onClick={() => setShowRejectInput(false)}>
              Cancel
            </AppButton>
          </div>
        </div>
      )}

      {/* Main action buttons */}
      {!showRejectInput && !showRevisionInput && (
        <div className="flex flex-wrap gap-2">
          {(currentStatus === "submitted" || currentStatus === "pending") && (
            <AppButton
              size="sm"
              onClick={() => handleStatusChange("in_review")}
              loading={updateStatus.isPending}
            >
              Start Review
            </AppButton>
          )}

          {(currentStatus === "in_review" || currentStatus === "needs_revision") && (
            <>
              <AppButton
                size="sm"
                onClick={() => handleStatusChange("approved")}
                loading={updateStatus.isPending}
              >
                Complete Registration
              </AppButton>
              <AppButton
                size="sm"
                variant="secondary"
                onClick={() => setShowRevisionInput(true)}
              >
                Request Update
              </AppButton>
              <AppButton
                size="sm"
                variant="danger"
                onClick={() => setShowRejectInput(true)}
              >
                Reject
              </AppButton>
            </>
          )}
        </div>
      )}
    </div>
  );
}
