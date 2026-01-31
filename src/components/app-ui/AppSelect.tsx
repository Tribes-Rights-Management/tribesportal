import * as React from "react";
import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * APP SELECT — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL SELECT/DROPDOWN COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Standard styling:
 * - Height: 40px (h-10)
 * - Border radius: 8px (rounded-lg)
 * - Font size: 14px
 * - Chevron: 20x20px (h-5 w-5)
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

interface AppSelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Options list */
  options: AppSelectOption[];
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Additional className */
  className?: string;
}

export const AppSelect = forwardRef<HTMLDivElement, AppSelectProps>(
  ({ value, onChange, options, placeholder = "Select...", disabled = false, fullWidth = false, className }, ref) => {
    return (
      <div ref={ref} className={cn("relative", fullWidth && "w-full", className)}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "h-10 px-3 pr-10 text-[14px] bg-card border border-border rounded-lg",
            "appearance-none cursor-pointer transition-colors duration-150",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            fullWidth ? "w-full" : "w-auto"
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" 
          strokeWidth={1.5}
        />
      </div>
    );
  }
);

AppSelect.displayName = "AppSelect";
