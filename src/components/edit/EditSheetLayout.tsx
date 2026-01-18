import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetPortal,
  SheetOverlay,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";

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
 * - Mobile: Full-height bottom sheet (100dvh with safe-area)
 * 
 * STRUCTURE:
 * - Top: Back arrow + parent context label
 * - Body: Title + helper text + single control
 * - Bottom: Sticky Cancel/Save actions (keyboard-safe)
 * 
 * STYLING (NON-NEGOTIABLE):
 * - Background: Fully opaque (no glass, no blur, no translucency)
 * - Borders: 1px solid rgba(255,255,255,0.14) on all inputs
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

  const handleOpenChange = (newOpen: boolean) => {
    if (preventClose && !newOpen) return;
    onOpenChange(newOpen);
  };

  const handleBack = () => {
    if (preventClose) return;
    onOpenChange(false);
  };

  // Shared content structure
  const sheetContent = (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div 
        className="flex items-center gap-3 px-5 pt-5 pb-4 shrink-0"
        style={{ borderBottom: '1px solid var(--platform-border)' }}
      >
        <button
          type="button"
          onClick={handleBack}
          disabled={preventClose}
          className="h-10 w-10 -ml-2 flex items-center justify-center rounded-lg transition-colors hover:bg-white/[0.05] disabled:opacity-50"
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
          className="text-[20px] font-semibold mb-2"
          style={{ color: 'var(--platform-text)' }}
        >
          {title}
        </h2>
        
        {/* Helper text */}
        {helperText && (
          <p 
            className="text-[13px] mb-6"
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

  // Mobile: Full-height drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent 
          className="h-[100dvh] flex flex-col"
          style={{ 
            backgroundColor: 'var(--platform-canvas)',
          }}
        >
          {sheetContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Side panel
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetPortal>
        {/* Fully opaque overlay */}
        <SheetOverlay 
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
        />
        <SheetContent 
          side="right"
          className={cn(
            "w-[400px] max-w-full flex flex-col h-full p-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          )}
          style={{ 
            backgroundColor: 'var(--platform-canvas)',
            borderLeft: '1px solid var(--platform-border)',
          }}
          onPointerDownOutside={(e) => preventClose && e.preventDefault()}
          onEscapeKeyDown={(e) => preventClose && e.preventDefault()}
        >
          {sheetContent}
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
