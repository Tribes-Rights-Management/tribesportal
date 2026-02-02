/**
 * LAYOUT CONSTANTS — SINGLE SOURCE OF TRUTH
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * All layout dimensions, spacing, and brand assets are defined here.
 * 
 * DO NOT hardcode these values elsewhere. Import from this file.
 * 
 * USAGE:
 *   import { LAYOUT, BRAND } from "@/config/layout";
 *   
 *   style={{ width: LAYOUT.SIDEBAR_WIDTH }}
 *   <img src={BRAND.LOGO_URL} style={{ height: BRAND.LOGO_HEIGHT }} />
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT DIMENSIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const LAYOUT = {
  /**
   * Sidebar width — fixed across all modules (portal and public site)
   * 200px = 12.5rem
   */
  SIDEBAR_WIDTH: "200px",
  SIDEBAR_WIDTH_PX: 200,
  
  /**
   * Header height — fixed across all layouts
   * 56px = 3.5rem = h-14 in Tailwind
   */
  HEADER_HEIGHT: "56px",
  HEADER_HEIGHT_PX: 56,
  
  /**
   * Sidebar horizontal padding
   * Used for logo area and nav items container
   */
  SIDEBAR_PADDING_X: "16px", // px-4
  
  /**
   * Content area horizontal padding
   */
  CONTENT_PADDING_X: "24px", // px-6
  CONTENT_PADDING_X_MOBILE: "20px", // p-[20px]
  
  /**
   * Maximum content width for centered layouts (e.g., workspaces page)
   */
  CONTENT_MAX_WIDTH: "640px",
  CONTENT_MAX_WIDTH_WIDE: "1200px",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND ASSETS
// ═══════════════════════════════════════════════════════════════════════════════

export const BRAND = {
  /**
   * Tribes wordmark logo — black on transparent
   * Used in headers (portal and public site)
   */
  LOGO_URL: "https://rsdjfnsbimcdrxlhognv.supabase.co/storage/v1/object/public/Tribes%20Brand%20Files/Tribes%20-%20Wordmark%20Black%20Transparent.png",
  
  /**
   * Logo dimensions — consistent everywhere
   * Height: 20px (h-5 in Tailwind)
   * Width: auto, max 80px
   */
  LOGO_HEIGHT: "20px",
  LOGO_HEIGHT_PX: 20,
  LOGO_MAX_WIDTH: "80px",
  LOGO_MAX_WIDTH_PX: 80,
  
  /**
   * Logo container — clickable area around logo
   * Provides consistent hit target and hover state
   */
  LOGO_BUTTON_HEIGHT: "36px", // h-9
  LOGO_BUTTON_PADDING_X: "8px", // px-2
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Z-INDEX LAYERS
// ═══════════════════════════════════════════════════════════════════════════════

export const Z_INDEX = {
  /** Sticky header */
  HEADER: 40,
  /** Sidebar (when overlapping content on mobile) */
  SIDEBAR: 30,
  /** Modals and dialogs */
  MODAL: 50,
  /** Toast notifications */
  TOAST: 60,
  /** Tooltips and popovers */
  TOOLTIP: 70,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CSS CUSTOM PROPERTIES (for reference)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * These CSS variables should be defined in your global CSS.
 * Listed here for documentation purposes.
 * 
 * Background surfaces:
 * - --app-bg: Main application background
 * - --page-bg: Page content background
 * - --card-bg: Card/panel background
 * - --sidebar-bg: Sidebar background
 * - --topbar-bg: Header/topbar background
 * 
 * Borders:
 * - --border-subtle: Light borders (hairlines)
 * - --border-strong: Stronger borders
 * 
 * Text:
 * - --text: Primary text color
 * - --text-muted: Secondary/muted text
 * - --btn-text: Button text (often same as --text)
 * - --btn-text-muted: Muted button text
 * 
 * Interactive:
 * - --muted-wash: Subtle background for hover states
 * - --app-focus: Focus ring color
 */
export const CSS_VARS = {
  APP_BG: 'var(--app-bg)',
  PAGE_BG: 'var(--page-bg)',
  CARD_BG: 'var(--card-bg)',
  SIDEBAR_BG: 'var(--sidebar-bg)',
  TOPBAR_BG: 'var(--topbar-bg)',
  BORDER_SUBTLE: 'var(--border-subtle)',
  BORDER_STRONG: 'var(--border-strong)',
  TEXT: 'var(--text)',
  TEXT_MUTED: 'var(--text-muted)',
  MUTED_WASH: 'var(--muted-wash)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// GRID TEMPLATES (for CSS Grid layouts)
// ═══════════════════════════════════════════════════════════════════════════════

export const GRID = {
  /** Two-column layout with sidebar */
  WITH_SIDEBAR: {
    columns: `${LAYOUT.SIDEBAR_WIDTH} 1fr`,
    rows: `${LAYOUT.HEADER_HEIGHT} 1fr`,
  },
  /** Single column layout (no sidebar) */
  NO_SIDEBAR: {
    columns: '1fr',
    rows: `${LAYOUT.HEADER_HEIGHT} 1fr`,
  },
} as const;
