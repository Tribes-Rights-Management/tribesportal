import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EDIT ACTIONS BAR — CANONICAL FOOTER ACTIONS (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Standard Cancel/Save layout for the Edit Flow.
 * 
 * LAYOUT:
 * - Cancel (left) — secondary action
 * - Save (right) — primary action
 * - Both buttons flex-1 for equal width
 * 
 * BEHAVIOR:
 * - Save disabled unless canSave is true
 * - Save shows loading state when saving
 * - Keyboard-safe: accounts for iOS Safari bottom safe area
 * 
 * STYLING:
 * - Apple-like rounded buttons
 * - Clear visual distinction between primary and secondary
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface EditActionsBarProps {
  /** Whether save is possible (value changed + valid) */
  canSave: boolean;
  /** Whether save is in progress */
  saving?: boolean;
  /** Cancel button handler */
  onCancel: () => void;
  /** Save button handler */
  onSave: () => void;
  /** Custom save button label */
  saveLabel?: string;
  /** Custom cancel button label */
  cancelLabel?: string;
}

export function EditActionsBar({
  canSave,
  saving = false,
  onCancel,
  onSave,
  saveLabel = "Save",
  cancelLabel = "Cancel",
}: EditActionsBarProps) {
  return (
    <div 
      className="flex flex-row gap-3 px-5 pt-4 pb-5 shrink-0"
      style={{ 
        borderTop: '1px solid var(--platform-border)',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
      }}
    >
      {/* Cancel button - secondary styling */}
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className={cn(
          "flex-1 text-[15px] font-medium py-3.5 rounded-xl",
          "transition-all duration-200 disabled:opacity-50",
          "hover:bg-white/[0.08] active:scale-[0.98]"
        )}
        style={{ 
          color: 'var(--platform-text-secondary)',
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {cancelLabel}
      </button>

      {/* Save button - primary styling */}
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave || saving}
        className={cn(
          "flex-1 text-[15px] font-semibold py-3.5 rounded-xl",
          "transition-all duration-200",
          canSave && !saving ? "active:scale-[0.98]" : "opacity-40"
        )}
        style={{ 
          backgroundColor: 'var(--platform-text)',
          color: 'var(--platform-canvas)',
        }}
      >
        {saving ? "Saving..." : saveLabel}
      </button>
    </div>
  );
}
