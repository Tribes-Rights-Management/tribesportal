import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * APP PAGE CONTAINER — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL PAGE WRAPPER COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent page wrapper with:
 * - Responsive padding (p-4 sm:p-6 lg:p-8)
 * - Optional max-width constraint
 * - Horizontal centering
 * 
 * USAGE:
 *   <AppPageContainer maxWidth="lg">
 *     <AppPageHeader title="Page Title" />
 *     <AppCard>...</AppCard>
 *   </AppPageContainer>
 * 
 * ENFORCEMENT:
 * - All pages must use this component for layout
 * - No one-off container padding
 * ═══════════════════════════════════════════════════════════════════════════
 */

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface AppPageContainerProps {
  /** Page content */
  children: React.ReactNode;
  /** Maximum width constraint */
  maxWidth?: MaxWidth;
  /** Additional className */
  className?: string;
}

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-full",
};

export function AppPageContainer({
  children,
  maxWidth = "xl",
  className,
}: AppPageContainerProps) {
  return (
    <div 
      className={cn(
        "p-4 sm:p-6 lg:p-8 mx-auto w-full",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
