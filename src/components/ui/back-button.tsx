import { useRouteMetadata } from "@/hooks/useRouteMetadata";
import { ArrowLeft } from "lucide-react";

/**
 * SCOPE-SAFE BACK BUTTON
 * 
 * Purpose: Navigate to explicit parent route, not browser history.
 * 
 * Rules (from Navigation Map Registry):
 * - Back arrow always navigates to declared parent route
 * - Back behavior never relies on browser history
 * - Back navigation never skips levels or returns to higher scope
 * 
 * Usage:
 * ```tsx
 * <BackButton />
 * // or with custom label
 * <BackButton showLabel />
 * ```
 */

interface BackButtonProps {
  /** Show parent label next to icon */
  showLabel?: boolean;
  /** Custom class name */
  className?: string;
}

export function BackButton({ showLabel = false, className }: BackButtonProps) {
  const { canNavigateBack, navigateToParent, parentLabel } = useRouteMetadata();
  
  if (!canNavigateBack) {
    return null;
  }
  
  return (
    <button
      type="button"
      onClick={navigateToParent}
      className={`
        inline-flex items-center gap-2 
        text-[13px] text-muted-foreground 
        hover:text-foreground 
        transition-colors
        ${className ?? ""}
      `}
      aria-label={parentLabel ? `Back to ${parentLabel}` : "Back"}
    >
      <ArrowLeft className="h-4 w-4" />
      {showLabel && parentLabel && (
        <span>{parentLabel}</span>
      )}
    </button>
  );
}
