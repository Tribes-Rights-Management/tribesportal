import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SECTION PANEL — Stripe-like Grey Panel (Mercury/Stripe Design System)
 * 
 * Creates a light grey panel surface for grouping content sections.
 * Use this for dashboard blocks, summary sections, or content groupings
 * that need visual separation from the white canvas.
 * 
 * Surface hierarchy:
 * - Page canvas: white (--page-bg)
 * - Section panel: light grey (--panel-bg)  <-- This component
 * - Cards inside: white (--card-bg)
 * 
 * Usage:
 * <SectionPanel>
 *   <Card>Content here</Card>
 * </SectionPanel>
 */

interface SectionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to add subtle border around the panel */
  bordered?: boolean;
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING_MAP = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function SectionPanel({
  children,
  className,
  bordered = true,
  padding = "md",
  style,
  ...props
}: SectionPanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg",
        PADDING_MAP[padding],
        className
      )}
      style={{
        backgroundColor: "var(--panel-bg)",
        border: bordered ? "1px solid var(--border-subtle)" : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default SectionPanel;
