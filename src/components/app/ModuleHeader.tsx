import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSearchInput } from "@/components/app-ui/AppSearchInput";
import { NotificationCenter } from "@/components/app/NotificationCenter";
import { GlobalSearchDialog } from "@/components/search/GlobalSearchDialog";
import { SidebarHeader, ContentHeader } from "@/components/app/AppShell";
import { WorkspaceSwitcher } from "@/components/app/WorkspaceSwitcher";
import { UserAvatar, getInitialsFromProfile } from "@/components/ui/user-avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

/**
 * MODULE HEADER — UNIFIED STRIPE-LIKE HEADER (CANONICAL)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * This is the SINGLE header component used across ALL modules:
 * - /console, /admin, /licensing, /help
 * 
 * Layout:
 * - Desktop with sidebar: 2-column grid (sidebar column + content column)
 *   - Left column: WorkspaceSwitcher in sidebar-colored region
 *   - Right column: Global search (center) + avatar (right)
 * - Mobile: Full-width header with WorkspaceSwitcher + avatar
 * 
 * STRICT INVARIANTS:
 * - WorkspaceSwitcher placement: always top-left (sidebar header area on desktop)
 * - Global search: always center of content header
 * - User avatar: always top-right, links to /account
 * - Icon sizes: 18px for header icons, 16px for dropdown icons
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ModuleHeaderProps {
  /** Whether we're in a sidebar layout (show split 2-column header) */
  showSidebarLogo?: boolean;
}

export function ModuleHeader({
  showSidebarLogo = true,
}: ModuleHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  
  const initials = getInitialsFromProfile(profile);

  // Mobile header - compact with WorkspaceSwitcher + avatar
  if (isMobile) {
    return (
      <div className="w-full h-full flex items-center justify-between px-4">
        {/* Left: Workspace switcher (compact) */}
        <WorkspaceSwitcher />

        {/* Right: Notifications + Avatar (navigates to account) */}
        <div className="flex items-center gap-2 shrink-0">
          <NotificationCenter />
          <button
            onClick={() => navigate("/account")}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded-full"
            aria-label="Account"
          >
            <UserAvatar initials={initials} size="md" variant="light" />
          </button>
        </div>
      </div>
    );
  }

  // Desktop with sidebar: 2-column header grid
  if (showSidebarLogo) {
    return (
      <>
        {/* Left column: Sidebar-colored workspace switcher area */}
        <SidebarHeader
          logo={<WorkspaceSwitcher />}
        />

        {/* Right column: Search + account actions */}
        <ContentHeader>
          {/* Left spacer for balance */}
          <div className="w-8" />
          
          {/* Center: Global search trigger */}
          <div className="flex-1 flex items-center justify-center max-w-xl">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full max-w-[400px]"
            >
              <AppSearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search..."
                rightHint="⌘ K"
                size="sm"
                className="w-full pointer-events-none"
              />
            </button>
          </div>

          {/* Right: Notifications + Avatar */}
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <button
              onClick={() => navigate("/account")}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded-full"
              aria-label="Account"
            >
              <UserAvatar initials={initials} size="sm" variant="light" />
            </button>
          </div>
        </ContentHeader>

        {/* Global search dialog */}
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }

  // Desktop without sidebar (uses WorkspaceSwitcher as well)
  return (
    <div className="w-full h-full flex items-center justify-between px-6">
      {/* Left: Workspace switcher */}
      <WorkspaceSwitcher />

      {/* Center: Search trigger */}
      <div className="flex-1 flex items-center justify-center max-w-xl mx-6">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full max-w-[400px]"
        >
          <AppSearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search..."
            rightHint="⌘ K"
            size="sm"
            className="w-full pointer-events-none"
          />
        </button>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <button
          onClick={() => navigate("/account")}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded-full"
          aria-label="Account"
        >
          <UserAvatar initials={initials} size="sm" variant="light" />
        </button>
      </div>

      {/* Global search dialog */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
