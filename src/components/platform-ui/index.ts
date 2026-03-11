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
 *     AppPageLayout,
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
export { AppResponsiveList, AppItemCard } from "./AppResponsiveList";

// ─────────────────────────────────────────────────────────────────────────────
// PAGE STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
export { AppPageLayout } from "./AppPageLayout";
export { AppListToolbar } from "./AppListToolbar";
export { AppSectionHeader } from "./AppSectionHeader";
export { AppSection, AppSectionGrid } from "./AppSection";
export { 
  AppDetailRow, 
  AppDetailRowGroup,
  type AppDetailRowVariant,
} from "./AppDetailRow";
export { AppSettingsCard, AppSettingsFooter } from "./AppSettingsCard";

// ─────────────────────────────────────────────────────────────────────────────
// INPUTS
// ─────────────────────────────────────────────────────────────────────────────
export { AppSearchInput } from "./AppSearchInput";
export { AppSelect } from "./AppSelect";
export { AppCheckboxGroup, type CheckboxOption } from "./AppCheckboxGroup";


// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWNS
// ─────────────────────────────────────────────────────────────────────────────
export { AppDropdown, type AppDropdownItem, type AppDropdownProps } from "./AppDropdown";

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


// ─────────────────────────────────────────────────────────────────────────────
// FILTERS
// ─────────────────────────────────────────────────────────────────────────────
export {
  AppFilterDrawer,
  AppFilterSection,
  AppFilterOption,
  AppFilterTrigger,
} from "./AppFilterDrawer";
