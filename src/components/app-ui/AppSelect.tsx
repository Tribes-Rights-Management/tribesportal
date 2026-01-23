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
 * - Two variants: underline (minimal) and boxed (standard)
 * - Custom chevron icon
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
  variant?: "underline" | "boxed";
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

export function AppSelect({
  value,
  onChange,
  options,
  variant = "underline",
  placeholder,
  disabled = false,
  className,
}: AppSelectProps) {
  const baseClasses = cn(
    "text-[13px] text-foreground bg-transparent",
    "focus:outline-none transition-colors duration-150",
    "appearance-none cursor-pointer pr-8",
    disabled && "opacity-50 cursor-not-allowed"
  );

  const variantClasses = {
    underline: cn(
      "h-9 pl-3",
      "border-0 border-b border-border",
      "focus:border-muted-foreground"
    ),
    boxed: cn(
      "h-10 pl-3 rounded-[var(--control-radius)]",
      "border border-border bg-card",
      "focus:border-muted-foreground focus:ring-1 focus:ring-ring"
    ),
  };

  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(baseClasses, variantClasses[variant])}
      >
        {placeholder && (
          <option value="" disabled>
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
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2",
          "h-4 w-4 text-muted-foreground pointer-events-none"
        )}
        strokeWidth={1.5}
      />
    </div>
  );
}
