import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EDIT SHEET LAYOUT — CANONICAL EDIT FLOW SYSTEM (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * The single, unified edit surface for ALL edit interactions in Tribes.
 * No floating modals. Full-height sheet. Background completely obscured.
 * 
 * RENDERING:
 * - Desktop: Full-height side panel (right edge, 400px width)
 * - Mobile: Full-height overlay (100dvh with safe-area)
 * 
 * STRUCTURE:
 * - Top: Back arrow + parent context label
 * - Body: Title + helper text + single control
 * - Bottom: Sticky Cancel/Save actions (keyboard-safe)
 * 
 * STYLING (NON-NEGOTIABLE):
 * - Background: Fully opaque (no glass, no blur, no translucency)
 * - Inputs: Use canonical --edit-input-* tokens
 * - Backdrop: 100% opacity to completely obscure background
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// TYPES
// ============================================================================

interface EditSheetLayoutProps {
  /** Controls sheet visibility */
  open: boolean;
  /** Callback when sheet should close */
  onOpenChange: (open: boolean) => void;
  /** Parent context label (shown next to back arrow) */
  parentLabel: string;
  /** Field title (main heading) */
  title: string;
  /** Helper text under title (one sentence max) */
  helperText?: string;
  /** The edit control content */
  children: React.ReactNode;
  /** Footer actions (typically EditActionsBar) */
  footer: React.ReactNode;
  /** Prevent closing (e.g., during save) */
  preventClose?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EditSheetLayout({
  open,
  onOpenChange,
  parentLabel,
  title,
  helperText,
  children,
  footer,
  preventClose = false,
}: EditSheetLayoutProps) {
  const isMobile = useIsMobile();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Scroll to top when opened
  React.useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [open]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const handleBack = () => {
    if (preventClose) return;
    onOpenChange(false);
  };

  // Handle escape key
  React.useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, preventClose, onOpenChange]);

  if (!open) return null;

  // Shared content structure
  const sheetContent = (
    <div className="flex flex-col h-full">
      {/* Drag handle affordance (mobile-grade polish) */}
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div 
          className="w-10 h-1 rounded-full"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)' }}
          aria-hidden="true"
        />
      </div>

      {/* Header with back button */}
      <div 
        className="flex items-center gap-3 px-5 pt-2 pb-4 shrink-0"
        style={{ borderBottom: '1px solid var(--platform-border)' }}
      >
        <button
          type="button"
          onClick={handleBack}
          disabled={preventClose}
          className="h-11 w-11 -ml-2 flex items-center justify-center rounded-xl transition-colors hover:bg-white/[0.05] disabled:opacity-50"
          style={{ color: 'var(--platform-text-secondary)' }}
          aria-label={`Back to ${parentLabel}`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span 
          className="text-[15px] font-medium"
          style={{ color: 'var(--platform-text-secondary)' }}
        >
          {parentLabel}
        </span>
      </div>

      {/* Scrollable body */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto min-h-0 px-5 pt-6 pb-6"
      >
        {/* Title */}
        <h2 
          className="text-[22px] font-semibold mb-2"
          style={{ color: 'var(--platform-text)' }}
        >
          {title}
        </h2>
        
        {/* Helper text */}
        {helperText && (
          <p 
            className="text-[14px] mb-6 leading-relaxed"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            {helperText}
          </p>
        )}

        {/* Control content */}
        {children}
      </div>

      {/* Sticky footer */}
      {footer}
    </div>
  );

  return (
    <>
      {/* Backdrop - fully opaque */}
      <div 
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.96)' }}
        onClick={() => !preventClose && onOpenChange(false)}
        aria-hidden="true"
      />
      
      {/* Sheet content */}
      <div
        className={cn(
          "fixed z-50 flex flex-col",
          "animate-in duration-200",
          isMobile 
            ? "inset-0 slide-in-from-bottom-4" 
            : "right-0 top-0 bottom-0 w-[420px] max-w-full slide-in-from-right-4"
        )}
        style={{ 
          backgroundColor: 'var(--platform-canvas)',
          borderLeft: isMobile ? 'none' : '1px solid var(--platform-border)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-sheet-title"
      >
        {sheetContent}
      </div>
    </>
  );
}
