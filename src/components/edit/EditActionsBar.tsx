import * as React from "react";
import { cn } from "@/lib/utils";
import { AppButton } from "@/components/app-ui";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EDIT ACTIONS BAR — CANONICAL FOOTER ACTIONS (UNIFIED MERCURY STYLE)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Standard Cancel/Save layout for the Edit Flow.
 * Uses unified AppButton components for consistency.
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
        borderTop: '1px solid var(--border-subtle, #E6E8EC)',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
      }}
    >
      {/* Cancel button - secondary styling */}
      <AppButton
        type="button"
        onClick={onCancel}
        disabled={saving}
        intent="secondary"
        size="md"
        fullWidth
        className="flex-1"
      >
        {cancelLabel}
      </AppButton>

      {/* Save button - primary styling */}
      <AppButton
        type="button"
        onClick={onSave}
        disabled={!canSave}
        loading={saving}
        loadingText="Saving..."
        intent="primary"
        size="md"
        fullWidth
        className="flex-1"
      >
        {saveLabel}
      </AppButton>
    </div>
  );
}
