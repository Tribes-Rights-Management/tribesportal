import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/**
 * APP CHECKBOX GROUP — GLOBAL UI KIT
 * 
 * Multi-select checkbox group for audience selection, permissions, etc.
 */

export interface CheckboxOption {
  id: string;
  label: string;
  description?: string;
}

interface AppCheckboxGroupProps {
  /** Group label */
  label?: string;
  /** Available options */
  options: CheckboxOption[];
  /** Currently selected option IDs */
  selected: string[];
  /** Change handler */
  onChange: (selected: string[]) => void;
  /** Layout direction */
  direction?: "vertical" | "horizontal";
  /** Show error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

export function AppCheckboxGroup({
  label,
  options,
  selected,
  onChange,
  direction = "vertical",
  error = false,
  errorMessage,
  required = false,
  disabled = false,
  className,
}: AppCheckboxGroupProps) {
  const handleToggle = (optionId: string) => {
    if (disabled) return;
    
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div
        className={cn(
          direction === "horizontal" 
            ? "flex flex-wrap items-center gap-4" 
            : "space-y-2"
        )}
      >
        {options.length === 0 ? (
          <p className="text-[12px] text-muted-foreground italic">No options available</p>
        ) : (
          options.map((option) => {
            const isChecked = selected.includes(option.id);
            
            return direction === "horizontal" ? (
              // Compact horizontal layout (inline checkboxes)
              <label
                key={option.id}
                className={cn(
                  "flex items-center gap-2 cursor-pointer select-none",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  handleToggle(option.id);
                }}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                    isChecked
                      ? "bg-primary border-primary"
                      : error
                        ? "border-destructive hover:border-destructive"
                        : "border-muted-foreground/40 hover:border-muted-foreground"
                  )}
                >
                  {isChecked && (
                    <Check className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
                  )}
                </div>
                <span className="text-[13px]">{option.label}</span>
              </label>
            ) : (
              // Card-style vertical layout
              <label
                key={option.id}
                className={cn(
                  "flex items-center gap-3 p-3 bg-card border rounded cursor-pointer transition-colors",
                  isChecked
                    ? "border-primary bg-primary/5"
                    : error
                      ? "border-destructive hover:border-destructive"
                      : "border-border hover:border-primary/50",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  handleToggle(option.id);
                }}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                    isChecked
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/40"
                  )}
                >
                  {isChecked && (
                    <Check className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-foreground">{option.label}</span>
                  {option.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  )}
                </div>
              </label>
            );
          })
        )}
      </div>
      
      {error && errorMessage && (
        <p className="text-xs text-destructive mt-1.5">{errorMessage}</p>
      )}
    </div>
  );
}
