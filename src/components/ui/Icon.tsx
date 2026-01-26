import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, LucideProps } from "lucide-react";

/**
 * GLOBAL ICON UTILITY — STRIPE-GRADE STANDARDIZATION
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * SINGLE SOURCE OF TRUTH FOR ICON SIZING (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SIZE TOKENS:
 * - xs (14px): Dense tables, compact UI, chips
 * - sm (16px): DEFAULT for dropdowns, table actions, form icons
 * - md (18px): Sidebar nav, page actions, header icons
 * - lg (20px): Module cards, feature tiles (MAX allowed)
 * 
 * ENFORCEMENT:
 * - Do NOT use raw size props above 20px
 * - Do NOT use h-6, h-7, h-8, h-10, h-12 on icons
 * - Prefer <Icon /> wrapper or iconClass() helper
 * 
 * USAGE:
 *   import { Icon, iconClass } from "@/components/ui/Icon";
 *   
 *   // Wrapper component
 *   <Icon as={Settings} size="md" className="text-muted-foreground" />
 *   
 *   // Class helper
 *   <Settings className={iconClass("sm")} />
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Size tokens in pixels
export const ICON_SIZES = {
  xs: 14,  // Dense tables, chips
  sm: 16,  // Dropdowns, table actions (default)
  md: 18,  // Sidebar nav, header actions
  lg: 20,  // Module cards, feature tiles (MAX)
} as const;

export type IconSize = keyof typeof ICON_SIZES;

// Stroke widths
export const ICON_STROKES = {
  thin: 1.0,      // Empty states, decorative
  default: 1.25,  // Standard UI
  medium: 1.5,    // Navigation, emphasis
} as const;

export type IconStroke = keyof typeof ICON_STROKES;

/**
 * Returns Tailwind classes for consistent icon sizing
 * 
 * @example
 * <Settings className={iconClass("sm")} />
 * // Returns: "h-4 w-4 shrink-0"
 */
export function iconClass(size: IconSize = "sm"): string {
  const classes: Record<IconSize, string> = {
    xs: "h-3.5 w-3.5 shrink-0",        // 14px
    sm: "h-4 w-4 shrink-0",             // 16px
    md: "h-[18px] w-[18px] shrink-0",   // 18px
    lg: "h-5 w-5 shrink-0",             // 20px
  };
  return classes[size];
}

/**
 * Returns the numeric size value for use with Lucide's size prop
 * 
 * @example
 * <Settings size={iconSize("md")} />
 * // Returns: 18
 */
export function iconSize(size: IconSize = "sm"): number {
  return ICON_SIZES[size];
}

/**
 * Returns the stroke width value
 * 
 * @example
 * <Settings strokeWidth={iconStroke("default")} />
 * // Returns: 1.25
 */
export function iconStroke(stroke: IconStroke = "default"): number {
  return ICON_STROKES[stroke];
}

/**
 * Icon wrapper component for consistent rendering
 * 
 * @example
 * <Icon as={Settings} size="md" stroke="default" className="text-muted-foreground" />
 */
interface IconProps extends Omit<LucideProps, "size" | "strokeWidth"> {
  /** The Lucide icon component */
  as: LucideIcon;
  /** Size variant (xs: 14px, sm: 16px, md: 18px, lg: 20px) */
  size?: IconSize;
  /** Stroke width variant (thin: 1.0, default: 1.25, medium: 1.5) */
  stroke?: IconStroke;
  /** Additional className */
  className?: string;
}

export function Icon({
  as: IconComponent,
  size = "sm",
  stroke = "default",
  className,
  ...props
}: IconProps) {
  return (
    <IconComponent
      size={ICON_SIZES[size]}
      strokeWidth={ICON_STROKES[stroke]}
      className={cn(iconClass(size), className)}
      {...props}
    />
  );
}

/**
 * Empty state icon sizing (slightly larger, thinner stroke)
 * Use for empty state illustrations only
 */
export const EMPTY_STATE_ICON = {
  sm: { size: 20, stroke: 1.0, class: "h-5 w-5" },
  md: { size: 24, stroke: 1.0, class: "h-6 w-6" },
  lg: { size: 28, stroke: 1.0, class: "h-7 w-7" },
} as const;

export type EmptyStateSize = keyof typeof EMPTY_STATE_ICON;

/**
 * Returns classes for empty state icons (allowed to be slightly larger)
 */
export function emptyStateIconClass(size: EmptyStateSize = "md"): string {
  return `${EMPTY_STATE_ICON[size].class} shrink-0`;
}
