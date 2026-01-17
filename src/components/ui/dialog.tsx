import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

/**
 * DIALOG OVERLAY — INSTITUTIONAL STANDARD (NO GLASS)
 * 
 * Flat, opaque backdrop with NO blur:
 * - Mobile: 92% opacity (background content not readable)
 * - Desktop: 88% opacity (strong dim, still authoritative)
 * - NO backdrop-filter, NO blur effects
 * - Pure opacity-based dimming for institutional authority
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/92 sm:bg-black/88 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideDefaultClose?: boolean;
  overlayClassName?: string;
}

/**
 * DIALOG CONTENT — INSTITUTIONAL STANDARD (SOLID, NO GLASS)
 * 
 * - Max width: 520px default (forms), configurable via className
 * - Max height: 85vh with internal scroll
 * - Surface: FULLY OPAQUE, one elevation step lighter than page
 * - Border: 1px hairline (white at 8% opacity)
 * - Shadow: tight spread, no glow
 * - Radius: 12px (consistent with card tokens)
 * - NO translucency, NO backdrop-filter
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, hideDefaultClose = false, overlayClassName, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className={overlayClassName} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[520px] max-h-[85vh] translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl",
        className,
      )}
      style={{
        backgroundColor: '#18181B',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.2)',
      }}
      {...props}
    >
      {children}
      {!hideDefaultClose && (
        <DialogPrimitive.Close 
          className="absolute right-3 top-3 h-11 w-11 rounded-lg flex items-center justify-center opacity-60 transition-all hover:opacity-100 hover:bg-white/[0.05] focus:outline-none focus-visible:bg-white/[0.08] disabled:pointer-events-none"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * DIALOG HEADER — INSTITUTIONAL STANDARD
 * 
 * - Always left-aligned (never center on mobile)
 * - Padding: 20-24px
 * - Border bottom separates from content
 */
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("flex flex-col space-y-1.5 px-5 pt-5 pb-4 text-left", className)} 
    style={{ borderBottom: '1px solid var(--platform-border)' }}
    {...props} 
  />
);
DialogHeader.displayName = "DialogHeader";

/**
 * DIALOG FOOTER — INSTITUTIONAL STANDARD
 * 
 * - Sticky on mobile (always accessible)
 * - Border top separates from content
 * - Primary action right-aligned on desktop, full-width on mobile
 * - Safe-area aware padding
 */
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("flex flex-col gap-3 px-5 pt-4 pb-5 sm:flex-row-reverse sm:gap-2", className)} 
    style={{ 
      borderTop: '1px solid var(--platform-border)',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
    }}
    {...props} 
  />
);
DialogFooter.displayName = "DialogFooter";

/**
 * DIALOG TITLE — INSTITUTIONAL STANDARD
 * 
 * - 17px mobile, 16px desktop
 * - Semibold, tight leading
 * - Platform text color
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-[17px] sm:text-[16px] font-semibold leading-tight", className)}
    style={{ color: 'var(--platform-text)' }}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * DIALOG DESCRIPTION — INSTITUTIONAL STANDARD
 * 
 * - 14px mobile, 13px desktop
 * - Secondary text color
 * - Normal line height for readability
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description 
    ref={ref} 
    className={cn("text-[14px] sm:text-[13px] leading-normal mt-1", className)} 
    style={{ color: 'var(--platform-text-secondary)' }}
    {...props} 
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

/**
 * DIALOG BODY — INSTITUTIONAL STANDARD
 * 
 * - Scrollable content area
 * - Consistent padding
 * - Min-h-0 for proper flex scrolling
 */
const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("flex-1 overflow-y-auto min-h-0 px-5 py-5", className)} 
    {...props} 
  />
);
DialogBody.displayName = "DialogBody";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
};
