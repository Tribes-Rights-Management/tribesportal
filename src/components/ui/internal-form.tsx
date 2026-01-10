import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * INTERNAL FORM COMPONENTS — TRIBES INSTITUTIONAL STANDARD (LOCKED)
 * 
 * Purpose: Compact, operational forms for authenticated portal contexts.
 * Applies to: Licensing, Publishing, Admin, and all internal data entry.
 * 
 * Design principles:
 * - Forms are operational instruments, not marketing surfaces
 * - Neutral, system-oriented language only
 * - No reassurance or explanatory copy
 * - Compact spacing for repeat professional use
 */

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM — Main wrapper for portal forms
   ═══════════════════════════════════════════════════════════════════════════ */

interface InternalFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Width variant: 'default' (560px), 'narrow' (400px), 'wide' (720px) */
  width?: 'default' | 'narrow' | 'wide';
}

const InternalForm = React.forwardRef<HTMLFormElement, InternalFormProps>(
  ({ className, width = 'default', ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(
          width === 'narrow' && "internal-form-narrow",
          width === 'default' && "internal-form",
          width === 'wide' && "internal-form-wide",
          className
        )}
        {...props}
      />
    );
  }
);
InternalForm.displayName = "InternalForm";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM SECTION — Groups related fields with optional header
   ═══════════════════════════════════════════════════════════════════════════ */

interface InternalFormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title (optional) - displayed as subtle header */
  title?: string;
  /** Use uppercase header style for section grouping */
  headerStyle?: 'title' | 'header';
}

const InternalFormSection = React.forwardRef<HTMLDivElement, InternalFormSectionProps>(
  ({ className, title, headerStyle = 'title', children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("internal-form-section", className)} {...props}>
        {title && (
          <div className={headerStyle === 'header' ? "internal-form-section-header" : "internal-form-section-title"}>
            {title}
          </div>
        )}
        {children}
      </div>
    );
  }
);
InternalFormSection.displayName = "InternalFormSection";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM FIELDS — Compact vertical field stack
   ═══════════════════════════════════════════════════════════════════════════ */

const InternalFormFields = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("internal-form-fields", className)} {...props} />
  );
});
InternalFormFields.displayName = "InternalFormFields";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM FIELD — Individual field wrapper (label + input + helper)
   ═══════════════════════════════════════════════════════════════════════════ */

const InternalFormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("internal-form-field", className)} {...props} />
  );
});
InternalFormField.displayName = "InternalFormField";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM LABEL — Concise, factual, always visible
   ═══════════════════════════════════════════════════════════════════════════ */

interface InternalFormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Indicates required field */
  required?: boolean;
}

const InternalFormLabel = React.forwardRef<HTMLLabelElement, InternalFormLabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label ref={ref} className={cn("internal-form-label", className)} {...props}>
        {children}
        {required && <span className="text-muted-foreground ml-0.5">*</span>}
      </label>
    );
  }
);
InternalFormLabel.displayName = "InternalFormLabel";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM HELPER — Minimal, low-contrast, factual
   Only include when strictly necessary for clarity
   ═══════════════════════════════════════════════════════════════════════════ */

const InternalFormHelper = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p ref={ref} className={cn("internal-form-helper", className)} {...props} />
  );
});
InternalFormHelper.displayName = "InternalFormHelper";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM ERROR — Inline, concise, specific
   ═══════════════════════════════════════════════════════════════════════════ */

const InternalFormError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p ref={ref} className={cn("internal-form-error", className)} {...props} />
  );
});
InternalFormError.displayName = "InternalFormError";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM ROW — Horizontal field grouping (2-3 fields)
   ═══════════════════════════════════════════════════════════════════════════ */

interface InternalFormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns: 2 or 3 */
  columns?: 2 | 3;
}

const InternalFormRow = React.forwardRef<HTMLDivElement, InternalFormRowProps>(
  ({ className, columns = 2, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(
          "internal-form-row",
          columns === 2 && "internal-form-row-2",
          columns === 3 && "internal-form-row-3",
          className
        )} 
        {...props} 
      />
    );
  }
);
InternalFormRow.displayName = "InternalFormRow";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM ACTIONS — Button group with proper spacing
   ═══════════════════════════════════════════════════════════════════════════ */

interface InternalFormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout variant */
  variant?: 'default' | 'simple' | 'right' | 'space-between';
}

const InternalFormActions = React.forwardRef<HTMLDivElement, InternalFormActionsProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(
          variant === 'simple' && "internal-form-actions-simple",
          variant === 'right' && "internal-form-actions internal-form-actions-right",
          variant === 'space-between' && "internal-form-actions internal-form-actions-space",
          variant === 'default' && "internal-form-actions",
          className
        )} 
        {...props} 
      />
    );
  }
);
InternalFormActions.displayName = "InternalFormActions";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM DIVIDER — Subtle section separator
   ═══════════════════════════════════════════════════════════════════════════ */

const InternalFormDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("internal-form-divider", className)} {...props} />
  );
});
InternalFormDivider.displayName = "InternalFormDivider";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL FORM INLINE — Key-value or label-action pairs
   ═══════════════════════════════════════════════════════════════════════════ */

const InternalFormInline = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("internal-form-inline", className)} {...props} />
  );
});
InternalFormInline.displayName = "InternalFormInline";

const InternalFormInlineLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span ref={ref} className={cn("internal-form-inline-label", className)} {...props} />
  );
});
InternalFormInlineLabel.displayName = "InternalFormInlineLabel";

const InternalFormInlineValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span ref={ref} className={cn("internal-form-inline-value", className)} {...props} />
  );
});
InternalFormInlineValue.displayName = "InternalFormInlineValue";

export {
  InternalForm,
  InternalFormSection,
  InternalFormFields,
  InternalFormField,
  InternalFormLabel,
  InternalFormHelper,
  InternalFormError,
  InternalFormRow,
  InternalFormActions,
  InternalFormDivider,
  InternalFormInline,
  InternalFormInlineLabel,
  InternalFormInlineValue,
};
