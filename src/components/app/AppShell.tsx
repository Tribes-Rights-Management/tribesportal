import { ReactNode } from "react";
import { LAYOUT, CSS_VARS } from "@/config/layout";
import { AppHeader } from "@/components/app/AppHeader";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * APP SHELL — FIXED SIDEBAR + STICKY HEADER + NATURAL SCROLL
 * 
 * Uses the industry-standard layout pattern:
 * - Sidebar: position:fixed, h-dvh, scrolls independently
 * - Header: position:sticky, stays visible on scroll
 * - Main: normal document flow, body handles scrolling
 * 
 * Layout dimensions are centralized in @/config/layout.ts
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
  const isMobile = useIsMobile();
  const marginLeft = showSidebar && !isMobile ? LAYOUT.SIDEBAR_WIDTH : 0;

  if (!showSidebar) {
    return (
      <div className="min-h-dvh w-full" style={{ backgroundColor: CSS_VARS.PAGE_BG }}>
        <header
          className="sticky top-0 z-40 flex items-center w-full border-b"
          style={{
            height: LAYOUT.HEADER_HEIGHT,
            backgroundColor: CSS_VARS.TOPBAR_BG,
            borderColor: '#EBEBEB',
            boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
          }}
        >
          <AppHeader showSidebarColumn={false} />
        </header>

        <main className="w-full" style={{ backgroundColor: '#FFFFFF' }}>
          {children}
          {footer}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full" style={{ backgroundColor: CSS_VARS.PAGE_BG }}>
      {/* Fixed sidebar — scrolls independently, hidden on mobile */}
      {!isMobile && (
        <aside
          className="fixed top-0 left-0 z-30 h-dvh overflow-y-auto overflow-x-hidden flex flex-col"
          style={{
            width: LAYOUT.SIDEBAR_WIDTH,
            backgroundColor: CSS_VARS.SIDEBAR_BG,
            borderRight: '1px solid #E5E7EB',
          }}
        >
          {/* Sidebar header area — logo */}
          <div
            className="shrink-0 flex items-center"
            style={{
              height: LAYOUT.HEADER_HEIGHT,
              backgroundColor: CSS_VARS.SIDEBAR_BG,
            }}
          >
            <AppHeader showSidebarColumn={true} sidebarOnly />
          </div>
          {/* Sidebar nav content */}
          {sidebarContent}
        </aside>
      )}

      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 flex items-center border-b"
        style={{
          height: LAYOUT.HEADER_HEIGHT,
          marginLeft,
          backgroundColor: CSS_VARS.TOPBAR_BG,
          borderColor: '#EBEBEB',
          boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
        }}
      >
        {showSidebar && !isMobile ? (
          /* Content-area only (logo is in sidebar) */
          <div className="w-full h-full flex items-center justify-end" style={{ paddingRight: 24 }}>
            <AppHeader showSidebarColumn={true} contentOnly />
          </div>
        ) : (
          <AppHeader showSidebarColumn={false} />
        )}
      </header>

      {/* Main content — natural document flow */}
      <main
        style={{
          marginLeft,
          backgroundColor: '#FFFFFF',
        }}
      >
        {children}
        {footer}
      </main>
    </div>
  );
}
