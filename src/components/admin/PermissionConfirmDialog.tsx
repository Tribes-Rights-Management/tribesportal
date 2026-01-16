import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PendingChange {
  type: string;
  label: string;
  impact: string;
  currentValue: string;
  newValue: string;
  targetId: string;
  membershipId?: string;
}

interface PermissionConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  change: PendingChange | null;
  processing: boolean;
}

/**
 * PERMISSION CONFIRMATION DIALOG — INSTITUTIONAL GOVERNANCE STANDARD
 * 
 * Design Rules:
 * - Explicit restatement of impact
 * - No soft language or reassurance
 * - Clear acknowledgment required
 * - Formal, declarative tone
 */
export function PermissionConfirmDialog({
  open,
  onClose,
  onConfirm,
  change,
  processing,
}: PermissionConfirmDialogProps) {
  if (!change) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[480px] p-0 gap-0 border-0"
        style={{ 
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)'
        }}
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle 
            className="text-[18px] font-semibold tracking-[-0.01em]"
            style={{ color: 'var(--platform-text)' }}
          >
            Confirm Authority Change
          </DialogTitle>
          <DialogDescription 
            className="text-[14px] mt-2"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            This action will modify user authority. Review the impact before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div 
          className="px-6 py-4"
          style={{ borderTop: '1px solid var(--platform-border)' }}
        >
          {/* Change Summary */}
          <div className="space-y-4">
            <div>
              <p 
                className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                {change.label}
              </p>
              <div className="flex items-center gap-3">
                <span 
                  className="text-[14px] line-through"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  {change.currentValue}
                </span>
                <span 
                  className="text-[12px]"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  →
                </span>
                <span 
                  className="text-[14px] font-medium"
                  style={{ color: 'var(--platform-text)' }}
                >
                  {change.newValue}
                </span>
              </div>
            </div>

            {/* Impact Statement */}
            <div 
              className="p-4 rounded"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--platform-border)'
              }}
            >
              <p 
                className="text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                Impact
              </p>
              <p 
                className="text-[13px] leading-relaxed"
                style={{ color: 'var(--platform-text-secondary)' }}
              >
                {change.impact}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter 
          className="p-6 pt-4 flex gap-3"
          style={{ borderTop: '1px solid var(--platform-border)' }}
        >
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium rounded transition-colors"
            style={{ 
              color: 'var(--platform-text-secondary)',
              border: '1px solid var(--platform-border)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={processing}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium rounded transition-colors"
            style={{ 
              backgroundColor: 'var(--platform-text)',
              color: 'var(--platform-canvas)'
            }}
          >
            {processing ? "Processing..." : "Confirm Change"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
