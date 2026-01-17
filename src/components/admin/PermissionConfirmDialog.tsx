import {
  AppModal,
  AppModalBody,
  AppModalFooter,
  AppModalAction,
  AppModalCancel,
} from "@/components/ui/app-modal";

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
 * Uses the unified AppModal system for consistent backdrop, spacing, and behavior.
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
    <AppModal
      open={open}
      onOpenChange={onClose}
      title="Confirm Authority Change"
      description="This action will modify user authority. Review the impact before proceeding."
      preventClose={processing}
      maxWidth="sm"
    >
      <AppModalBody>
        {/* Change Summary */}
        <div className="space-y-4">
          <div>
            <p 
              className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1.5"
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
            className="p-4 rounded-lg"
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
      </AppModalBody>

      <AppModalFooter>
        <AppModalAction
          onClick={onConfirm}
          loading={processing}
          loadingText="Processing…"
        >
          Confirm Change
        </AppModalAction>
        
        <AppModalCancel onClick={onClose} disabled={processing}>
          Cancel
        </AppModalCancel>
      </AppModalFooter>
    </AppModal>
  );
}
