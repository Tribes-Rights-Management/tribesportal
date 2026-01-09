import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * TRIBES CHECKBOX — CANONICAL CONSENT CONTROL (LOCKED)
 *
 * Purpose: a stable, iOS-safe consent checkbox that cannot regress to native UI.
 * 
 * Structure:
 * - Outer wrapper: flex, items-start, min-height 44px (tap target), clickable
 * - Tap-target wrapper: 44x44 invisible hit area containing the 18x18 visual box
 * - Native input: opacity:0, appearance:none, positioned over tap target
 * - Visual box: 18x18, border only, no fill, SVG checkmark when checked
 * - Label: leading-relaxed, top-aligned with visual box
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
  const labelId = `${id}-label`;

  return (
    <div
      className={cn(
        // Wrapper: flex, top-aligned, 12px gap, full-row tap target
        "flex items-start gap-3 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={() => {
        if (!disabled) onCheckedChange(!checked);
      }}
    >
      {/* Tap target wrapper: 44x44 invisible, contains 18x18 visual box */}
      <span 
        className="relative shrink-0 flex items-start justify-center"
        style={{ width: '44px', height: '44px', marginLeft: '-13px', marginTop: '-13px' }}
      >
        {/* Native input: covers full tap target, invisible */}
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          disabled={disabled}
          aria-labelledby={labelId}
          data-tribes-checkbox
          className="peer absolute inset-0 m-0 p-0 cursor-pointer"
          style={{ 
            width: '44px', 
            height: '44px', 
            opacity: 0,
            WebkitAppearance: 'none', 
            appearance: 'none',
          }}
        />

        {/* Visual box: 18x18, centered in 44x44 tap target */}
        <span
          className={cn(
            "absolute rounded-[2px] border bg-transparent transition-colors duration-100",
            "border-[hsl(var(--tribes-checkbox-border))]",
            checked && "border-[hsl(var(--tribes-checkbox-border-checked))]",
            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[hsl(var(--tribes-checkbox-focus))] peer-focus-visible:outline-offset-2",
          )}
          style={{ 
            width: '18px', 
            height: '18px', 
            top: '13px', 
            left: '13px',
          }}
          aria-hidden="true"
        >
          {checked && (
            <svg
              className="absolute inset-0 w-full h-full p-[2px]"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7.5L5.5 10L11 4"
                stroke="hsl(var(--tribes-checkbox-check))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>

      {/* Label content: top-aligned with visual box */}
      <span id={labelId} className="text-[14px] text-muted-foreground leading-relaxed pt-px">
        {children}
      </span>
    </div>
  );
}

