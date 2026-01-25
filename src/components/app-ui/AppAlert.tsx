import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * APP ALERT — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL ALERT COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent alert/notification display for:
 * - Error messages
 * - Warnings
 * - Success messages
 * - Info notices
 * 
 * USAGE:
 *   <AppAlert
 *     variant="error"
 *     message="Unable to load data"
 *     onRetry={handleRetry}
 *   />
 * 
 * ENFORCEMENT:
 * - All inline alerts must use this component
 * - No hardcoded error/warning styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

type AlertVariant = "error" | "warning" | "success" | "info";

const variantConfig = {
  error: {
    icon: AlertCircle,
    containerClass: "bg-destructive/10 border-l-destructive",
    iconClass: "text-destructive",
    textClass: "text-foreground",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "bg-warning/10 border-l-warning",
    iconClass: "text-warning",
    textClass: "text-foreground",
  },
  success: {
    icon: CheckCircle,
    containerClass: "bg-success/10 border-l-success",
    iconClass: "text-success",
    textClass: "text-foreground",
  },
  info: {
    icon: Info,
    containerClass: "bg-info/10 border-l-info",
    iconClass: "text-info",
    textClass: "text-foreground",
  },
};

interface AppAlertProps {
  /** Alert variant */
  variant: AlertVariant;
  /** Main message */
  message: string;
  /** Optional description */
  description?: string;
  /** Optional retry handler (shows retry button) */
  onRetry?: () => void;
  /** Optional dismiss handler (shows close button) */
  onDismiss?: () => void;
  /** Additional className */
  className?: string;
}

export function AppAlert({
  variant,
  message,
  description,
  onRetry,
  onDismiss,
  className,
}: AppAlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-r border-l-2",
        config.containerClass,
        className
      )}
      role="alert"
    >
      <Icon
        className={cn("h-4 w-4 shrink-0 mt-0.5", config.iconClass)}
        strokeWidth={1.5}
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-[13px] font-medium", config.textClass)}>
          {message}
        </p>
        {description && (
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {description}
          </p>
        )}
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className={cn("text-[12px] mt-2 h-auto py-1 px-2", config.iconClass)}
          >
            <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
            Try again
          </Button>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-auto p-1"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
      )}
    </div>
  );
}
