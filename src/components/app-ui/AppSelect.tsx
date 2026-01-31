import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/**
 * APP SELECT — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL SELECT/DROPDOWN COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent select/dropdown styling with:
 * - Standard height (40px) and border-radius (8px)
 * - Custom chevron icon (h-5 w-5)
 * - Theme-aware colors
 * 
 * USAGE:
 *   <AppSelect
 *     value={status}
 *     onChange={setStatus}
 *     options={[
 *       { value: "all", label: "All statuses" },
 *       { value: "draft", label: "Draft" },
 *     ]}
 *   />
 * 
 * ENFORCEMENT:
 * - All filter dropdowns must use this component
 * - No hardcoded select styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Options list */
  options: SelectOption[];
  /** Visual variant */
  variant?: "default" | "compact";
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Additional className */
  className?: string;
}

export function AppSelect({
  value,
  onChange,
  options,
  variant = "default",
  placeholder,
  disabled = false,
  fullWidth = false,
  className,
}: AppSelectProps) {
  const isCompact = variant === "compact";
  
  const selectClasses = cn(
    // Base styles
    "bg-card border border-border appearance-none cursor-pointer",
    "text-foreground transition-colors duration-150",
    "focus:outline-none focus:ring-1 focus:ring-ring",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    // Size variants
    isCompact 
      ? "h-9 px-3 pr-8 text-[13px] rounded" 
      : "h-10 px-3 pr-10 text-[14px] rounded-lg",
    // Width
    fullWidth ? "w-full" : "w-auto"
  );

  const chevronClasses = cn(
    "absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none",
    isCompact ? "right-2 h-4 w-4" : "right-3 h-5 w-5"
  );

  return (
    <div className={cn("relative", fullWidth && "w-full", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={selectClasses}
      >
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={chevronClasses}
        strokeWidth={1.5}
      />
    </div>
  );
}
