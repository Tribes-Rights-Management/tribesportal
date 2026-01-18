import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EDIT FIELD — CANONICAL INPUT STYLING (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Standard label + input styling + helper + validation for the Edit Flow.
 * Uses canonical CSS variables from index.css for consistency.
 * 
 * STYLING (NON-NEGOTIABLE):
 * - Background: Dark surface (--edit-input-bg)
 * - Border: 1px solid rgba(255,255,255,0.14) — subtle but visible
 * - Border on focus: 1px solid rgba(255,255,255,0.28) + focus ring
 * - Corner radius: 10px (Apple-like, slightly rounded)
 * - Height: 48px (comfortable tap target)
 * - Placeholder: muted (rgba(255,255,255,0.35))
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

        {/* Input field with canonical Apple-like styling */}
        <input
          ref={ref}
          disabled={locked}
          className={cn(
            "w-full transition-all duration-200 outline-none",
            locked && "cursor-not-allowed"
          )}
          style={{
            height: 'var(--edit-input-height, 48px)',
            padding: 'var(--edit-input-padding, 0 16px)',
            fontSize: 'var(--edit-input-font-size, 15px)',
            borderRadius: 'var(--edit-input-radius, 10px)',
            backgroundColor: 'var(--edit-input-bg, var(--platform-canvas))',
            color: 'var(--edit-input-text, var(--platform-text))',
            border: hasError 
              ? '1px solid var(--edit-input-error-border, hsl(0 62% 50%))' 
              : '1px solid var(--edit-input-border, rgba(255,255,255,0.14))',
            opacity: locked ? 'var(--edit-input-disabled-opacity, 0.5)' : 1,
          }}
          onFocus={(e) => {
            if (!locked && !hasError) {
              e.target.style.borderColor = 'var(--edit-input-border-focus, rgba(255,255,255,0.28))';
              e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.06)';
            }
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            if (!locked) {
              e.target.style.borderColor = hasError 
                ? 'var(--edit-input-error-border, hsl(0 62% 50%))' 
                : 'var(--edit-input-border, rgba(255,255,255,0.14))';
              e.target.style.boxShadow = 'none';
            }
            props.onBlur?.(e);
          }}
          aria-invalid={hasError}
          aria-describedby={hasError ? "edit-field-error" : displayHelper ? "edit-field-helper" : undefined}
          {...props}
        />

        {/* Placeholder styling via CSS */}
        <style>{`
          input::placeholder {
            color: var(--edit-input-placeholder, rgba(255,255,255,0.35));
          }
        `}</style>

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
