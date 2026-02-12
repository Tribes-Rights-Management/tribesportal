import { ReactNode } from "react";
import { LAYOUT, CSS_VARS } from "@/config/layout";
import { AppHeader } from "@/components/app/AppHeader";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * APP SHELL — FIXED SIDEBAR + STICKY HEADER + NATURAL SCROLL
 * 
 * Layout pattern:
 * - Sidebar: position:fixed, h-dvh, own scroll context
 * - Header: position:sticky, stays visible on scroll
 * - Main: plain flowing content, browser handles scrolling
 * 
 * NO CSS Grid. NO overflow on main. NO h-screen on container.
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

  // No-sidebar layout (mobile, or pages without nav)
  if (!showSidebar) {
    return (
      <div className="min-h-screen w-full" style={{ backgroundColor: CSS_VARS.PAGE_BG }}>
        <header
          className="sticky top-0 z-40 flex items-center w-full border-b"
          style={{
            height: 'var(--header-height)',
            backgroundColor: CSS_VARS.TOPBAR_BG,
            borderColor: '#EBEBEB',
            boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
          }}
        >
          <AppHeader showSidebarColumn={false} />
        </header>

        <main className="flex-1" style={{ backgroundColor: '#FFFFFF', minHeight: 'calc(100dvh - var(--header-height))' }}>
          {children}
          {footer}
        </main>
      </div>
    );
  }

  // Sidebar layout
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: CSS_VARS.PAGE_BG }}>
      {/* Fixed sidebar — own scroll context, hidden on mobile */}
      {!isMobile && (
        <aside
          className="fixed top-0 left-0 z-30 h-dvh overflow-y-auto overflow-x-hidden flex flex-col"
          style={{
            width: 'var(--sidebar-width)',
            backgroundColor: CSS_VARS.SIDEBAR_BG,
            borderRight: '1px solid #E5E7EB',
          }}
        >
          {/* Sidebar header — logo */}
          <div
            className="shrink-0 flex items-center"
            style={{
              height: 'var(--header-height)',
              backgroundColor: CSS_VARS.SIDEBAR_BG,
            }}
          >
            <AppHeader showSidebarColumn={true} sidebarOnly />
          </div>
          {sidebarContent}
        </aside>
      )}

      {/* Sticky header — offsets past fixed sidebar on desktop */}
      <header
        className="sticky top-0 z-40 flex items-center border-b"
        style={{
          height: 'var(--header-height)',
          marginLeft: isMobile ? 0 : 'var(--sidebar-width)',
          backgroundColor: CSS_VARS.TOPBAR_BG,
          borderColor: '#EBEBEB',
          boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
        }}
      >
        {!isMobile ? (
          <div className="w-full h-full flex items-center justify-end" style={{ paddingRight: 24 }}>
            <AppHeader showSidebarColumn={true} contentOnly />
          </div>
        ) : (
          <AppHeader showSidebarColumn={false} />
        )}
      </header>

      {/* Main content — plain flowing content, browser scrolls naturally */}
      <main
        style={{
          marginLeft: isMobile ? 0 : 'var(--sidebar-width)',
          backgroundColor: '#FFFFFF',
          minHeight: 'calc(100dvh - var(--header-height))',
        }}
      >
        {children}
        {footer}
      </main>
    </div>
  );
}
