/**
 * PLATFORM UI KIT — GLOBAL COMPONENT LIBRARY (SINGLE SOURCE OF TRUTH)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * ENFORCEMENT RULES (LOCKED)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ALL pages across the application MUST import from this kit:
 * 
 *   import { 
 *     PlatformButton, 
 *     PlatformCard, 
 *     PlatformPageLayout,
 *     PlatformStatCard,
 *     PlatformListCard,
 *     PlatformListRow,
 *   } from "@/components/platform-ui";
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
 * See: docs/UI_STANDARD_PLATFORM.md for complete guidelines
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// BUTTONS
// ─────────────────────────────────────────────────────────────────────────────
export { PlatformButton, type PlatformButtonProps } from "./PlatformButton";

// ─────────────────────────────────────────────────────────────────────────────
// CHIPS / BADGES
// ─────────────────────────────────────────────────────────────────────────────
export { PlatformChip, type ChipStatus, type ChipSeverity, type ChipVariant } from "./PlatformChip";

// ─────────────────────────────────────────────────────────────────────────────
// CARDS
// ─────────────────────────────────────────────────────────────────────────────
export {
  PlatformCard,
  PlatformCardHeader,
  PlatformCardTitle,
  PlatformCardDescription,
  PlatformCardBody,
  PlatformCardFooter,
} from "./PlatformCard";

export { PlatformStatCard, PlatformStatCardGrid } from "./PlatformStatCard";

// ─────────────────────────────────────────────────────────────────────────────
// LISTS
// ─────────────────────────────────────────────────────────────────────────────
export { PlatformListCard, PlatformListRow, PlatformListAction } from "./PlatformListCard";
export { PlatformResponsiveList, PlatformItemCard } from "./PlatformResponsiveList";

// ─────────────────────────────────────────────────────────────────────────────
// PAGE STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
export { PlatformPageLayout } from "./PlatformPageLayout";
export { PlatformListToolbar } from "./PlatformListToolbar";
export { PlatformSectionHeader } from "./PlatformSectionHeader";
export { PlatformSection, PlatformSectionGrid } from "./PlatformSection";
export { 
  PlatformDetailRow, 
  PlatformDetailRowGroup,
  type PlatformDetailRowVariant,
} from "./PlatformDetailRow";
export { PlatformSettingsCard, PlatformSettingsFooter } from "./PlatformSettingsCard";

// ─────────────────────────────────────────────────────────────────────────────
// INPUTS
// ─────────────────────────────────────────────────────────────────────────────
export { PlatformSearchInput } from "./PlatformSearchInput";
export { PlatformSelect } from "./PlatformSelect";
export { PlatformCheckboxGroup, type CheckboxOption } from "./PlatformCheckboxGroup";


// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWNS
// ─────────────────────────────────────────────────────────────────────────────
export { PlatformDropdown, type PlatformDropdownItem, type PlatformDropdownProps } from "./PlatformDropdown";

// ─────────────────────────────────────────────────────────────────────────────
// PANELS / MODALS
// ─────────────────────────────────────────────────────────────────────────────
export { PlatformPanel, PlatformPanelFooter } from "./PlatformPanel";

// ─────────────────────────────────────────────────────────────────────────────
// TABLES
// ─────────────────────────────────────────────────────────────────────────────
export {
  PlatformTable,
  PlatformTableHeader,
  PlatformTableBody,
  PlatformTableRow,
  PlatformTableHead,
  PlatformTableCell,
  PlatformTableEmpty,
  PlatformTableBadge,
  PlatformTableTag,
  TABLE_COLUMN_PRESETS,
  type ColumnPreset,
} from "./PlatformTable";

export { PlatformPagination } from "./PlatformPagination";

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────
export { PlatformAlert } from "./PlatformAlert";
export { PlatformEmptyState } from "./PlatformEmptyState";


// ─────────────────────────────────────────────────────────────────────────────
// FILTERS
// ─────────────────────────────────────────────────────────────────────────────
export {
  PlatformFilterDrawer,
  PlatformFilterSection,
  PlatformFilterOption,
  PlatformFilterTrigger,
} from "./PlatformFilterDrawer";

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARD-COMPATIBLE ALIASES
// These allow existing consumer code to keep working during the migration.
// New code should use Platform* names exclusively.
// ─────────────────────────────────────────────────────────────────────────────
export {
  PlatformButton as AppButton,
  type PlatformButtonProps as AppButtonProps,
} from "./PlatformButton";
export { PlatformChip as AppChip } from "./PlatformChip";
export {
  PlatformCard as AppCard,
  PlatformCardHeader as AppCardHeader,
  PlatformCardTitle as AppCardTitle,
  PlatformCardDescription as AppCardDescription,
  PlatformCardBody as AppCardBody,
  PlatformCardFooter as AppCardFooter,
} from "./PlatformCard";
export { PlatformStatCard as AppStatCard, PlatformStatCardGrid as AppStatCardGrid } from "./PlatformStatCard";
export { PlatformListCard as AppListCard, PlatformListRow as AppListRow, PlatformListAction as AppListAction } from "./PlatformListCard";
export { PlatformResponsiveList as AppResponsiveList, PlatformItemCard as AppItemCard } from "./PlatformResponsiveList";
export { PlatformPageLayout as AppPageLayout } from "./PlatformPageLayout";
export { PlatformListToolbar as AppListToolbar } from "./PlatformListToolbar";
export { PlatformSectionHeader as AppSectionHeader } from "./PlatformSectionHeader";
export { PlatformSection as AppSection, PlatformSectionGrid as AppSectionGrid } from "./PlatformSection";
export {
  PlatformDetailRow as AppDetailRow,
  PlatformDetailRowGroup as AppDetailRowGroup,
  type PlatformDetailRowVariant as AppDetailRowVariant,
} from "./PlatformDetailRow";
export { PlatformSettingsCard as AppSettingsCard, PlatformSettingsFooter as AppSettingsFooter } from "./PlatformSettingsCard";
export { PlatformSearchInput as AppSearchInput } from "./PlatformSearchInput";
export { PlatformSelect as AppSelect } from "./PlatformSelect";
export { PlatformCheckboxGroup as AppCheckboxGroup } from "./PlatformCheckboxGroup";
export {
  PlatformDropdown as AppDropdown,
  type PlatformDropdownItem as AppDropdownItem,
  type PlatformDropdownProps as AppDropdownProps,
} from "./PlatformDropdown";
export { PlatformPanel as AppPanel, PlatformPanelFooter as AppPanelFooter } from "./PlatformPanel";
export {
  PlatformTable as AppTable,
  PlatformTableHeader as AppTableHeader,
  PlatformTableBody as AppTableBody,
  PlatformTableRow as AppTableRow,
  PlatformTableHead as AppTableHead,
  PlatformTableCell as AppTableCell,
  PlatformTableEmpty as AppTableEmpty,
  PlatformTableBadge as AppTableBadge,
  PlatformTableTag as AppTableTag,
} from "./PlatformTable";
export { PlatformPagination as AppPagination } from "./PlatformPagination";
export { PlatformAlert as AppAlert } from "./PlatformAlert";
export { PlatformEmptyState as AppEmptyState } from "./PlatformEmptyState";
export {
  PlatformFilterDrawer as AppFilterDrawer,
  PlatformFilterSection as AppFilterSection,
  PlatformFilterOption as AppFilterOption,
  PlatformFilterTrigger as AppFilterTrigger,
} from "./PlatformFilterDrawer";
