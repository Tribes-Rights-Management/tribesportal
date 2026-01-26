import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";

/**
 * HEADER-ONLY LAYOUT — NO SIDEBAR
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Used for the Modules Home page (/workstations) where no sidebar is needed.
 * Clean header with logo + user avatar only.
 * 
 * Header: 56px height, avatar 28px (desktop) / 32px (mobile)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HEADER_HEIGHT = "56px";

interface HeaderOnlyLayoutProps {
  children: ReactNode;
}

export function HeaderOnlyLayout({ children }: HeaderOnlyLayoutProps) {
  return (
    <div 
      className="min-h-screen flex flex-col w-full"
      style={{ backgroundColor: 'var(--app-bg)' }}
    >
      {/* Header — 56px, full width */}
      <header 
        className="shrink-0 sticky top-0 z-40 flex items-center justify-between px-6"
        style={{ 
          height: HEADER_HEIGHT,
          backgroundColor: 'var(--topbar-bg)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Left: Logo/Wordmark */}
        <Link 
          to="/workspaces"
          className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded"
        >
          <span 
            className="text-[13px] font-semibold tracking-wide uppercase"
            style={{ color: 'var(--text)' }}
          >
            TRIBES
          </span>
        </Link>

        {/* Right: User Avatar/Menu - using shared ProfileDropdown */}
        <ProfileDropdown avatarVariant="default" />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
