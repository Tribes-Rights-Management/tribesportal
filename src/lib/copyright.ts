/**
 * Copyright Line Utility - SINGLE SOURCE OF TRUTH
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DO NOT HARDCODE YEARS ANYWHERE ELSE IN THE CODEBASE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This utility generates the canonical copyright line for:
 * - Website footers (PublicLayout, DashboardLayout)
 * - License Package PDFs (cover page + individual license pages)
 * - Single License PDFs
 * - Admin export layouts
 * - Any other location requiring a copyright notice
 *
 * FORMAT:
 * - Single current year only (no ranges)
 * - Example: "© 2026 Tribes Rights Management LLC. All rights reserved."
 *
 * USAGE:
 * - UI components: getCopyrightLine() uses client Date
 * - Server/Edge functions: getCopyrightLine(serverYear) for consistency
 * - PDFs: Always prefer server-provided year to avoid client clock drift
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Legal entity name for copyright notices */
export const COPYRIGHT_ENTITY = "Tribes Rights Management LLC";

/**
 * Generates the full copyright line with dynamic current year.
 *
 * @param currentYear - Optional override for current year (use for server-side generation)
 * @param includeRightsReserved - Whether to include "All rights reserved." suffix
 * @returns Formatted copyright string with current year only
 *
 * @example
 * // Client-side (uses system date)
 * getCopyrightLine() // "© 2026 Tribes Rights Management LLC. All rights reserved."
 *
 * @example
 * // Server-side (explicit year)
 * getCopyrightLine(2027) // "© 2027 Tribes Rights Management LLC. All rights reserved."
 *
 * @example
 * // Without "All rights reserved"
 * getCopyrightLine(undefined, false) // "© 2026 Tribes Rights Management LLC"
 */
export function getCopyrightLine(
  currentYear?: number,
  includeRightsReserved: boolean = true
): string {
  const year = currentYear ?? new Date().getFullYear();

  const base = `© ${year} ${COPYRIGHT_ENTITY}`;

  return includeRightsReserved
    ? `${base}. All rights reserved.`
    : base;
}

/**
 * Generates just the year portion for custom formatting.
 *
 * @param currentYear - Optional override for current year
 * @returns Current year string (e.g., "2026")
 */
export function getCopyrightYear(currentYear?: number): string {
  const year = currentYear ?? new Date().getFullYear();
  return `${year}`;
}
