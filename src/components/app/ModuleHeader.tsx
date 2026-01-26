import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppSearchInput } from "@/components/app-ui/AppSearchInput";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { NotificationCenter } from "@/components/app/NotificationCenter";
import { GlobalSearchDialog } from "@/components/search/GlobalSearchDialog";
import { SidebarHeader, ContentHeader } from "@/components/app/AppShell";
import { NAV_LABELS, PORTAL_TYPOGRAPHY } from "@/styles/tokens";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * MODULE HEADER — STRIPE-LIKE UNIFIED HEADER
 * 
 * Provides consistent header across all modules:
 * - Left: Logo in sidebar column + back link
 * - Center: Global search input
 * - Right: Notifications + profile dropdown
 * 
 * Used by SystemConsoleLayout, ModuleLayout, HelpWorkstationLayout
 */

interface ModuleHeaderProps {
  /** Show "Back to Modules" button */
  showBackToModules?: boolean;
  /** Custom context label for dropdown */
  contextLabel?: string;
  /** Whether we're in a sidebar layout (show split header) */
  showSidebarLogo?: boolean;
  /** Logo click destination */
  logoDestination?: string;
  /** Show return to console in dropdown */
  showReturnToConsole?: boolean;
  /** Show system console in dropdown */
  showSystemConsole?: boolean;
}

export function ModuleHeader({
  showBackToModules = true,
  contextLabel,
  showSidebarLogo = true,
  logoDestination = "/workspaces",
  showReturnToConsole = false,
  showSystemConsole = false,
}: ModuleHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Mobile header
  if (isMobile) {
    return (
      <div 
        className="w-full h-full flex items-center justify-between px-4"
      >
        {/* Left: Logo */}
        <button
          onClick={() => navigate(logoDestination)}
          className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded uppercase shrink-0"
          style={{
            fontSize: '11px',
            letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
            color: 'var(--foreground)',
          }}
        >
          {NAV_LABELS.BRAND_WORDMARK}
        </button>

        {/* Right: Notifications + Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <NotificationCenter />
          <ProfileDropdown 
            avatarVariant="light" 
            contextLabel={contextLabel}
            showReturnToConsole={showReturnToConsole}
            showSystemConsole={showSystemConsole}
          />
        </div>
      </div>
    );
  }

  // Desktop with sidebar: 2-column header
  if (showSidebarLogo) {
    return (
      <>
        {/* Left column: Sidebar-colored logo area */}
        <SidebarHeader
          logo={
            <div className="flex items-center gap-2">
              {showBackToModules && (
                <button
                  onClick={() => navigate("/workspaces")}
                  className={cn(
                    "flex items-center justify-center rounded-lg h-8 w-8",
                    "transition-colors duration-150",
                    "hover:bg-[var(--muted-wash)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
                  )}
                  aria-label="Back to Modules"
                  title="Back to Modules"
                >
                  <ArrowLeft className="h-4 w-4 opacity-60" strokeWidth={1.5} />
                </button>
              )}
              <button
                onClick={() => navigate(logoDestination)}
                className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded uppercase"
                style={{
                  fontSize: PORTAL_TYPOGRAPHY.brandWordmark.size,
                  letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
                  color: 'var(--foreground)',
                }}
              >
                {NAV_LABELS.BRAND_WORDMARK}
              </button>
            </div>
          }
        />

        {/* Right column: Search + account actions */}
        <ContentHeader>
          {/* Left spacer */}
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

          {/* Right: Notifications + Account */}
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <ProfileDropdown 
              avatarVariant="light" 
              contextLabel={contextLabel}
              showReturnToConsole={showReturnToConsole}
              showSystemConsole={showSystemConsole}
            />
          </div>
        </ContentHeader>

        {/* Global search dialog */}
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }

  // Desktop without sidebar
  return (
    <div 
      className="w-full h-full flex items-center justify-between px-6"
    >
      {/* Left: Logo */}
      <button
        onClick={() => navigate(logoDestination)}
        className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded uppercase"
        style={{
          fontSize: PORTAL_TYPOGRAPHY.brandWordmark.size,
          letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
          color: 'var(--foreground)',
        }}
      >
        {NAV_LABELS.BRAND_WORDMARK}
      </button>

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

      {/* Right: Account */}
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <ProfileDropdown
          avatarVariant="light" 
          contextLabel={contextLabel}
          showReturnToConsole={showReturnToConsole}
          showSystemConsole={showSystemConsole}
        />
      </div>

      {/* Global search dialog */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
