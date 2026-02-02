import { ReactNode } from "react";

/**
 * APP SHELL — STRIPE-LIKE 2-COLUMN GRID LAYOUT (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * GRID ARCHITECTURE (LOCKED):
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Layout: CSS Grid with 2 columns
 * - Column 1 (sidebar): 200px fixed width
 * - Column 2 (content): 1fr (fills remaining space)
 * 
 * Rows: 
 * - Row 1 (header): 56px (h-14)
 * - Row 2 (main): 1fr (fills remaining height)
 * 
 * STRIPE-LIKE BEHAVIOR:
 * - Sidebar starts at y=0 (full viewport height)
 * - Header spans full width with logo in sidebar column area
 * - Unified top edge: header background extends to left edge
 * - Logo sits inside sidebar chrome region of header
 * 
 * SURFACE TOKENS:
 * - Sidebar: var(--sidebar-bg)
 * - Header: var(--topbar-bg) with border-bottom
 * - Content: var(--page-bg)
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface AppShellProps {
  /** Header content (right side of header row) */
  headerContent: ReactNode;
  /** Sidebar content (navigation) */
  sidebarContent?: ReactNode;
  /** Main content area */
  children: ReactNode;
  /** Whether to show sidebar (false for mobile or no-sidebar layouts) */
  showSidebar?: boolean;
  /** Optional footer at bottom of main content */
  footer?: ReactNode;
}

// Sidebar width token (matches existing 200px/w-48 or 260px for Help Workstation)
const SIDEBAR_WIDTH = "200px";
const HEADER_HEIGHT = "56px";

export function AppShell({
  headerContent,
  sidebarContent,
  children,
  showSidebar = true,
  footer,
}: AppShellProps) {
  if (!showSidebar) {
    // No sidebar: simple stacked layout
    return (
      <div 
        className="h-screen flex flex-col w-full max-w-full overflow-hidden"
        style={{ backgroundColor: 'var(--page-bg)' }}
      >
        {/* Header — full width */}
        <header 
          className="shrink-0 sticky top-0 z-40 flex items-center w-full max-w-full overflow-hidden"
          style={{ 
            height: HEADER_HEIGHT,
            backgroundColor: 'var(--topbar-bg)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {headerContent}
        </header>
        
        {/* Main content */}
        <main className="flex-1 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="flex-1 min-w-0 w-full max-w-full">
            {children}
          </div>
          {footer}
        </main>
      </div>
    );
  }

  // With sidebar: CSS Grid layout (Stripe-like)
  return (
    <div 
      className="h-screen w-full max-w-full overflow-hidden"
      style={{ 
        display: 'grid',
        gridTemplateColumns: `${SIDEBAR_WIDTH} 1fr`,
        gridTemplateRows: `${HEADER_HEIGHT} 1fr`,
        backgroundColor: 'var(--page-bg)',
      }}
    >
      {/* Header — spans full width (both columns) */}
      <header 
        className="sticky top-0 z-40 flex items-center w-full max-w-full overflow-hidden"
        style={{ 
          gridColumn: '1 / -1',
          gridRow: '1',
          backgroundColor: 'var(--topbar-bg)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Header uses internal 2-column layout to align with grid */}
        <div 
          className="w-full h-full grid items-center max-w-full overflow-hidden"
          style={{ 
            gridTemplateColumns: `${SIDEBAR_WIDTH} 1fr`,
          }}
        >
          {headerContent}
        </div>
      </header>
      
      {/* Sidebar — full height (visually starts at top via grid) */}
      <aside 
        className="flex flex-col overflow-hidden"
        style={{ 
          gridColumn: '1',
          gridRow: '2',
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {sidebarContent}
      </aside>
      
      {/* Main content area */}
      <main 
        className="min-w-0 overflow-y-auto overflow-x-hidden flex flex-col"
        style={{ 
          gridColumn: '2',
          gridRow: '2',
        }}
      >
        <div className="flex-1 min-w-0 w-full max-w-full">
          {children}
        </div>
        {footer}
      </main>
    </div>
  );
}

/**
 * SIDEBAR HEADER — Logo + optional workspace selector
 * 
 * Renders in the sidebar column area of the header row.
 * Contains branding that appears to be part of sidebar chrome.
 */
interface SidebarHeaderProps {
  logo: ReactNode;
  /** Optional workspace selector or dropdown */
  contextSelector?: ReactNode;
}

export function SidebarHeader({ logo, contextSelector }: SidebarHeaderProps) {
  return (
    <div 
      className="h-full flex items-center justify-between px-4"
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {logo}
      {contextSelector}
    </div>
  );
}

/**
 * CONTENT HEADER — Actions, search, avatar
 * 
 * Renders in the content column area of the header row.
 * Contains navigation controls and user actions.
 */
interface ContentHeaderProps {
  children: ReactNode;
}

export function ContentHeader({ children }: ContentHeaderProps) {
  return (
    <div 
      className="h-full flex items-center justify-between px-6"
      style={{ backgroundColor: 'var(--topbar-bg)' }}
    >
      {children}
    </div>
  );
}
