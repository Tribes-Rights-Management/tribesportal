import { Outlet, NavLink, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { useScrollReset } from "@/hooks/useScrollReset";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, Shield, Sliders, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useRef } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageShell } from "@/components/ui/page-shell";

/**
 * ACCOUNT SETTINGS LAYOUT
 * 
 * Uses AppShell which now handles header internally via AppHeader.
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

function AccountNav() {
  return (
    <nav className="flex flex-col h-full py-4 overflow-y-auto">
      <div className="px-3 space-y-1">
        {accountNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                isActive
                  ? "text-foreground bg-[var(--tribes-nav-active)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-[var(--tribes-nav-hover)]"
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
      className="rounded-lg overflow-hidden w-full max-w-full min-w-0"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {accountNavItems.map((item, index) => (
        <NavLink
          key={item.to}
          to={item.to}
          className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[var(--tribes-nav-hover)] active:bg-[var(--tribes-nav-active)] w-full min-w-0 overflow-hidden"
          style={{
            borderBottom:
              index < accountNavItems.length - 1
                ? "1px solid var(--border-subtle)"
                : "none",
          }}
        >
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--tribes-surface-elevated)" }}
          >
            <item.icon
              className="h-5 w-5"
              style={{ color: "var(--tribes-fg-secondary)" }}
            />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p
              className="text-[15px] font-medium truncate"
              style={{ color: "var(--tribes-fg)" }}
            >
              {item.label}
            </p>
            <p
              className="text-[13px] mt-0.5 truncate"
              style={{ color: "var(--tribes-fg-secondary)" }}
            >
              {item.description}
            </p>
          </div>
          <ChevronRight
            className="h-5 w-5 shrink-0 flex-none"
            style={{ color: "var(--tribes-fg-muted)" }}
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

  useScrollReset(contentRef);

  const isRoot = location.pathname === "/account";
  const meta = useMemo(() => getAccountShellMeta(location.pathname), [location.pathname]);

  if (loading) {
    return (
      <AppShell showSidebar={false}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px] text-muted-foreground">
            Loading account
          </p>
        </div>
      </AppShell>
    );
  }

  if (accessState === "unauthenticated") {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (!isMobile && isRoot) {
    return <Navigate to="/account/profile" replace />;
  }

  const content = (
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
      <AppShell showSidebar={false}>
        {content}
      </AppShell>
    );
  }

  return (
    <AppShell
      showSidebar={true}
      sidebarContent={<AccountNav />}
    >
      {content}
    </AppShell>
  );
}
