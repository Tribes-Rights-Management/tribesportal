import { Outlet, NavLink, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalHeader } from "@/components/app/GlobalHeader";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, Shield, Sliders, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useRef } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageShell } from "@/components/ui/page-shell";

/**
 * ACCOUNT SETTINGS LAYOUT — SINGLE LAYOUT AUTHORITY FOR /account (LOCKED)
 *
 * This file is the ONLY layout mounted for:
 * - /account
 * - /account/profile
 * - /account/security
 * - /account/preferences
 *
 * Contract:
 * - PageShell is the ONLY component that renders the H1
 * - PageContainer is the ONLY component that defines outer padding/max-width
 * - Account subpages render content sections only (no headers, no containers)
 * - Scroll reset is enforced ONLY here via useScrollReset
 */

const accountNavItems = [
  {
    to: "/account/profile",
    label: "Profile",
    description: "Identity and workspace association",
    icon: User,
  },
  {
    to: "/account/security",
    label: "Security",
    description: "Authentication and session management",
    icon: Shield,
  },
  {
    to: "/account/preferences",
    label: "Preferences",
    description: "Operational settings and display options",
    icon: Sliders,
  },
] as const;

type AccountShellMeta = {
  title: string;
  subtitle?: string;
};

function getAccountShellMeta(pathname: string): AccountShellMeta {
  if (pathname === "/account") {
    return {
      title: "Account Settings",
      subtitle: "Profile, security, and preferences",
    };
  }

  if (pathname.startsWith("/account/profile")) {
    return {
      title: "Profile",
      subtitle: "Identity and display preferences",
    };
  }

  if (pathname.startsWith("/account/security")) {
    return {
      title: "Security",
      subtitle: "Authentication and session management",
    };
  }

  if (pathname.startsWith("/account/preferences")) {
    return {
      title: "Preferences",
      subtitle: "Operational settings and display options",
    };
  }

  return { title: "Account" };
}

/**
 * Desktop Navigation Rail
 */
function DesktopNav() {
  return (
    <nav
      className="w-56 shrink-0 border-r py-6 px-4"
      style={{
        backgroundColor: "var(--platform-surface)",
        borderColor: "var(--platform-border)",
      }}
    >
      <div className="space-y-1">
        {accountNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-colors",
                isActive
                  ? "text-[--platform-text] bg-white/5"
                  : "text-[--platform-text-muted] hover:text-[--platform-text] hover:bg-white/3"
              )
            }
          >
            <item.icon className="h-4 w-4 opacity-70" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function AccountIndexList() {
  return (
    <div
      className="rounded-lg overflow-hidden w-full max-w-full"
      style={{
        backgroundColor: "var(--platform-surface)",
        border: "1px solid var(--platform-border)",
      }}
    >
      {accountNavItems.map((item, index) => (
        <NavLink
          key={item.to}
          to={item.to}
          className="flex items-center gap-3 px-4 py-4 transition-colors active:bg-white/[0.03] w-full min-w-0"
          style={{
            borderBottom:
              index < accountNavItems.length - 1
                ? "1px solid var(--platform-border)"
                : "none",
          }}
        >
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <item.icon
              className="h-5 w-5"
              style={{ color: "var(--platform-text-secondary)" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[15px] font-medium truncate"
              style={{ color: "var(--platform-text)" }}
            >
              {item.label}
            </p>
            <p
              className="text-[13px] mt-0.5 line-clamp-2"
              style={{
                color: "var(--platform-text-secondary)",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {item.description}
            </p>
          </div>
          <ChevronRight
            className="h-5 w-5 shrink-0"
            style={{ color: "var(--platform-text-muted)" }}
          />
        </NavLink>
      ))}
    </div>
  );
}

export default function AccountLayout() {
  const { loading, accessState } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLElement>(null);

  // Scroll reset must live ONLY in this layout (never in pages/containers)
  useScrollReset(contentRef);

  const isRoot = location.pathname === "/account";
  const meta = useMemo(() => getAccountShellMeta(location.pathname), [location.pathname]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip"
        style={{ backgroundColor: "var(--platform-canvas)" }}
      >
        <GlobalHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px]" style={{ color: "var(--platform-text-muted)" }}>
            Loading account
          </p>
        </div>
      </div>
    );
  }

  if (accessState === "unauthenticated") {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Desktop: redirect /account to /account/profile (mobile keeps index list)
  if (!isMobile && isRoot) {
    return <Navigate to="/account/profile" replace />;
  }

  const shell = (
    <PageContainer variant="settings" padding="default" safeArea>
      <PageShell
        title={meta.title}
        subtitle={meta.subtitle}
        backTo={isMobile && !isRoot ? "/account" : undefined}
        backLabel={isMobile && !isRoot ? "Settings" : undefined}
      />
      {isRoot ? <AccountIndexList /> : <Outlet />}
    </PageContainer>
  );

  if (isMobile) {
    return (
      <div
        className="flex flex-col min-h-screen w-full max-w-full overflow-x-clip"
        style={{ backgroundColor: "var(--platform-canvas)" }}
      >
        <GlobalHeader />
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto w-full max-w-full overflow-x-clip"
        >
          {shell}
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip"
      style={{ backgroundColor: "var(--platform-canvas)" }}
    >
      <GlobalHeader />
      <div className="flex flex-1 overflow-hidden w-full max-w-full">
        <DesktopNav />
        <main ref={contentRef} className="flex-1 overflow-y-auto overflow-x-clip min-w-0">
          {shell}
        </main>
      </div>
    </div>
  );
}
