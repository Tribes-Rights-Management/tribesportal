import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP INPUT — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL TEXT INPUT COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent text input styling with:
 * - Label support
 * - Helper text
 * - Error state
 * - Theme-aware colors
 * 
 * USAGE:
 *   <AppInput
 *     label="Name"
 *     value={name}
 *     onChange={setName}
 *     placeholder="Enter name"
 *     helperText="This will be displayed publicly"
 *   />
 * 
 * ENFORCEMENT:
 * - All form inputs must use this component
 * - No hardcoded input styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppInputProps {
  /** Input label */
  label?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message (shows error state) */
  error?: string;
  /** Input type */
  type?: "text" | "email" | "password" | "url" | "number";
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Additional className for input */
  className?: string;
}

export function AppInput({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  type = "text",
  disabled = false,
  required = false,
  className,
}: AppInputProps) {
  const inputId = React.useId();
  const hasError = !!error;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs uppercase tracking-wider font-medium text-muted-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={cn(
          "w-full h-10 px-3.5",
          "bg-[var(--app-surface-bg)] border rounded-lg",
          "text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60", // 16px on mobile to prevent Safari zoom
          "focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]",
          "transition-colors duration-150",
          hasError
            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
            : "border-border hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-invalid={hasError}
        aria-describedby={helperText || error ? `${inputId}-description` : undefined}
      />
      {(helperText || error) && (
        <p
          id={`${inputId}-description`}
          className={cn(
            "text-xs",
            hasError ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

/**
 * APP TEXTAREA — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * Multi-line text input variant.
 */

interface AppTextareaProps {
  /** Input label */
  label?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message (shows error state) */
  error?: string;
  /** Number of rows */
  rows?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Allow resize */
  resize?: boolean;
  /** Additional className */
  className?: string;
}

export function AppTextarea({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  rows = 3,
  disabled = false,
  required = false,
  resize = false,
  className,
}: AppTextareaProps) {
  const inputId = React.useId();
  const hasError = !!error;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs uppercase tracking-wider font-medium text-muted-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={cn(
          "w-full px-3.5 py-2.5",
          "bg-[var(--app-surface-bg)] border rounded-lg",
          "text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60", // 16px on mobile to prevent Safari zoom
          "focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]",
          "transition-colors duration-150",
          hasError
            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
            : "border-border hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed",
          !resize && "resize-none",
          className
        )}
        aria-invalid={hasError}
        aria-describedby={helperText || error ? `${inputId}-description` : undefined}
      />
      {(helperText || error) && (
        <p
          id={`${inputId}-description`}
          className={cn(
            "text-xs",
            hasError ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
