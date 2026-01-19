/**
 * APP UI KIT — GLOBAL COMPONENT LIBRARY (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * ENFORCEMENT RULES (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ALL pages across the application MUST import from this kit:
 * 
 *   import { AppButton, AppChip, AppCard } from "@/components/app-ui";
 * 
 * PROHIBITED:
 * - Importing Button from @/components/ui/button in page components
 * - Using className overrides for bg-white, rounded-full, text-black
 * - Using opacity-* on entire button elements
 * - One-off CTA styling
 * 
 * ALLOWED PRIMITIVE USAGE (exceptions):
 * - UI primitives (calendar, pagination, alert-dialog) may use buttonVariants
 * - Internal component composition within this kit
 * 
 * See: docs/UI_STANDARD_APP.md for complete guidelines
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { AppButton, type AppButtonProps } from "./AppButton";
export { AppChip, type ChipStatus, type ChipSeverity, type ChipVariant } from "./AppChip";
export {
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardDescription,
  AppCardBody,
  AppCardFooter,
} from "./AppCard";
export { AppSectionHeader } from "./AppSectionHeader";
