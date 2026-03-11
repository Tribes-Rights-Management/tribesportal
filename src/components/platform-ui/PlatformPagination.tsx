import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * APP PAGINATION — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL PAGINATION COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Minimal text-based pagination with:
 * - Previous button (left)
 * - Page info (center)
 * - Next button (right)
 * 
 * USAGE:
 *   <AppPagination
 *     currentPage={page}
 *     totalPages={10}
 *     onPageChange={setPage}
 *   />
 * 
 * ENFORCEMENT:
 * - All pagination must use this component
 * - No hardcoded pagination styling
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppPaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Additional className */
  className?: string;
}

export function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: AppPaginationProps) {
  if (totalPages <= 1) return null;

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={cn("flex items-center justify-between py-3", className)}>
      {/* Previous */}
      <button
        onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className={cn(
          "flex items-center gap-1 text-sm transition-colors",
          canGoPrevious
            ? "text-muted-foreground hover:text-foreground"
            : "text-muted-foreground/40 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </button>

      {/* Page Info */}
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>

      {/* Next */}
      <button
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className={cn(
          "flex items-center gap-1 text-sm transition-colors",
          canGoNext
            ? "text-muted-foreground hover:text-foreground"
            : "text-muted-foreground/40 cursor-not-allowed"
        )}
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
