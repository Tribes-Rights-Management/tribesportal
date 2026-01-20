import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ICON_SIZE, ICON_STROKE } from "@/styles/tokens";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon component to render (from lucide-react) */
  icon: React.ElementType;
  /** Accessible label for screen readers */
  "aria-label": string;
  /** Optional custom icon size (defaults to 18) */
  iconSize?: number;
  /** Optional custom stroke width (defaults to 1.5) */
  strokeWidth?: number;
}

/**
 * IconButton - Premium Apple-grade icon button
 * 
 * Features:
 * - Uses Button component with icon size variant
 * - 36x36px hit target
 * - 18px icon with 1.5 strokeWidth
 * - Subtle hover state
 * - Focus-visible only ring (no click rings)
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { 
      icon: Icon, 
      className, 
      iconSize = ICON_SIZE, 
      strokeWidth = ICON_STROKE,
      ...props 
    }, 
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("h-9 w-9", className)}
        {...props}
      >
        <Icon size={iconSize} strokeWidth={strokeWidth} />
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";