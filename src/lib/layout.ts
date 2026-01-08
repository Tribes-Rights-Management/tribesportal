/**
 * Global Layout Constants
 * 
 * These values define the horizontal grid system for Tribes Rights Management.
 * All primary content must align to this container to prevent layout drift.
 * 
 * NON-REGRESSION RULE:
 * - Do not widen beyond 1200px unless explicitly instructed
 * - Do not alter padding values without explicit instruction
 * - Header, body, and footer content must share this same grid
 */

/** Inner content container: max-width + centering + responsive horizontal padding */
export const CONTENT_CONTAINER_CLASS = "max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12";
