import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * APP SHEET — UNIFIED SIDE PANEL SYSTEM (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Use AppSheet for long settings/details, multi-section content, heavy scrolling.
 * For forms and confirmations, use AppDialog instead.
 * 
 * RENDERING:
 * - Desktop: Side panel (right edge, 480px default width)
 * - Mobile: Full-height bottom sheet (100vh with safe-area)
 * 
 * SURFACE STYLING (NON-NEGOTIABLE):
 * - Background: Fully opaque #18181B (no glass, no blur, no translucency)
 * - Border: 1px neutral gray at 8% opacity (subtle plane separation)
 * - Backdrop: 92% opacity on mobile, 88% on desktop (no blur)
 * 
 * Usage:
 * <AppSheet open={open} onOpenChange={setOpen} title="Settings">
 *   <AppSheetBody>Content here</AppSheetBody>
 *   <AppSheetFooter>Footer actions</AppSheetFooter>
 * </AppSheet>
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// TYPES
// ============================================================================

interface AppSheetProps {
  /** Controls sheet visibility */
  open: boolean;
  /** Callback when sheet should close */
  onOpenChange: (open: boolean) => void;
  /** Sheet title (required for accessibility) */
  title: string;
  /** Optional subtitle/description */
  description?: string;
  /** Sheet content */
  children: React.ReactNode;
  /** Width on desktop (default: 480px) */
  width?: "sm" | "md" | "lg" | "xl";
  /** Side on desktop (default: right) */
  side?: "left" | "right";
  /** Prevent closing (e.g., during save) */
  preventClose?: boolean;
  /** Additional className for the content container */
  className?: string;
}

interface AppSheetBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface AppSheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface AppSheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WIDTH_MAP = {
  sm: "w-[360px]",
  md: "w-[480px]",
  lg: "w-[560px]",
  xl: "w-[640px]",
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AppSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  width = "md",
  side = "right",
  preventClose = false,
  className,
}: AppSheetProps) {
  const isMobile = useIsMobile();

  const handleOpenChange = (newOpen: boolean) => {
    if (preventClose && !newOpen) return;
    onOpenChange(newOpen);
  };

  // Mobile: Full-height bottom sheet (Drawer)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent 
          className={cn("flex flex-col h-[100dvh]", className)}
        >
          <DrawerClose 
            className="absolute top-3 right-3 h-11 w-11 rounded-lg flex items-center justify-center z-10 transition-colors hover:bg-white/[0.05] focus:outline-none focus-visible:bg-white/[0.08]"
            style={{ color: 'var(--platform-text-muted)' }}
            aria-label="Close"
            disabled={preventClose}
          >
            <X className="h-5 w-5" />
          </DrawerClose>
          
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Side panel (Sheet)
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent 
        side={side}
        className={cn(WIDTH_MAP[width], "flex flex-col h-full", className)}
        onPointerDownOutside={(e) => preventClose && e.preventDefault()}
        onEscapeKeyDown={(e) => preventClose && e.preventDefault()}
      >
        <SheetClose 
          className="absolute top-3 right-3 h-11 w-11 rounded-lg flex items-center justify-center z-10 transition-colors opacity-60 hover:opacity-100 hover:bg-white/[0.05] focus:outline-none focus-visible:bg-white/[0.08]"
          style={{ color: 'var(--platform-text-muted)' }}
          aria-label="Close"
          disabled={preventClose}
        >
          <X className="h-5 w-5" />
        </SheetClose>
        
        <SheetHeader className="pr-12">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        
        {children}
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * APP SHEET BODY — Scrollable content area
 */
export function AppSheetBody({ children, className, ...props }: AppSheetBodyProps) {
  return (
    <div 
      className={cn("flex-1 overflow-y-auto min-h-0 px-5 py-5", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * APP SHEET FOOTER — Sticky action bar
 */
export function AppSheetFooter({ children, className, ...props }: AppSheetFooterProps) {
  return (
    <div 
      className={cn(
        "flex flex-col gap-3 px-5 pt-4 pb-5 sm:flex-row-reverse sm:gap-2",
        className
      )} 
      style={{ 
        borderTop: '1px solid var(--platform-border)',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * APP SHEET HEADER — Custom header section
 * Use when you need more than title/description
 */
export function AppSheetHeader({ children, className, ...props }: AppSheetHeaderProps) {
  return (
    <div 
      className={cn("px-5 pt-5 pb-4", className)} 
      style={{ borderBottom: '1px solid var(--platform-border)' }}
      {...props}
    >
      {children}
    </div>
  );
}
