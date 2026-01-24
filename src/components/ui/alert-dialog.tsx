import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

/**
 * ALERT DIALOG OVERLAY — INSTITUTIONAL STANDARD (NO GLASS)
 * 
 * - 92% opacity on mobile, 88% on desktop (background not readable)
 * - NO blur effects, pure opacity-based dimming
 * - Flat, authoritative backdrop
 */
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/92 sm:bg-black/88 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

/**
 * ALERT DIALOG CONTENT — INSTITUTIONAL STANDARD (SOLID, NO GLASS)
 * 
 * - Max width: 520px
 * - FULLY OPAQUE surface (one elevation step up)
 * - 1px hairline border (white at 8% opacity)
 * - Tight shadow, no glow
 */
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[520px] max-h-[85vh] translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl",
        className,
      )}
      style={{
        backgroundColor: 'var(--background)',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.2)',
      }}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

/**
 * ALERT DIALOG HEADER — INSTITUTIONAL STANDARD
 * 
 * - Left-aligned (never center on mobile)
 * - Consistent padding with border bottom
 */
const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("flex flex-col space-y-1.5 px-5 pt-5 pb-4 text-left", className)} 
    style={{ borderBottom: '1px solid var(--platform-border)' }}
    {...props} 
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

/**
 * ALERT DIALOG FOOTER — INSTITUTIONAL STANDARD
 * 
 * - Sticky on mobile
 * - Primary action right-aligned on desktop, full-width on mobile
 */
const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("flex flex-col gap-3 px-5 pt-4 pb-5 sm:flex-row-reverse sm:gap-2", className)} 
    style={{ 
      borderTop: '1px solid var(--platform-border)',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
    }}
    {...props} 
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

/**
 * ALERT DIALOG TITLE — INSTITUTIONAL STANDARD
 */
const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title 
    ref={ref} 
    className={cn("text-[17px] sm:text-[16px] font-semibold leading-tight", className)} 
    style={{ color: 'var(--platform-text)' }}
    {...props} 
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

/**
 * ALERT DIALOG DESCRIPTION — INSTITUTIONAL STANDARD
 */
const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description 
    ref={ref} 
    className={cn("text-[14px] sm:text-[13px] leading-normal mt-1", className)} 
    style={{ color: 'var(--platform-text-secondary)' }}
    {...props} 
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

/**
 * ALERT DIALOG ACTION — Primary action button
 */
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action 
    ref={ref} 
    className={cn(
      "w-full sm:w-auto h-12 sm:h-11 px-5 rounded-lg text-[15px] sm:text-[14px] font-semibold",
      "flex items-center justify-center transition-all",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      className
    )} 
    style={{
      backgroundColor: 'var(--platform-text)',
      color: 'var(--platform-canvas)',
    }}
    {...props} 
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

/**
 * ALERT DIALOG CANCEL — Secondary action button
 */
const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      "w-full sm:w-auto h-10 sm:h-9 px-4 rounded-lg text-[14px] font-medium transition-colors",
      className
    )}
    style={{ color: 'var(--platform-text-secondary)' }}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

/**
 * ALERT DIALOG BODY — Scrollable content area
 */
const AlertDialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("flex-1 overflow-y-auto min-h-0 px-5 py-5", className)} 
    {...props} 
  />
);
AlertDialogBody.displayName = "AlertDialogBody";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogBody,
};
