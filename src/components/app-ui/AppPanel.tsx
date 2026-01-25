import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { AppButton } from "./AppButton";

/**
 * APP PANEL — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL SLIDE-OUT PANEL COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent slide-out panel for:
 * - Create/edit forms
 * - Detail views
 * - Confirmation dialogs
 * 
 * USAGE:
 *   <AppPanel
 *     open={isOpen}
 *     onClose={() => setIsOpen(false)}
 *     title="New Category"
 *     description="Create a new category"
 *   >
 *     <form>...</form>
 *   </AppPanel>
 * 
 * ENFORCEMENT:
 * - All slide-out panels must use this component
 * - No hardcoded panel styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppPanelProps {
  /** Whether panel is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Panel title */
  title: string;
  /** Optional description */
  description?: string;
  /** Panel width */
  width?: "sm" | "md" | "lg";
  /** Panel content */
  children: React.ReactNode;
  /** Footer content (buttons, etc.) */
  footer?: React.ReactNode;
}

export function AppPanel({
  open,
  onClose,
  title,
  description,
  width = "md",
  children,
  footer,
}: AppPanelProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const widthClasses = {
    sm: "w-[400px]",
    md: "w-[500px]",
    lg: "w-[600px]",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50",
          "flex flex-col",
          "bg-card border-l border-border shadow-2xl",
          "animate-in slide-in-from-right duration-300",
          widthClasses[width]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2
              id="panel-title"
              className="text-[15px] font-semibold text-foreground"
            >
              {title}
            </h2>
            {description && (
              <p className="text-[12px] text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-[6px] hover:bg-[var(--muted-wash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * APP PANEL FOOTER — Common footer layouts
 */

interface AppPanelFooterProps {
  /** Left-side content (delete button, etc.) */
  left?: React.ReactNode;
  /** Cancel handler */
  onCancel: () => void;
  /** Submit handler */
  onSubmit: () => void;
  /** Submit button text */
  submitLabel?: string;
  /** Cancel button text */
  cancelLabel?: string;
  /** Whether submit is in progress */
  submitting?: boolean;
  /** Whether submit is disabled */
  submitDisabled?: boolean;
}

export function AppPanelFooter({
  left,
  onCancel,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  submitting = false,
  submitDisabled = false,
}: AppPanelFooterProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div>{left}</div>
      <div className="flex items-center gap-2">
        <AppButton intent="secondary" size="sm" onClick={onCancel}>
          {cancelLabel}
        </AppButton>
        <AppButton
          intent="primary"
          size="sm"
          onClick={onSubmit}
          disabled={submitting || submitDisabled}
        >
          {submitting ? "Saving..." : submitLabel}
        </AppButton>
      </div>
    </div>
  );
}
