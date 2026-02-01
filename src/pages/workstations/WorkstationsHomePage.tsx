import { useModuleAccess } from "@/hooks/useModuleAccess";
import { useAuth } from "@/contexts/AuthContext";
import { HeaderOnlyLayout } from "@/layouts/HeaderOnlyLayout";
import { WorkspaceCard } from "@/components/ui/workspace-card";
import { OrganizationSwitcher } from "@/components/app/OrganizationSwitcher";
import { Link } from "react-router-dom";
import { 
  HelpCircle, 
  FileText, 
  LayoutDashboard,
  AlertCircle,
  Building2,
  ChevronRight,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MODULES HOME PAGE — /workspaces
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Single entry point for all authenticated users after login.
 * Displays a compact 2x2 grid of module tiles based on user permissions.
 * 
 * SAFETY RULES (prevents blank screens):
 * - Always render the header and page shell
 * - Handle loading, error, and empty states explicitly
 * - Never return null or crash on missing data
 * - Show Help tile to all authenticated users regardless of org context
 * ═══════════════════════════════════════════════════════════════════════════
 */

type ViewState = "loading" | "ready" | "org-picker" | "no-orgs" | "error";

export default function WorkstationsHomePage() {
  const {
    canAccessSystemConsole,
    canAccessHelpWorkstation,
    canAccessTribesLicensing,
    canAccessTribesAdmin,
    isLoading: moduleLoading,
    hasError,
  } = useModuleAccess();

  const {
    user,
    profile,
    tenantMemberships,
    activeTenant,
    loading: authLoading,
    isPlatformAdmin,
  } = useAuth();

  /**
   * Derive the user's first name for a personalized greeting.
   * Priority order:
   *   1) profile.full_name → first token
   *   2) user.user_metadata.first_name
   *   3) user.user_metadata.full_name → first token
   *   4) user.email → local part before "@", title-cased
   *   5) Fallback: "there"
   */
  const getDisplayFirstName = (): string => {
    // 1) Check profile.full_name
    if (profile?.full_name) {
      const firstName = profile.full_name.trim().split(/\s+/)[0];
      if (firstName) return firstName;
    }

    // 2) Check user metadata first_name
    const metaFirstName = user?.user_metadata?.first_name;
    if (typeof metaFirstName === "string" && metaFirstName.trim()) {
      return metaFirstName.trim();
    }

    // 3) Check user metadata full_name
    const metaFullName = user?.user_metadata?.full_name;
    if (typeof metaFullName === "string" && metaFullName.trim()) {
      const firstName = metaFullName.trim().split(/\s+/)[0];
      if (firstName) return firstName;
    }

    // 4) Derive from email local part
    const email = user?.email || profile?.email;
    if (email) {
      const localPart = email.split("@")[0];
      if (localPart) {
        // Title-case the local part (e.g., "john.doe" → "John")
        const namePart = localPart.split(/[._-]/)[0];
        return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
      }
    }

    // 5) Fallback
    return "there";
  };

  // Determine view state
  const getViewState = (): ViewState => {
    // SAFETY: Still loading auth or module access - ALWAYS render loading state
    if (authLoading || moduleLoading) {
      return "loading";
    }

    // SAFETY: Query failed but we MUST still show something (never blank)
    if (hasError) {
      return "error";
    }

    // SAFETY: User has multiple orgs but no active selection - show picker
    if (tenantMemberships.length > 1 && !activeTenant) {
      return "org-picker";
    }

    // SAFETY: User has no org memberships (but might be platform admin)
    if (tenantMemberships.length === 0 && !isPlatformAdmin) {
      return "no-orgs";
    }

    return "ready";
  };

  const viewState = getViewState();

  // SAFETY: Always define all modules, even if user has no access
  const allModules = [
    {
      title: "Help Workstation",
      description: "Manage help articles, categories, and audiences.",
      icon: HelpCircle,
      href: "/help",
      hasAccess: canAccessHelpWorkstation,
    },
    {
      title: "Licensing",
      description: "License requests, agreements, and payments.",
      icon: FileText,
      href: "/licensing",
      hasAccess: canAccessTribesLicensing,
    },
    {
      title: "Rights",
      description: "Client and rights management.",
      icon: Music,
      href: "/rights",
      hasAccess: true, // TODO: Add proper access check
    },
    {
      title: "Admin",
      description: "Client documents, catalog, and payments.",
      icon: LayoutDashboard,
      href: "/admin",
      hasAccess: canAccessTribesAdmin,
    },
  ];

  // Sort: accessible first, then disabled
  const accessibleModules = allModules.filter(m => m.hasAccess);
  const disabledModules = allModules.filter(m => !m.hasAccess);
  const sortedModules = [...accessibleModules, ...disabledModules];

  // Alert message templates with proper pluralization
  const alertTemplates = {
    escalated_tickets: (count: number) => 
      `${count} escalated support ticket${count > 1 ? 's' : ''} need${count === 1 ? 's' : ''} attention`,
    
    pending_payouts: (count: number) => 
      `${count} payout${count > 1 ? 's' : ''} awaiting approval`,
    
    pending_licenses: (count: number) => 
      `${count} license request${count > 1 ? 's' : ''} pending approval`,
    
    unsigned_agreements: (count: number) => 
      `${count} agreement${count > 1 ? 's' : ''} awaiting your signature`,
    
    open_tickets: (count: number) => 
      `${count} open support ticket${count > 1 ? 's' : ''} assigned to you`,
  };

  // Pending items notification (hardcoded sample data for now)
  // Later this will pull from actual pending counts via API
  const pendingItems = [
    { 
      type: 'pending_licenses' as const,
      count: 2, 
      href: "/licensing",
      hasAccess: canAccessTribesLicensing 
    },
  ];
  
  // Filter to only show items user has access to and have counts > 0
  const activePendingItems = pendingItems
    .filter(item => item.hasAccess && item.count > 0)
    .map(item => ({
      ...item,
      message: alertTemplates[item.type](item.count),
    }));

  // Render page shell (always visible)
  const renderPageShell = (content: React.ReactNode) => (
    <HeaderOnlyLayout>
      <div 
        className="min-h-[calc(100vh-56px)] px-4 sm:px-6"
        style={{ backgroundColor: 'var(--app-bg)' }}
      >
        <div className="mx-auto w-full max-w-[640px] pt-6 sm:pt-8 pb-12">
          {/* Header — always visible */}
          <div className="mb-5">
            <h1 
              className="text-[20px] sm:text-[24px] font-semibold leading-tight"
              style={{ color: 'var(--text)' }}
            >
              Welcome, {getDisplayFirstName()}
            </h1>
            <p 
              className="text-[13px] sm:text-[14px] mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Choose your destination.
            </p>
          </div>

          {content}
        </div>
      </div>
    </HeaderOnlyLayout>
  );

  // Loading state
  if (viewState === "loading") {
    return renderPageShell(
      <div 
        className="p-5 rounded-xl flex items-center justify-center"
        style={{ 
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-subtle)',
          minHeight: '120px',
        }}
      >
        <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
          Loading workspaces...
        </p>
      </div>
    );
  }

  // Error state (query failed, but still show what we can)
  if (viewState === "error") {
    return renderPageShell(
      <>
        {/* Error banner */}
        <div 
          className="p-4 rounded-lg mb-5 flex items-start gap-3"
          style={{ 
            backgroundColor: '#2A1A1A',
            border: '1px solid #7F1D1D',
          }}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#DC2626' }} />
          <div>
            <p className="text-[14px]" style={{ color: '#DC2626' }}>
              Could not load all workspace data
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Some modules may not appear. Try refreshing the page.
            </p>
          </div>
        </div>

        {/* Still show tiles we can determine access for */}
        <div className={cn("grid gap-4 w-full", "grid-cols-1 sm:grid-cols-2")}>
          {sortedModules.map((module) => (
            <WorkspaceCard 
              key={module.href} 
              title={module.title}
              description={module.description}
              icon={module.icon}
              href={module.href}
              disabled={!module.hasAccess}
            />
          ))}
        </div>
      </>
    );
  }

  // Org picker state (user has multiple orgs but none selected)
  if (viewState === "org-picker") {
    return renderPageShell(
      <div 
        className="p-5 rounded-xl"
        style={{ 
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <Building2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <div>
            <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
              Select an organization
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              You belong to multiple organizations. Choose one to continue.
            </p>
          </div>
        </div>
        
        <OrganizationSwitcher variant="list" />
      </div>
    );
  }

  // No orgs state (user has no org memberships)
  if (viewState === "no-orgs") {
    return renderPageShell(
      <>
        {/* Info card */}
        <div 
          className="p-5 rounded-xl mb-5"
          style={{ 
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="text-[14px] mb-1" style={{ color: 'var(--text)' }}>
            No organization access yet
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Ask your administrator to invite you to an organization.
          </p>
        </div>

        {/* Still show Help tile if user has access */}
        {canAccessHelpWorkstation && (
          <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2">
            <WorkspaceCard 
              title="Help Workstation"
              description="Manage help articles, categories, audiences, and support messages."
              icon={HelpCircle}
              href="/help"
              disabled={false}
            />
          </div>
        )}
      </>
    );
  }

  // Ready state — show all tiles
  const hasNoAccess = accessibleModules.length === 0;

  return renderPageShell(
    hasNoAccess ? (
      <div 
        className="p-5 rounded-xl"
        style={{ 
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="text-[14px] mb-1" style={{ color: 'var(--text)' }}>
          No modules available
        </p>
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          Contact your administrator to request access.
        </p>
      </div>
    ) : (
      <>
        {/* Pending items notification row */}
        {activePendingItems.length > 0 && (
          <Link
            to={activePendingItems[0].href}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-card border border-border rounded-lg mb-4 hover:bg-accent/40 transition-colors"
          >
            <span className="text-[12px] sm:text-[13px] text-muted-foreground text-center">
              {activePendingItems[0].message}
            </span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          </Link>
        )}
        
        <div className={cn("grid gap-4 w-full", "grid-cols-1 sm:grid-cols-2")}>
          {sortedModules.map((module) => (
            <WorkspaceCard 
              key={module.href} 
              title={module.title}
              description={module.description}
              icon={module.icon}
              href={module.href}
              disabled={!module.hasAccess}
            />
          ))}
        </div>
      </>
    )
  );
}
