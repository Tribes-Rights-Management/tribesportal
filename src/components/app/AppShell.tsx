import { ReactNode } from "react";
import { LAYOUT, CSS_VARS } from "@/config/layout";
import { AppHeader } from "@/components/app/AppHeader";

/**
 * APP SHELL - STRIPE-LIKE 2-COLUMN GRID LAYOUT (CANONICAL)
 * 
 * Layout dimensions are centralized in @/config/layout.ts
 * Header defaults to AppHeader component (single source of truth).
 * 
 * Grid: 2 columns (LAYOUT.SIDEBAR_WIDTH + 1fr)
 * Rows: LAYOUT.HEADER_HEIGHT + 1fr
 */

interface AppShellProps {
  sidebarContent?: ReactNode;
  children: ReactNode;
  showSidebar?: boolean;
  footer?: ReactNode;
}

export function AppShell({
  sidebarContent,
  children,
  showSidebar = true,
  footer,
}: AppShellProps) {
  if (!showSidebar) {
    return (
      <div 
        className="h-screen flex flex-col w-full max-w-full overflow-x-clip"
        style={{ backgroundColor: CSS_VARS.PAGE_BG }}
      >
        <header 
          className="shrink-0 sticky top-0 z-40 flex items-center w-full max-w-full overflow-hidden"
          style={{ 
            height: LAYOUT.HEADER_HEIGHT,
            backgroundColor: CSS_VARS.TOPBAR_BG,
            borderBottom: '1px solid #EBEBEB',
            boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
          }}
        >
          <AppHeader showSidebarColumn={false} />
        </header>
        
        <main className="flex-1 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
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
      className="h-screen w-full max-w-full overflow-x-clip"
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
          borderBottom: '1px solid #EBEBEB',
          boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
        }}
      >
        <div 
          className="w-full h-full grid items-center max-w-full overflow-hidden"
          style={{ 
            gridTemplateColumns: `${LAYOUT.SIDEBAR_WIDTH} 1fr`,
          }}
        >
          <AppHeader showSidebarColumn={true} />
        </div>
      </header>
      
      <aside 
        className="flex flex-col overflow-hidden"
        style={{ 
          gridColumn: '1',
          gridRow: '2',
          backgroundColor: CSS_VARS.SIDEBAR_BG,
          borderRight: '1px solid #E5E7EB',
        }}
      >
        {sidebarContent}
      </aside>
      
      <main 
        className="min-w-0 overflow-y-auto overflow-x-hidden flex flex-col"
        style={{ 
          gridColumn: '2',
          gridRow: '2',
          minHeight: 0,
          backgroundColor: '#FFFFFF',
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
