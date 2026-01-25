import { Outlet, useNavigate, useLocation, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  Settings, 
  ArrowLeft, 
  Menu,
  X
} from "lucide-react";
import { NAV_LABELS, ICON_SIZE, ICON_STROKE, PORTAL_TYPOGRAPHY, PORTAL_AVATAR } from "@/styles/tokens";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

/**
 * HELP WORKSTATION LAYOUT — CONSOLE LIGHT (Stripe-like)
 * 
 * Light canvas with white chrome for institutional clarity.
 * Company-scoped, not workspace-scoped.
 * 
 * Design principles:
 * - Soft neutral canvas (#F6F7F9)
 * - White header and sidebar
 * - Subtle borders, no heavy shadows
 * - Text-only navigation for institutional clarity
 */

interface NavItem {
  path: string;
  label: string;
  exact?: boolean;
  dividerBefore?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/help-workstation", label: "Overview", exact: true },
  { path: "/help-workstation/audiences", label: "Audiences" },
  { path: "/help-workstation/categories", label: "Categories" },
  { path: "/help-workstation/articles", label: "Articles" },
  { path: "/help-workstation/tags", label: "Tags" },
  { path: "/help-workstation/messages", label: "Messages" },
  { path: "/help-workstation/analytics", label: "Analytics" },
  { path: "/help-workstation/settings", label: "Settings", dividerBefore: true },
];

function HelpAccountMenu() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const isMobileView = useIsMobile();
  const avatarSize = isMobileView ? 32 : PORTAL_AVATAR.sizeDesktop;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "rounded-full shrink-0 inline-flex items-center justify-center",
            "text-[10px] font-medium uppercase",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
          )}
          style={{
            height: avatarSize,
            width: avatarSize,
            minHeight: avatarSize,
            minWidth: avatarSize,
            backgroundColor: '#E5E7EB',
            color: '#374151',
          }}
          aria-label="Account menu"
        >
          {getInitials()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 rounded-lg bg-white border-[var(--app-chrome-border)]"
        sideOffset={8}
      >
        <div className="px-3 py-2.5">
          <p className="text-[13px] font-medium truncate text-foreground">
            {profile?.full_name || profile?.email}
          </p>
          <p className="text-[10px] uppercase tracking-wider mt-1 text-muted-foreground">
            Help Workstation
          </p>
        </div>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem
          onClick={() => navigate("/account")}
          className="text-[13px] py-2 text-muted-foreground focus:bg-muted/50"
        >
          <Settings size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2 opacity-70" />
          {NAV_LABELS.ACCOUNT_SETTINGS}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-[13px] py-2 text-destructive focus:bg-destructive/10"
        >
          <LogOut size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="flex flex-col py-4 px-3 space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact 
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);

        return (
          <div key={item.path}>
            {/* Divider before Settings */}
            {item.dividerBefore && (
              <div className="my-2 border-t border-border" />
            )}
            <NavLink
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "block w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors duration-150",
                isActive 
                  ? "bg-muted text-foreground font-medium" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.label}
            </NavLink>
          </div>
        );
      })}
    </nav>
  );
}

export function HelpWorkstationLayout() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--app-canvas-bg)' }}
    >
      {/* Header — Console Light */}
      <header 
        className="h-14 px-4 md:px-6 flex items-center shrink-0 sticky top-0 z-40"
        style={{ 
          backgroundColor: 'var(--app-header-bg)',
          borderBottom: '1px solid var(--app-chrome-border)',
        }}
      >
        {/* Left: Back + Wordmark */}
        <div className="flex items-center gap-3 min-w-0">
          {isMobile ? (
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className={cn(
                "flex items-center justify-center rounded-lg shrink-0",
                "hover:bg-muted transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
              )}
              style={{ 
                color: 'var(--tribes-text-secondary)',
                height: '32px',
                width: '32px',
              }}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          ) : (
            <button
              onClick={() => navigate("/admin")}
              className={cn(
                "flex items-center justify-center rounded-lg shrink-0",
                "hover:bg-muted transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
              )}
              style={{ 
                color: 'var(--tribes-text-secondary)',
                height: '32px',
                width: '32px',
              }}
              aria-label="Back to System Console"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => navigate("/help-workstation")}
            className="font-semibold hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] rounded uppercase"
            style={{
              fontSize: isMobile ? '11px' : PORTAL_TYPOGRAPHY.brandWordmark.size,
              letterSpacing: `${PORTAL_TYPOGRAPHY.brandWordmark.tracking}em`,
              color: 'var(--tribes-text)',
            }}
          >
            {NAV_LABELS.BRAND_WORDMARK}
          </button>
        </div>

        {/* Center: Workstation label */}
        <div className="flex-1 flex items-center justify-center">
          <span 
            className="text-[10px] md:text-[13px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            Help Workstation
          </span>
        </div>

        {/* Right: Account */}
        <div className="flex items-center">
          <HelpAccountMenu />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Console Light */}
        {!isMobile && (
          <aside 
            className="w-48 shrink-0 overflow-y-auto"
            style={{
              backgroundColor: 'var(--app-sidebar-bg)',
              borderRight: '1px solid var(--app-chrome-border)',
            }}
          >
            <SidebarNav />
          </aside>
        )}

        {/* Mobile Nav Overlay */}
        {isMobile && mobileNavOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside 
              className="fixed left-0 top-14 bottom-0 w-64 z-40 overflow-y-auto"
              style={{
                backgroundColor: 'var(--app-sidebar-bg)',
                borderRight: '1px solid var(--app-chrome-border)',
              }}
            >
              <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
