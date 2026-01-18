import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppSheet, AppSheetBody, AppSheetFooter } from "@/components/ui/app-sheet";

/**
 * DISPLAY NAME EDIT SHEET
 * 
 * Full-height edit surface for display name (not a modal).
 * - Single field only
 * - Auto-focus on entry
 * - Sticky bottom actions
 * - Save enabled only when value changes
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
  const canSave = hasChanged && isValid && !saving;

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
    await onSave(trimmed);
    onOpenChange(false);
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
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title=""
      width="sm"
      preventClose={saving}
    >
      {/* Custom header with back button */}
      <div 
        className="flex items-center gap-3 px-5 pt-5 pb-4"
        style={{ borderBottom: '1px solid var(--platform-border)' }}
      >
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="h-10 w-10 -ml-2 flex items-center justify-center rounded-lg transition-colors hover:bg-white/[0.05] disabled:opacity-50"
          style={{ color: 'var(--platform-text-secondary)' }}
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span 
          className="text-[15px] font-medium"
          style={{ color: 'var(--platform-text-secondary)' }}
        >
          Profile
        </span>
      </div>

      <AppSheetBody className="pt-6">
        {/* Title */}
        <h2 
          className="text-[20px] font-semibold mb-2"
          style={{ color: 'var(--platform-text)' }}
        >
          Display name
        </h2>
        
        {/* Helper text */}
        <p 
          className="text-[13px] mb-6"
          style={{ color: 'var(--platform-text-secondary)' }}
        >
          Shown in activity logs and collaboration surfaces.
        </p>

        {/* Input field */}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter display name"
          maxLength={100}
          className="text-[15px] h-12"
          style={{ 
            backgroundColor: 'var(--platform-canvas)',
            borderColor: error ? 'hsl(0 62% 50%)' : 'var(--platform-border)',
            color: 'var(--platform-text)'
          }}
          aria-invalid={!!error}
          aria-describedby={error ? "display-name-error" : undefined}
        />

        {/* Inline error */}
        {error && (
          <p 
            id="display-name-error"
            className="text-[13px] mt-2"
            style={{ color: 'hsl(0 62% 60%)' }}
          >
            {error}
          </p>
        )}
      </AppSheetBody>

      {/* Sticky footer */}
      <AppSheetFooter className="flex-row justify-between sm:flex-row">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="flex-1 text-[14px] font-medium py-3.5 rounded-lg transition-colors hover:bg-white/[0.06] disabled:opacity-50"
          style={{ 
            color: 'var(--platform-text-secondary)',
            backgroundColor: 'rgba(255,255,255,0.03)'
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 text-[14px] font-medium py-3.5 rounded-lg transition-colors disabled:opacity-40"
          style={{ 
            backgroundColor: canSave ? 'var(--platform-text)' : 'var(--platform-text)',
            color: 'var(--platform-canvas)'
          }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </AppSheetFooter>
    </AppSheet>
  );
}
