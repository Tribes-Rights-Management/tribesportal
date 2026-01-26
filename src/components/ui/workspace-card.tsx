import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Lock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SHARED WORKSPACE CARD — STRIPE-LEVEL MODULE LAUNCHER
 * 
 * Centralized module tile component with consistent styling.
 * Used on /workspaces page for module navigation.
 * 
 * Specs:
 * - Height: 156px fixed
 * - Padding: 20px
 * - Icon container: 40px square, 12px radius
 * - Title: 16px semibold
 * - Description: 13px, 2-line clamp
 * - Border: 1px subtle, darkens on hover
 * - Shadow: subtle on hover
 */

interface WorkspaceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  disabled?: boolean;
}

export function WorkspaceCard({
  title,
  description,
  icon: Icon,
  href,
  disabled = false,
}: WorkspaceCardProps) {
  const cardContent = (
    <div
      className={cn(
        // Fixed height, overflow protection, padding
        "group relative flex flex-col h-[156px] p-5 rounded-xl overflow-hidden",
        "border transition-all duration-150",
        disabled
          ? "opacity-60 cursor-not-allowed border-[var(--border-subtle)]"
          : "cursor-pointer border-[var(--border-subtle)] hover:border-neutral-300 hover:shadow-sm"
      )}
      style={{
        backgroundColor: "var(--card-bg)",
      }}
    >
      {/* Top row: Icon chip + Chevron/Lock */}
      <div className="flex items-start justify-between shrink-0">
        {/* Icon container: 40px, soft gray, radius 12px */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{ backgroundColor: "var(--muted-wash)" }}
        >
          <Icon
            className="h-5 w-5 shrink-0"
            strokeWidth={1.5}
            style={{ color: "var(--text-muted)" }}
          />
        </div>

        {/* Chevron or Lock */}
        {disabled ? (
          <Lock
            className="h-4 w-4 shrink-0"
            strokeWidth={1.5}
            style={{ color: "var(--text-muted)" }}
          />
        ) : (
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-150",
              "group-hover:translate-x-0.5"
            )}
            strokeWidth={1.5}
            style={{ color: "var(--text-muted)" }}
          />
        )}
      </div>

      {/* Content: Title + Description — with overflow protection */}
      <div className="flex-1 flex flex-col justify-end min-w-0 mt-3">
        <h3
          className="text-base font-semibold leading-tight truncate"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h3>
        <p
          className="text-[13px] leading-snug mt-1.5 line-clamp-2 break-words min-h-[2.5em]"
          style={{ color: "var(--text-muted)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );

  if (disabled) {
    return cardContent;
  }

  return (
    <Link
      to={href}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 rounded-xl"
    >
      {cardContent}
    </Link>
  );
}
