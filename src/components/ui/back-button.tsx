import { useRouteMetadata, RouteScope } from "@/hooks/useRouteMetadata";
import { useScopeTransition, getScopeTransitionLabel } from "@/hooks/useScopeTransition";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  /** Override the label text */
  label?: string;
}

export function BackButton({ showLabel = false, className, label }: BackButtonProps) {
  const { canNavigateBack, navigateToParent, parentLabel } = useRouteMetadata();
  
  if (!canNavigateBack) {
    return null;
  }
  
  const displayLabel = label ?? parentLabel;
  
  return (
    <button
      type="button"
      onClick={navigateToParent}
      className={cn(
        "inline-flex items-center gap-2",
        "text-[13px] text-muted-foreground",
        "hover:text-foreground",
        "transition-colors",
        className
      )}
      aria-label={displayLabel ? `Back to ${displayLabel}` : "Back"}
    >
      <ArrowLeft className="h-4 w-4" />
      {showLabel && displayLabel && (
        <span>{displayLabel}</span>
      )}
    </button>
  );
}

/**
 * SCOPE TRANSITION BUTTON
 * 
 * Purpose: Explicit CTA for crossing scope boundaries.
 * Used for transitions between System Console and Organization workspaces.
 * 
 * Rules:
 * - All scope changes must use explicit CTAs
 * - Scope transitions reset navigation stack, scroll, and UI state
 * - Cross-scope navigation requires this component
 */

interface ScopeTransitionButtonProps {
  /** Target scope to transition to */
  targetScope: "system" | "organization";
  /** Target path within the scope (defaults to scope root) */
  targetPath?: string;
  /** Custom label override */
  label?: string;
  /** Visual variant */
  variant?: "default" | "subtle" | "inline";
  /** Custom class name */
  className?: string;
}

export function ScopeTransitionButton({
  targetScope,
  targetPath,
  label,
  variant = "default",
  className,
}: ScopeTransitionButtonProps) {
  const { currentScope, enterSystemConsole, enterOrganization } = useScopeTransition();
  
  const handleTransition = () => {
    if (targetScope === "system") {
      enterSystemConsole();
    } else {
      enterOrganization(targetPath);
    }
  };
  
  const displayLabel = label ?? getScopeTransitionLabel(currentScope, targetScope);
  
  const baseStyles = "inline-flex items-center gap-2 transition-colors";
  
  const variantStyles = {
    default: cn(
      "px-4 py-2 rounded-lg",
      "bg-card border border-border",
      "text-[13px] text-foreground",
      "hover:bg-muted"
    ),
    subtle: cn(
      "text-[13px] text-muted-foreground",
      "hover:text-foreground"
    ),
    inline: cn(
      "text-[13px] text-muted-foreground",
      "hover:text-foreground underline-offset-4 hover:underline"
    ),
  };
  
  return (
    <button
      type="button"
      onClick={handleTransition}
      className={cn(baseStyles, variantStyles[variant], className)}
      aria-label={displayLabel}
    >
      {variant === "default" && targetScope === "system" && (
        <ArrowLeft className="h-4 w-4" />
      )}
      <span>{displayLabel}</span>
      {variant === "default" && targetScope === "organization" && (
        <ArrowUpRight className="h-4 w-4" />
      )}
    </button>
  );
}

/**
 * Return to Scope Root Button
 * 
 * Convenience component for returning to the root of the current scope.
 */

interface ReturnToScopeRootProps {
  /** Custom label */
  label?: string;
  /** Custom class name */
  className?: string;
}

export function ReturnToScopeRoot({ label, className }: ReturnToScopeRootProps) {
  const { scopeRootPath, currentScope } = useScopeTransition();
  const { navigateToParent, canNavigateBack } = useRouteMetadata();
  
  // If we can navigate back within scope, use that
  if (canNavigateBack) {
    return <BackButton showLabel label={label} className={className} />;
  }
  
  // Otherwise show scope root return
  const displayLabel = label ?? `Return to ${currentScope === "system" ? "Console" : "Overview"}`;
  
  return (
    <a
      href={scopeRootPath}
      className={cn(
        "inline-flex items-center gap-2",
        "text-[13px] text-muted-foreground",
        "hover:text-foreground",
        "transition-colors",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{displayLabel}</span>
    </a>
  );
}
