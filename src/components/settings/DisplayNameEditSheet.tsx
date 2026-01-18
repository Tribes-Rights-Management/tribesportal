import * as React from "react";
import { EditSheetLayout } from "@/components/edit/EditSheetLayout";
import { EditField } from "@/components/edit/EditField";
import { EditActionsBar } from "@/components/edit/EditActionsBar";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME EDIT SHEET
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Full-height edit surface for display name using the canonical Edit Flow.
 * - Single field only
 * - Auto-focus on entry
 * - Sticky bottom actions
 * - Save enabled only when value changes
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface DisplayNameEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onSave: (value: string) => Promise<void> | void;
  saving?: boolean;
}

export function DisplayNameEditSheet({
  open,
  onOpenChange,
  value,
  onSave,
  saving = false,
}: DisplayNameEditSheetProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset input when sheet opens
  React.useEffect(() => {
    if (open) {
      setInputValue(value);
      setError(null);
      // Auto-focus after sheet animation
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, value]);

  const hasChanged = inputValue.trim() !== value.trim();
  const isValid = inputValue.trim().length > 0;
  const canSave = hasChanged && isValid && !saving && !isSaving;

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError("Display name cannot be empty");
      return;
    }
    if (trimmed.length > 100) {
      setError("Display name must be less than 100 characters");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSave(trimmed);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSave) {
      handleSave();
    }
  };

  return (
    <EditSheetLayout
      open={open}
      onOpenChange={onOpenChange}
      parentLabel="Profile"
      title="Display name"
      helperText="Shown in activity logs and collaboration surfaces."
      preventClose={saving || isSaving}
      footer={
        <EditActionsBar
          canSave={canSave}
          saving={saving || isSaving}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      }
    >
      <EditField
        ref={inputRef}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Enter display name"
        maxLength={100}
        error={error}
      />
    </EditSheetLayout>
  );
}
