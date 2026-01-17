import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
 * APP MODAL — UNIFIED INSTITUTIONAL MODAL SYSTEM
 * 
 * This is the CANONICAL modal component for the entire application.
 * It automatically renders as:
 * - Desktop/Tablet: Centered dialog (max-width 520px default)
 * - Mobile: Bottom sheet (max-height 90vh)
 * 
 * Features:
 * - Consistent header/footer patterns
 * - Strong backdrop (85% opacity on mobile, 80% on desktop)
 * - Sticky footer on mobile
 * - Safe-area aware padding
 * - Focus trap and ESC to close
 * - Body scroll lock
 * 
 * Usage:
 * <AppModal open={open} onOpenChange={setOpen} title="Modal Title">
 *   <AppModalBody>Content here</AppModalBody>
 *   <AppModalFooter>
 *     <AppModalCancel>Cancel</AppModalCancel>
 *     <AppModalAction>Confirm</AppModalAction>
 *   </AppModalFooter>
 * </AppModal>
 */

// ============================================================================
// TYPES
// ============================================================================

interface AppModalProps {
  /** Controls modal visibility */
  open: boolean;
  /** Callback when modal should close */
  onOpenChange: (open: boolean) => void;
  /** Modal title (required for accessibility) */
  title: string;
  /** Optional subtitle/description */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Max width on desktop (default: 520px) */
  maxWidth?: "sm" | "md" | "lg" | "xl";
  /** Prevent closing (e.g., during save) */
  preventClose?: boolean;
  /** Additional className for the content container */
  className?: string;
}

interface AppModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface AppModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface AppModalActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "destructive";
}

interface AppModalCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_WIDTH_MAP = {
  sm: "max-w-[400px]",
  md: "max-w-[520px]",
  lg: "max-w-[640px]",
  xl: "max-w-[720px]",
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "md",
  preventClose = false,
  className,
}: AppModalProps) {
  const isMobile = useIsMobile();

  const handleOpenChange = (newOpen: boolean) => {
    if (preventClose && !newOpen) return;
    onOpenChange(newOpen);
  };

  // Mobile: Bottom sheet (Drawer)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className={cn("flex flex-col", className)}>
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

  // Desktop: Centered dialog
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={cn(MAX_WIDTH_MAP[maxWidth], "flex flex-col", className)}
        hideDefaultClose
        onPointerDownOutside={(e) => preventClose && e.preventDefault()}
        onEscapeKeyDown={(e) => preventClose && e.preventDefault()}
      >
        <DialogClose 
          className="absolute top-3 right-3 h-11 w-11 rounded-lg flex items-center justify-center z-10 transition-colors opacity-60 hover:opacity-100 hover:bg-white/[0.05] focus:outline-none focus-visible:bg-white/[0.08]"
          style={{ color: 'var(--platform-text-muted)' }}
          aria-label="Close"
          disabled={preventClose}
        >
          <X className="h-5 w-5" />
        </DialogClose>
        
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        {children}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * APP MODAL BODY — Scrollable content area
 */
export function AppModalBody({ children, className, ...props }: AppModalBodyProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <DrawerBody className={className} {...props}>{children}</DrawerBody>;
  }
  
  return <DialogBody className={className} {...props}>{children}</DialogBody>;
}

/**
 * APP MODAL FOOTER — Sticky action bar
 */
export function AppModalFooter({ children, className, ...props }: AppModalFooterProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <DrawerFooter className={className} {...props}>{children}</DrawerFooter>;
  }
  
  return <DialogFooter className={className} {...props}>{children}</DialogFooter>;
}

/**
 * APP MODAL ACTION — Primary action button
 * 
 * - Full width on mobile
 * - Loading state with spinner
 * - Disabled until valid
 */
export function AppModalAction({
  children,
  loading = false,
  loadingText,
  variant = "primary",
  disabled,
  className,
  ...props
}: AppModalActionProps) {
  const isDisabled = disabled || loading;
  
  const baseStyles = cn(
    "w-full sm:w-auto h-12 sm:h-11 px-5 rounded-lg text-[15px] sm:text-[14px] font-semibold",
    "flex items-center justify-center gap-2 transition-all",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    className
  );
  
  const variantStyles = {
    primary: {
      backgroundColor: isDisabled ? 'rgba(255,255,255,0.1)' : 'var(--platform-text)',
      color: isDisabled ? 'var(--platform-text-muted)' : 'var(--platform-canvas)',
    },
    destructive: {
      backgroundColor: isDisabled ? 'rgba(239,68,68,0.2)' : '#ef4444',
      color: isDisabled ? 'rgba(239,68,68,0.5)' : '#ffffff',
    },
  };

  return (
    <button
      className={baseStyles}
      style={variantStyles[variant]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * APP MODAL CANCEL — Secondary action button
 * 
 * - Text button style (not equal visual weight to primary)
 * - Full width on mobile, auto on desktop
 */
export function AppModalCancel({
  children,
  className,
  disabled,
  ...props
}: AppModalCancelProps) {
  return (
    <button
      className={cn(
        "w-full sm:w-auto h-10 sm:h-9 px-4 rounded-lg text-[14px] font-medium",
        "transition-colors disabled:opacity-40",
        className
      )}
      style={{ color: 'var(--platform-text-secondary)' }}
      disabled={disabled}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.color = 'var(--platform-text)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--platform-text-secondary)')}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// FORM UTILITIES
// ============================================================================

interface AppModalFieldProps {
  label: string;
  htmlFor?: string;
  error?: string | null;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * APP MODAL FIELD — Consistent form field wrapper
 * 
 * - Visible label (never placeholder-as-label)
 * - 8-12px label → input spacing
 * - Inline error below field
 * - Help text wraps naturally
 */
export function AppModalField({
  label,
  htmlFor,
  error,
  helpText,
  children,
  className,
}: AppModalFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={htmlFor}
        className="block text-[14px] font-medium"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {label}
      </label>
      
      {children}
      
      {error ? (
        <p className="text-[13px] leading-relaxed text-red-400">
          {error}
        </p>
      ) : helpText ? (
        <p 
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--platform-text-muted)', opacity: 0.85 }}
        >
          {helpText}
        </p>
      ) : null}
    </div>
  );
}

/**
 * APP MODAL FIELDS — Container for multiple fields
 * 
 * - 16-20px spacing between fields
 */
export function AppModalFields({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-5", className)}>
      {children}
    </div>
  );
}
