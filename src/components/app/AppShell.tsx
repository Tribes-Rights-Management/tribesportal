import { ReactNode } from "react";
import { LAYOUT, CSS_VARS } from "@/config/layout";

/**
 * APP SHELL - STRIPE-LIKE 2-COLUMN GRID LAYOUT (CANONICAL)
 * 
 * Layout dimensions are centralized in @/config/layout.ts
 * 
 * Grid: 2 columns (LAYOUT.SIDEBAR_WIDTH + 1fr)
 * Rows: LAYOUT.HEADER_HEIGHT + 1fr
 */

interface AppShellProps {
  headerContent: ReactNode;
  sidebarContent?: ReactNode;
  children: ReactNode;
  showSidebar?: boolean;
  footer?: ReactNode;
}

export function AppShell({
  headerContent,
  sidebarContent,
  children,
  showSidebar = true,
  footer,
}: AppShellProps) {
  if (!showSidebar) {
    return (
      <div 
        className="min-h-screen flex flex-col w-full max-w-full overflow-hidden"
        style={{ backgroundColor: CSS_VARS.PAGE_BG }}
      >
        <header 
          className="shrink-0 sticky top-0 z-40 flex items-center w-full max-w-full overflow-hidden"
          style={{ 
            height: LAYOUT.HEADER_HEIGHT,
            backgroundColor: CSS_VARS.TOPBAR_BG,
            borderBottom: `1px solid ${CSS_VARS.BORDER_SUBTLE}`,
          }}
        >
          {headerContent}
        </header>
        
        <main className="flex-1 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="flex-1 min-w-0 w-full max-w-full">
            {children}
          </div>
          {footer}
        </main>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full max-w-full overflow-hidden"
      style={{ 
        display: 'grid',
        gridTemplateColumns: `${LAYOUT.SIDEBAR_WIDTH} 1fr`,
        gridTemplateRows: `${LAYOUT.HEADER_HEIGHT} 1fr`,
        backgroundColor: CSS_VARS.PAGE_BG,
      }}
    >
      <header 
        className="sticky top-0 z-40 flex items-center w-full max-w-full overflow-hidden"
        style={{ 
          gridColumn: '1 / -1',
          gridRow: '1',
          backgroundColor: CSS_VARS.TOPBAR_BG,
          borderBottom: `1px solid ${CSS_VARS.BORDER_SUBTLE}`,
        }}
      >
        <div 
          className="w-full h-full grid items-center max-w-full overflow-hidden"
          style={{ 
            gridTemplateColumns: `${LAYOUT.SIDEBAR_WIDTH} 1fr`,
          }}
        >
          {headerContent}
        </div>
      </header>
      
      <aside 
        className="flex flex-col overflow-hidden"
        style={{ 
          gridColumn: '1',
          gridRow: '2',
          backgroundColor: CSS_VARS.SIDEBAR_BG,
          borderRight: `1px solid ${CSS_VARS.BORDER_SUBTLE}`,
        }}
      >
        {sidebarContent}
      </aside>
      
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

interface SidebarHeaderProps {
  logo: ReactNode;
  contextSelector?: ReactNode;
}

export function SidebarHeader({ logo, contextSelector }: SidebarHeaderProps) {
  return (
    <div 
      className="h-full flex items-center justify-between"
      style={{ 
        backgroundColor: CSS_VARS.SIDEBAR_BG,
        paddingLeft: LAYOUT.SIDEBAR_PADDING_X,
        paddingRight: LAYOUT.SIDEBAR_PADDING_X,
      }}
    >
      {logo}
      {contextSelector}
    </div>
  );
}

interface ContentHeaderProps {
  children: ReactNode;
}

export function ContentHeader({ children }: ContentHeaderProps) {
  return (
    <div 
      className="h-full flex items-center justify-between"
      style={{ 
        backgroundColor: CSS_VARS.TOPBAR_BG,
        paddingLeft: LAYOUT.CONTENT_PADDING_X,
        paddingRight: LAYOUT.CONTENT_PADDING_X,
      }}
    >
      {children}
    </div>
  );
}
