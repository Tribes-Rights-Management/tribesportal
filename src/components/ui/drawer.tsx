import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

/**
 * DRAWER — INSTITUTIONAL STANDARD (Mobile Bottom Sheet)
 * 
 * Used for mobile modal experiences. Features:
 * - Strong backdrop (85% opacity)
 * - Max height 90vh with internal scroll
 * - Safe-area aware padding
 * - Sticky footer for actions
 */

const Drawer = ({ shouldScaleBackground = false, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

/**
 * DRAWER OVERLAY — INSTITUTIONAL STANDARD (NO GLASS)
 * 
 * - 92% opacity for strong dim (background not readable)
 * - NO blur effects, pure opacity-based dimming
 * - Flat, authoritative backdrop
 */
const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay 
    ref={ref} 
    className={cn("fixed inset-0 z-50 bg-black/92", className)} 
    {...props} 
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

/**
 * DRAWER CONTENT — INSTITUTIONAL STANDARD (SOLID, NO GLASS)
 * 
 * - Max height 90vh with internal scroll
 * - Rounded top corners (12px)
 * - FULLY OPAQUE surface (one elevation step up)
 * - 1px hairline border (white at 8% opacity)
 * - NO translucency, NO backdrop-filter
 */
const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[90vh] flex-col rounded-t-xl overflow-hidden",
        className,
      )}
      style={{
        backgroundColor: '#18181B',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
      }}
      {...props}
    >
      {/* Drag handle */}
      <div className="mx-auto mt-3 h-1.5 w-12 rounded-full shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

/**
 * DRAWER HEADER — INSTITUTIONAL STANDARD
 * 
 * - Left-aligned (never center on mobile)
 * - Consistent padding
 * - Border bottom separates from content
 */
const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("grid gap-1.5 px-5 pt-4 pb-4 text-left", className)} 
    style={{ borderBottom: '1px solid var(--platform-border)' }}
    {...props} 
  />
);
DrawerHeader.displayName = "DrawerHeader";

/**
 * DRAWER FOOTER — INSTITUTIONAL STANDARD
 * 
 * - Sticky at bottom
 * - Border top separates from content
 * - Safe-area aware padding
 */
const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("mt-auto flex flex-col gap-3 px-5 pt-4 pb-5", className)} 
    style={{ 
      borderTop: '1px solid var(--platform-border)',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
    }}
    {...props} 
  />
);
DrawerFooter.displayName = "DrawerFooter";

/**
 * DRAWER TITLE — INSTITUTIONAL STANDARD
 */
const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-[17px] font-semibold leading-tight", className)}
    style={{ color: 'var(--platform-text)' }}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

/**
 * DRAWER DESCRIPTION — INSTITUTIONAL STANDARD
 */
const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description 
    ref={ref} 
    className={cn("text-[14px] leading-normal mt-1", className)} 
    style={{ color: 'var(--platform-text-secondary)' }}
    {...props} 
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

/**
 * DRAWER BODY — INSTITUTIONAL STANDARD
 * 
 * - Scrollable content area
 * - Consistent padding
 */
const DrawerBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("flex-1 overflow-y-auto min-h-0 px-5 py-5", className)} 
    {...props} 
  />
);
DrawerBody.displayName = "DrawerBody";

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
};
