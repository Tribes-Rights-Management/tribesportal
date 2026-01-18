import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditSheetLayout } from "./EditSheetLayout";
import { EditActionsBar } from "./EditActionsBar";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EDIT SELECT SHEET — CANONICAL SELECT FLOW (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Full-height select surface for preference selections.
 * Replaces floating modals with the canonical Edit Flow pattern.
 * 
 * USAGE:
 * - Timezone selection
 * - Date format selection
 * - Time format selection
 * - Inactivity timeout selection
 * - Any other dropdown-style selection
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface Option {
  value: string | number;
  label: string;
}

interface EditSelectSheetProps {
  /** Controls sheet visibility */
  open: boolean;
  /** Callback when sheet should close */
  onOpenChange: (open: boolean) => void;
  /** Parent context label (shown next to back arrow) */
  parentLabel: string;
  /** Field title (main heading) */
  title: string;
  /** Helper text under title */
  helperText?: string;
  /** Available options */
  options: readonly Option[];
  /** Current selected value */
  value: string | number;
  /** Callback when selection changes */
  onChange: (value: string | number) => void;
  /** Whether field is disabled/locked by policy */
  disabled?: boolean;
  /** Lock reason text */
  lockReason?: string;
}

export function EditSelectSheet({
  open,
  onOpenChange,
  parentLabel,
  title,
  helperText,
  options,
  value,
  onChange,
  disabled = false,
  lockReason = "Managed by workspace policy",
}: EditSelectSheetProps) {
  const [selectedValue, setSelectedValue] = React.useState(value);
  const [saving, setSaving] = React.useState(false);

  // Reset selection when opened
  React.useEffect(() => {
    if (open) {
      setSelectedValue(value);
    }
  }, [open, value]);

  const hasChanged = selectedValue !== value;
  const canSave = hasChanged && !disabled && !saving;

  const handleSelect = (optionValue: string | number) => {
    if (disabled) return;
    setSelectedValue(optionValue);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onChange(selectedValue);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const effectiveHelperText = disabled ? lockReason : helperText;

  return (
    <EditSheetLayout
      open={open}
      onOpenChange={onOpenChange}
      parentLabel={parentLabel}
      title={title}
      helperText={effectiveHelperText}
      preventClose={saving}
      footer={
        <EditActionsBar
          canSave={canSave}
          saving={saving}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      }
    >
      {/* Options list with Apple-like styling */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ 
          border: '1px solid var(--edit-input-border, rgba(255,255,255,0.14))',
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        {options.map((option, index) => {
          const isSelected = option.value === selectedValue;
          const isLast = index === options.length - 1;
          
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={disabled}
              className={cn(
                "w-full px-4 py-4 flex items-center justify-between gap-4",
                "text-left transition-colors min-h-[52px]",
                "hover:bg-white/[0.04] focus:bg-white/[0.04]",
                "focus:outline-none",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              style={{ 
                borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span 
                className="text-[15px]"
                style={{ 
                  color: isSelected ? 'var(--platform-text)' : 'var(--platform-text-secondary)' 
                }}
              >
                {option.label}
              </span>
              {isSelected && (
                <Check 
                  className="h-5 w-5 shrink-0" 
                  style={{ color: '#4ade80' }} 
                />
              )}
            </button>
          );
        })}
      </div>
    </EditSheetLayout>
  );
}
