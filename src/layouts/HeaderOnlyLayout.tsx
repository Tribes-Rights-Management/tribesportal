import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { WorkspaceSwitcher } from "@/components/app/WorkspaceSwitcher";
import { UserAvatar, getInitialsFromProfile } from "@/components/ui/user-avatar";
import { useAuth } from "@/contexts/AuthContext";

/**
 * HEADER-ONLY LAYOUT — NO SIDEBAR
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Used for the Modules Home page (/workspaces) where no sidebar is needed.
 * Clean header with WorkspaceSwitcher (left) + user avatar (right).
 * 
 * Header: 56px height, avatar 28px (desktop) / 32px (mobile)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HEADER_HEIGHT = "56px";

interface HeaderOnlyLayoutProps {
  children: ReactNode;
}

export function HeaderOnlyLayout({ children }: HeaderOnlyLayoutProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const initials = getInitialsFromProfile(profile);

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
        {/* Left: WorkspaceSwitcher */}
        <WorkspaceSwitcher />

        {/* Right: User Avatar (navigates to account) */}
        <button
          onClick={() => navigate("/account")}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded-full"
          aria-label="Account"
        >
          <UserAvatar initials={initials} size="sm" variant="light" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
