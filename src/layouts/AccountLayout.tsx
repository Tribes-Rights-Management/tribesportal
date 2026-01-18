import { Outlet, NavLink, useLocation, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalHeader } from "@/components/app/GlobalHeader";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, Shield, Sliders, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageShell } from "@/components/ui/page-shell";

/**
 * ACCOUNT SETTINGS LAYOUT — INSTITUTIONAL GOVERNANCE SURFACE
 * 
 * Route: /account
 * Subroutes: /account/profile, /account/security, /account/preferences
 * 
 * Design Rules:
 * - User-scoped (not workspace- or organization-scoped)
 * - Mobile: drill-down pattern (list → detail → back)
 * - Desktop: two-column layout with nav rail
 * - All pages load at scroll position = top
 * - No horizontal scrolling
 * - No vertical/rotated section labels
 */

const accountNavItems = [
  { 
    to: "/account/profile", 
    label: "Profile", 
    description: "Identity and workspace association",
    icon: User 
  },
  { 
    to: "/account/security", 
    label: "Security", 
    description: "Authentication and session management",
    icon: Shield 
  },
  { 
    to: "/account/preferences", 
    label: "Preferences", 
    description: "Operational settings and display options",
    icon: Sliders 
  },
];

/**
 * Desktop Navigation Rail
 */
function DesktopNav() {
  return (
    <nav 
      className="w-56 shrink-0 border-r py-6 px-4"
      style={{ 
        backgroundColor: 'var(--platform-surface)',
        borderColor: 'var(--platform-border)'
      }}
    >
      <div className="space-y-1">
        {accountNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-colors",
              isActive 
                ? "text-[--platform-text] bg-white/5" 
                : "text-[--platform-text-muted] hover:text-[--platform-text] hover:bg-white/3"
            )}
          >
            <item.icon className="h-4 w-4 opacity-70" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/**
 * Mobile Settings Index — Drill-down list
 */
function MobileSettingsIndex() {
  return (
    <div 
      className="flex flex-col min-h-screen w-full max-w-full overflow-x-clip"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <GlobalHeader />
      <main className="flex-1 w-full max-w-full overflow-x-clip">
        <PageContainer maxWidth="narrow" padding="default" safeArea>
          <PageShell
            title="Account Settings"
            subtitle="Profile, security, and preferences"
          />

          <div 
            className="rounded-lg overflow-hidden w-full max-w-full"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)'
            }}
          >
            {accountNavItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-4 py-4 transition-colors active:bg-white/[0.03] w-full min-w-0"
                style={{ 
                  borderBottom: index < accountNavItems.length - 1 
                    ? '1px solid var(--platform-border)' 
                    : 'none'
                }}
              >
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <item.icon 
                    className="h-5 w-5" 
                    style={{ color: 'var(--platform-text-secondary)' }} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-[15px] font-medium truncate"
                    style={{ color: 'var(--platform-text)' }}
                  >
                    {item.label}
                  </p>
                  <p 
                    className="text-[13px] mt-0.5 line-clamp-2"
                    style={{ 
                      color: 'var(--platform-text-secondary)',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.description}
                  </p>
                </div>
                <ChevronRight 
                  className="h-5 w-5 shrink-0" 
                  style={{ color: 'var(--platform-text-muted)' }} 
                />
              </NavLink>
            ))}
          </div>
        </PageContainer>
      </main>
    </div>
  );
}

/**
 * Mobile Detail Wrapper — Provides back navigation
 */
function MobileDetailWrapper({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  useScrollReset(contentRef);
  
  return (
    <div 
      className="flex flex-col min-h-screen w-full max-w-full overflow-x-clip"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <GlobalHeader />
      <div 
        className="py-3 w-full max-w-full"
        style={{ 
          backgroundColor: 'var(--platform-surface)',
          borderBottom: '1px solid var(--platform-border)',
          paddingLeft: 'max(var(--page-pad-x, 16px), env(safe-area-inset-left, var(--page-pad-x, 16px)))',
          paddingRight: 'max(var(--page-pad-x, 16px), env(safe-area-inset-right, var(--page-pad-x, 16px)))',
        }}
      >
        <Link 
          to="/account"
          className="inline-flex items-center gap-2 text-[13px] transition-colors min-h-[44px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
      <main 
        ref={contentRef} 
        className="flex-1 overflow-y-auto w-full max-w-full overflow-x-clip"
      >
        {children}
      </main>
    </div>
  );
}

/**
 * Main Account Layout
 */
export default function AccountLayout() {
  const { loading, accessState } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Apply scroll reset on route change
  useScrollReset(contentRef);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <GlobalHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px]" style={{ color: 'var(--platform-text-muted)' }}>
            Loading account
          </p>
        </div>
      </div>
    );
  }

  if (accessState === "unauthenticated") {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Mobile: Show settings index at /account, drill-down for subroutes
  if (isMobile) {
    // If at /account root, show the settings list
    if (location.pathname === "/account") {
      return <MobileSettingsIndex />;
    }
    
    // Otherwise, show the detail view with back navigation
    return (
      <MobileDetailWrapper>
        <Outlet />
      </MobileDetailWrapper>
    );
  }

  // Desktop: Two-column layout
  // Redirect /account to /account/profile
  if (location.pathname === "/account") {
    return <Navigate to="/account/profile" replace />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <GlobalHeader />
      <div className="flex flex-1 overflow-hidden w-full max-w-full">
        <DesktopNav />
        <main 
          ref={contentRef}
          className="flex-1 overflow-y-auto overflow-x-clip min-w-0"
        >
          {/* Content renders inside SettingsPageContainer which handles its own padding */}
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
