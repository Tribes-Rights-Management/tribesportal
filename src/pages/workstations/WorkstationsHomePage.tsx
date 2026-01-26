import { useModuleAccess } from "@/hooks/useModuleAccess";
import { useAuth } from "@/contexts/AuthContext";
import { HeaderOnlyLayout } from "@/layouts/HeaderOnlyLayout";
import { WorkspaceCard } from "@/components/ui/workspace-card";
import { OrganizationSwitcher } from "@/components/app/OrganizationSwitcher";
import { 
  Settings, 
  HelpCircle, 
  FileText, 
  LayoutDashboard,
  AlertCircle,
  Building2,
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
    tenantMemberships,
    activeTenant,
    loading: authLoading,
    isPlatformAdmin,
  } = useAuth();

  // Determine view state
  const getViewState = (): ViewState => {
    // Still loading auth or module access
    if (authLoading || moduleLoading) {
      return "loading";
    }

    // Query failed but we can still show something
    if (hasError) {
      return "error";
    }

    // User has multiple orgs but no active selection
    if (tenantMemberships.length > 1 && !activeTenant) {
      return "org-picker";
    }

    // User has no org memberships (but might be platform admin)
    if (tenantMemberships.length === 0 && !isPlatformAdmin) {
      return "no-orgs";
    }

    return "ready";
  };

  const viewState = getViewState();

  // All modules with access flags
  const allModules = [
    {
      title: "System Console",
      description: "Platform governance, user management, security oversight, and compliance.",
      icon: Settings,
      href: "/console",
      hasAccess: canAccessSystemConsole,
      isPlatformOnly: true,
    },
    {
      title: "Help Workstation",
      description: "Manage help articles, categories, audiences, and support messages.",
      icon: HelpCircle,
      href: "/help",
      hasAccess: canAccessHelpWorkstation,
      isPlatformOnly: false,
    },
    {
      title: "Tribes Licensing",
      description: "License requests, agreements, payments, and catalog management.",
      icon: FileText,
      href: "/licensing",
      hasAccess: canAccessTribesLicensing,
      isPlatformOnly: false,
    },
    {
      title: "Tribes Admin",
      description: "Statements, documents, invoices, and payment management.",
      icon: LayoutDashboard,
      href: "/admin",
      hasAccess: canAccessTribesAdmin,
      isPlatformOnly: false,
    },
  ];

  // Sort: accessible first, then disabled
  const accessibleModules = allModules.filter(m => m.hasAccess);
  const disabledModules = allModules.filter(m => !m.hasAccess);
  const sortedModules = [...accessibleModules, ...disabledModules];

  // Render page shell (always visible)
  const renderPageShell = (content: React.ReactNode) => (
    <HeaderOnlyLayout>
      <div 
        className="min-h-[calc(100vh-56px)] px-6"
        style={{ backgroundColor: 'var(--app-bg)' }}
      >
        <div className="mx-auto w-full max-w-[640px] pt-8 pb-12">
          {/* Header — always visible */}
          <div className="mb-5">
            <h1 
              className="text-[24px] font-semibold leading-tight"
              style={{ color: 'var(--text)' }}
            >
              Workspaces
            </h1>
            <p 
              className="text-[14px] mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Select a module to continue.
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
    )
  );
}
