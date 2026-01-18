import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EDIT FIELD — CANONICAL INPUT STYLING (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Standard label + input styling + helper + validation for the Edit Flow.
 * 
 * STYLING (NON-NEGOTIABLE):
 * - Background: Dark surface (--platform-canvas)
 * - Border: 1px solid rgba(255,255,255,0.14) — subtle but visible
 * - Border on focus: 1px solid rgba(255,255,255,0.28)
 * - Corner radius: 6px (institutional, not playful)
 * - Height: 48px (comfortable tap target)
 * - Placeholder: muted, never bright
 * - Error state: red border + inline error message
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface EditFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** Field label (optional, usually omitted since title serves as label) */
  label?: string;
  /** Error message (shown inline below input) */
  error?: string | null;
  /** Helper text shown below input when no error */
  helperText?: string;
  /** Whether field is disabled/locked by policy */
  locked?: boolean;
  /** Lock reason text */
  lockReason?: string;
}

export const EditField = React.forwardRef<HTMLInputElement, EditFieldProps>(
  ({ label, error, helperText, locked = false, lockReason = "Managed by workspace policy", ...props }, ref) => {
    const hasError = !!error;
    const displayHelper = locked ? lockReason : helperText;

    return (
      <div className="w-full">
        {/* Optional label */}
        {label && (
          <label 
            className="block text-[13px] font-medium mb-2"
            style={{ color: 'var(--platform-text)' }}
          >
            {label}
          </label>
        )}

        {/* Input field with canonical styling */}
        <input
          ref={ref}
          disabled={locked}
          className={cn(
            "w-full h-12 px-4 text-[15px] rounded-md transition-all duration-200",
            "placeholder:text-[rgba(255,255,255,0.35)]",
            "focus:outline-none",
            locked && "opacity-50 cursor-not-allowed"
          )}
          style={{
            backgroundColor: 'var(--platform-canvas)',
            color: 'var(--platform-text)',
            border: hasError 
              ? '1px solid hsl(0 62% 50%)' 
              : '1px solid rgba(255,255,255,0.14)',
          }}
          onFocus={(e) => {
            if (!locked) {
              e.target.style.borderColor = 'rgba(255,255,255,0.28)';
            }
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            if (!locked && !hasError) {
              e.target.style.borderColor = 'rgba(255,255,255,0.14)';
            }
            props.onBlur?.(e);
          }}
          aria-invalid={hasError}
          aria-describedby={hasError ? "edit-field-error" : displayHelper ? "edit-field-helper" : undefined}
          {...props}
        />

        {/* Error message */}
        {hasError && (
          <p 
            id="edit-field-error"
            className="text-[13px] mt-2"
            style={{ color: 'hsl(0 62% 60%)' }}
          >
            {error}
          </p>
        )}

        {/* Helper text (when no error) */}
        {!hasError && displayHelper && (
          <p 
            id="edit-field-helper"
            className="text-[13px] mt-2"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            {displayHelper}
          </p>
        )}
      </div>
    );
  }
);

EditField.displayName = "EditField";
