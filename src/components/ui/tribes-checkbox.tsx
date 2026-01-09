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
 * iOS Safari: Native input is absolutely positioned and opacity:0,
 * with explicit sizing to prevent any native rendering from showing.
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
      {/* Checkbox container - positions native input and custom visual */}
      <span className="relative shrink-0 w-[18px] h-[18px] mt-[3px]">
        {/* Native input: opacity 0, same size as container, no appearance */}
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          disabled={disabled}
          aria-checked={checked}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '18px',
            height: '18px',
            margin: 0,
            padding: 0,
            opacity: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            // Force no appearance on iOS Safari
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
        />
        
        {/* Custom visual checkbox box */}
        <span
          className={cn(
            // 18x18px box, 2px radius, thin border, transparent bg
            "absolute inset-0 rounded-[2px] border bg-transparent transition-colors duration-100 pointer-events-none",
            "border-[#cfcfcf]",
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
        
        {/* Focus ring - shows when native input is focused */}
        <span 
          className="absolute inset-0 rounded-[2px] pointer-events-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[rgba(17,17,17,0.25)] peer-focus-visible:outline-offset-2"
          aria-hidden="true"
        />
      </span>
      
      {/* Label content - inherits typography from parent */}
      <span className="text-[14px] text-muted-foreground leading-relaxed">
        {children}
      </span>
    </label>
  );
}
