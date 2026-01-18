import * as React from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * PREFERENCE SELECT MODAL
 * 
 * A clean modal for selecting preference options.
 * Used for timezone, date format, time format, and timeout selections.
 */

interface Option {
  value: string | number;
  label: string;
}

interface PreferenceSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  options: readonly Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

export function PreferenceSelectModal({
  open,
  onOpenChange,
  title,
  description,
  options,
  value,
  onChange,
  disabled = false,
}: PreferenceSelectModalProps) {
  const handleSelect = (optionValue: string | number) => {
    if (disabled) return;
    onChange(optionValue);
    onOpenChange(false);
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
            {title}
          </DialogTitle>
          {description && (
            <p 
              className="text-[13px] mt-1"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {description}
            </p>
          )}
        </DialogHeader>

        <div 
          className="max-h-[60vh] overflow-y-auto"
          style={{ borderTop: '1px solid var(--platform-border)' }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => handleSelect(option.value)}
                disabled={disabled}
                className={cn(
                  "w-full px-6 py-4 flex items-center justify-between gap-4",
                  "text-left transition-colors",
                  "hover:bg-white/[0.03] focus:bg-white/[0.03]",
                  "focus:outline-none",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{ borderBottom: '1px solid var(--platform-border)' }}
              >
                <span 
                  className="text-[14px]"
                  style={{ 
                    color: isSelected ? 'var(--platform-text)' : 'var(--platform-text-secondary)' 
                  }}
                >
                  {option.label}
                </span>
                {isSelected && (
                  <Check 
                    className="h-4 w-4 shrink-0" 
                    style={{ color: '#4ade80' }} 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Cancel button at bottom */}
        <div 
          className="px-6 py-4"
          style={{ borderTop: '1px solid var(--platform-border)' }}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full text-[14px] font-medium py-3 rounded transition-colors hover:bg-white/[0.06]"
            style={{ 
              color: 'var(--platform-text-secondary)',
              backgroundColor: 'rgba(255,255,255,0.03)'
            }}
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
