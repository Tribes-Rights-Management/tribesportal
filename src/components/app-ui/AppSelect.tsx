import * as React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * APP SELECT — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL SELECT/DROPDOWN COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Uses shadcn Select internally for styled dropdown menus.
 * 
 * Standard styling:
 * - Height: 40px (h-10)
 * - Border radius: 8px (rounded-lg)
 * - Font size: 14px
 * - Background: bg-card
 * - Border: border-border
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
 * - No native <select> elements in the app
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
  /** Additional className for the trigger */
  className?: string;
}

export const AppSelect = forwardRef<HTMLButtonElement, AppSelectProps>(
  ({ value, onChange, options, placeholder = "Select...", disabled = false, fullWidth = false, className }, ref) => {
    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger 
          ref={ref}
          className={cn(
            "h-10 px-3 text-[14px] bg-card border border-border rounded-lg",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            fullWidth ? "w-full" : "w-auto min-w-[160px]",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-card border border-border rounded-lg shadow-lg">
          {options.map((opt) => (
            <SelectItem 
              key={opt.value} 
              value={opt.value}
              className="px-3 py-2 text-[14px] cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

AppSelect.displayName = "AppSelect";
