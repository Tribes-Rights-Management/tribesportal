import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox, FileText, Users, FolderOpen, Search } from "lucide-react";

/**
 * APP EMPTY STATE — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL EMPTY STATE COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent empty state display for:
 * - Empty lists
 * - No search results
 * - No data available
 * 
 * USAGE:
 *   <AppEmptyState
 *     icon="inbox"
 *     message="No articles yet"
 *     action={<AppButton>Create Article</AppButton>}
 *   />
 * 
 * ENFORCEMENT:
 * - All empty states must use this component
 * - No inline "No data" text styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

const iconMap = {
  inbox: Inbox,
  file: FileText,
  users: Users,
  folder: FolderOpen,
  search: Search,
};

type IconType = keyof typeof iconMap;

interface AppEmptyStateProps {
  /** Icon to display */
  icon?: IconType;
  /** Custom icon component */
  customIcon?: React.ReactNode;
  /** Main message */
  message: string;
  /** Optional description */
  description?: string;
  /** Optional action button */
  action?: React.ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

export function AppEmptyState({
  icon = "inbox",
  customIcon,
  message,
  description,
  action,
  size = "md",
  className,
}: AppEmptyStateProps) {
  const Icon = iconMap[icon];

  // Reduced empty state icon sizes for Stripe-grade restraint
  // Max icon size: 28px (lg), not 32px
  const sizeClasses = {
    sm: {
      wrapper: "py-8",
      icon: "h-5 w-5",
      message: "text-[12px]",
      description: "text-xs",
    },
    md: {
      wrapper: "py-16",
      icon: "h-6 w-6",
      message: "text-sm",
      description: "text-[12px]",
    },
    lg: {
      wrapper: "py-20",
      icon: "h-6 w-6",
      message: "text-sm",
      description: "text-[13px]",
    },
  };

  const styles = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        styles.wrapper,
        className
      )}
    >
      {customIcon ? (
        <div className="mb-3 text-muted-foreground/40">{customIcon}</div>
      ) : (
        <Icon
          className={cn(styles.icon, "text-muted-foreground/40 mb-3")}
          strokeWidth={1.25}
        />
      )}
      <p className={cn(styles.message, "text-muted-foreground/60 font-medium")}>
        {message}
      </p>
      {description && (
        <p className={cn(styles.description, "text-muted-foreground/70 mt-1 max-w-xs")}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
