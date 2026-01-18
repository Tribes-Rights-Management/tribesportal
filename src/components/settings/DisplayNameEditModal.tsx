import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/**
 * DISPLAY NAME EDIT MODAL
 * 
 * Modal for editing the user's display name.
 * Display name is shown in activity logs and collaboration surfaces.
 */

interface DisplayNameEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onSave: (value: string) => void;
  saving?: boolean;
}

export function DisplayNameEditModal({
  open,
  onOpenChange,
  value,
  onSave,
  saving = false,
}: DisplayNameEditModalProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset input when modal opens
  React.useEffect(() => {
    if (open) {
      setInputValue(value);
      // Focus input after modal animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, value]);

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSave(trimmed);
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !saving) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[400px] p-0 gap-0"
        style={{ 
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)'
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle 
            className="text-[17px] font-semibold"
            style={{ color: 'var(--platform-text)' }}
          >
            Edit display name
          </DialogTitle>
          <p 
            className="text-[13px] mt-1"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            Shown in activity logs and collaboration surfaces.
          </p>
        </DialogHeader>

        <div 
          className="px-6 py-4"
          style={{ borderTop: '1px solid var(--platform-border)' }}
        >
          <label 
            className="block text-[12px] font-medium mb-2"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            Display name
          </label>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter display name"
            maxLength={100}
            className="text-[14px]"
            style={{ 
              backgroundColor: 'var(--platform-canvas)',
              borderColor: 'var(--platform-border)',
              color: 'var(--platform-text)'
            }}
          />
        </div>

        {/* Actions */}
        <div 
          className="px-6 py-4 flex gap-3"
          style={{ borderTop: '1px solid var(--platform-border)' }}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 text-[14px] font-medium py-3 rounded transition-colors hover:bg-white/[0.06]"
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
            disabled={saving || !inputValue.trim()}
            className="flex-1 text-[14px] font-medium py-3 rounded transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--platform-text)',
              color: 'var(--platform-canvas)'
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
