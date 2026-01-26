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
        // Institutional-grade padding: p-7 mobile, p-8 desktop for premium breathing room
        "group relative flex flex-col h-[200px] p-7 md:p-8 rounded-xl overflow-hidden",
        "border transition-all duration-150",
        disabled
          ? "opacity-60 cursor-not-allowed border-[var(--border-subtle)]"
          : "cursor-pointer border-[var(--border-subtle)] hover:border-neutral-300 hover:shadow-sm"
      )}
      style={{
        backgroundColor: "var(--card-bg)",
      }}
    >
      {/* Top row: Icon (no background) + Chevron/Lock */}
      <div className="flex items-start justify-between shrink-0">
        {/* Icon directly on card surface - lg size (20px MAX) */}
        <Icon
          className="h-5 w-5 shrink-0"
          strokeWidth={1.5}
          style={{ color: "var(--text-muted)" }}
        />

        {/* Chevron or Lock with comfortable right position */}
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

      {/* Content: Title + Description - centered vertically for balanced spacing */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <h3
          className="text-[15px] font-semibold leading-tight truncate"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h3>
        <p
          className="text-[13px] leading-relaxed mt-2.5 line-clamp-2 break-words"
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
