import * as React from "react";
import { cn } from "@/lib/utils";
import { AppButton } from "./AppButton";

/**
 * APP PAGINATION — GLOBAL UI KIT (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL PAGINATION COMPONENT (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Consistent pagination styling with:
 * - Page info display
 * - Previous/Next buttons
 * - Theme-aware colors
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
  /** Show page info text */
  showInfo?: boolean;
  /** Additional className */
  className?: string;
}

export function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  className,
}: AppPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between mt-4", className)}>
      {showInfo && (
        <p className="text-[12px] text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
      )}
      <div className={cn("flex gap-2", !showInfo && "ml-auto")}>
        <AppButton
          variant="secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </AppButton>
        <AppButton
          variant="secondary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </AppButton>
      </div>
    </div>
  );
}
