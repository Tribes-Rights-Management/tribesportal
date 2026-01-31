/**
 * APP UI KIT — GLOBAL COMPONENT LIBRARY (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * ENFORCEMENT RULES (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ALL pages across the application MUST import from this kit:
 * 
 *   import { 
 *     AppButton, 
 *     AppCard, 
 *     AppPageHeader,
 *     AppStatCard,
 *     AppListCard,
 *     AppListRow,
 *   } from "@/components/app-ui";
 * 
 * PROHIBITED:
 * - Importing Button from @/components/ui/button in page components
 * - Hardcoded colors (use CSS variables)
 * - One-off styling for common patterns
 * - Inline hex colors like #1A1A1A, #303030, etc.
 * 
 * ALLOWED PRIMITIVE USAGE (exceptions):
 * - UI primitives (calendar, pagination, alert-dialog) may use base components
 * - Internal component composition within this kit
 * 
 * See: docs/UI_STANDARD_APP.md for complete guidelines
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// BUTTONS
// ─────────────────────────────────────────────────────────────────────────────
export { AppButton, type AppButtonProps } from "./AppButton";

// ─────────────────────────────────────────────────────────────────────────────
// CHIPS / BADGES
// ─────────────────────────────────────────────────────────────────────────────
export { AppChip, type ChipStatus, type ChipSeverity, type ChipVariant } from "./AppChip";

// ─────────────────────────────────────────────────────────────────────────────
// CARDS
// ─────────────────────────────────────────────────────────────────────────────
export {
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardDescription,
  AppCardBody,
  AppCardFooter,
} from "./AppCard";

export { AppStatCard, AppStatCardGrid } from "./AppStatCard";

// ─────────────────────────────────────────────────────────────────────────────
// LISTS
// ─────────────────────────────────────────────────────────────────────────────
export { AppListCard, AppListRow, AppListAction } from "./AppListCard";

// ─────────────────────────────────────────────────────────────────────────────
// PAGE STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
export { AppPageHeader } from "./AppPageHeader";
export { AppPageContainer } from "./AppPageContainer";
export { AppSectionHeader } from "./AppSectionHeader";
export { AppSection, AppSectionGrid } from "./AppSection";
export { AppDetailRow, AppDetailRowGroup } from "./AppDetailRow";

// ─────────────────────────────────────────────────────────────────────────────
// INPUTS
// ─────────────────────────────────────────────────────────────────────────────
export { AppSearchInput } from "./AppSearchInput";
export { AppSelect } from "./AppSelect";
export { AppCheckboxGroup, type CheckboxOption } from "./AppCheckboxGroup";
export { AppInput, AppTextarea } from "./AppInput";

// ─────────────────────────────────────────────────────────────────────────────
// PANELS / MODALS
// ─────────────────────────────────────────────────────────────────────────────
export { AppPanel, AppPanelFooter } from "./AppPanel";

// ─────────────────────────────────────────────────────────────────────────────
// TABLES
// ─────────────────────────────────────────────────────────────────────────────
export {
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
  AppTableTag,
  TABLE_COLUMN_PRESETS,
  type ColumnPreset,
} from "./AppTable";

export { AppPagination } from "./AppPagination";

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────
export { AppAlert } from "./AppAlert";
export { AppEmptyState } from "./AppEmptyState";
export { AppDivider } from "./AppDivider";
