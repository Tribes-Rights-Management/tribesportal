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

  const sizeClasses = {
    sm: {
      wrapper: "py-6",
      icon: "h-6 w-6",
      message: "text-[12px]",
      description: "text-[11px]",
    },
    md: {
      wrapper: "py-10",
      icon: "h-7 w-7",
      message: "text-[13px]",
      description: "text-[12px]",
    },
    lg: {
      wrapper: "py-16",
      icon: "h-8 w-8",
      message: "text-[14px]",
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
          strokeWidth={1.0}
        />
      )}
      <p className={cn(styles.message, "text-muted-foreground font-medium")}>
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
