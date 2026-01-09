import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * TRIBES CHECKBOX — CANONICAL CONSENT CONTROL (LOCKED)
 * 
 * This is the ONLY checkbox component for consent/legal rows sitewide.
 * 
 * Visual requirements (non-negotiable):
 * - 18x18px visible box, border-radius: 2px
 * - 1px border #cfcfcf, transparent background
 * - Checked: crisp SVG checkmark (#111), NO filled background
 * - Top-aligned with first line of label text
 * - Full row clickable (44px+ hit area), visible box stays 18px
 * - Focus: subtle outline on box only
 * - Disabled: reduced opacity
 * 
 * iOS Safari: appearance:none + custom styling prevents native rendering
 */

interface TribesCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TribesCheckbox({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  children,
  className,
}: TribesCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        // Wrapper: flex row, top-aligned, 12px gap, full row clickable
        "flex items-start gap-3 cursor-pointer select-none min-h-[44px]",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* Visually hidden native input for accessibility */}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
        aria-checked={checked}
      />
      
      {/* Custom visual checkbox box */}
      <span
        className={cn(
          // 18x18px box, 2px radius, thin border, transparent bg
          "relative shrink-0 w-[18px] h-[18px] rounded-[2px] border bg-transparent transition-colors duration-100",
          "border-[#cfcfcf]",
          // Focus state: subtle outline on box only
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[rgba(17,17,17,0.25)] peer-focus-visible:outline-offset-2",
          // Checked: slightly darker border for definition
          checked && "border-[#888888]"
        )}
        aria-hidden="true"
      >
        {/* Checkmark SVG - only visible when checked */}
        {checked && (
          <svg
            className="absolute inset-0 w-full h-full p-[2px]"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 7.5L5.5 10L11 4"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      
      {/* Label content - inherits typography from parent */}
      <span className="text-[14px] text-muted-foreground leading-relaxed pt-px">
        {children}
      </span>
    </label>
  );
}
