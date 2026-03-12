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

