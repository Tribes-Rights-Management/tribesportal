import { useModuleAccess } from "@/hooks/useModuleAccess";
import { HeaderOnlyLayout } from "@/layouts/HeaderOnlyLayout";
import { WorkspaceCard } from "@/components/ui/workspace-card";
import { 
  Settings, 
  HelpCircle, 
  FileText, 
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MODULES HOME PAGE — /workstations
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Single entry point for all authenticated users after login.
 * Displays a compact 2x2 grid of module tiles based on user permissions.
 * Stripe-level design: tight, calm, deliberate.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function WorkstationsHomePage() {
  const {
    canAccessSystemConsole,
    canAccessHelpWorkstation,
    canAccessTribesLicensing,
    canAccessTribesAdmin,
    isLoading,
  } = useModuleAccess();

  // Show loading state while checking module access
  if (isLoading) {
    return (
      <HeaderOnlyLayout>
        <div 
          className="min-h-[calc(100vh-56px)] px-6 flex items-center justify-center"
          style={{ backgroundColor: 'var(--app-bg)' }}
        >
          <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
            Loading workspaces...
          </p>
        </div>
      </HeaderOnlyLayout>
    );
  }

  // All modules with access flags
  const allModules = [
    {
      title: "System Console",
      description: "Platform governance, user management, security oversight, and compliance.",
      icon: Settings,
      href: "/console",
      hasAccess: canAccessSystemConsole,
    },
    {
      title: "Help Workstation",
      description: "Manage help articles, categories, audiences, and support messages.",
      icon: HelpCircle,
      href: "/help",
      hasAccess: canAccessHelpWorkstation,
    },
    {
      title: "Tribes Licensing",
      description: "License requests, agreements, payments, and catalog management.",
      icon: FileText,
      href: "/licensing",
      hasAccess: canAccessTribesLicensing,
    },
    {
      title: "Tribes Admin",
      description: "Statements, documents, invoices, and payment management.",
      icon: LayoutDashboard,
      href: "/admin",
      hasAccess: canAccessTribesAdmin,
    },
  ];

  // Show all modules (accessible ones first, then disabled ones)
  const accessibleModules = allModules.filter(m => m.hasAccess);
  const disabledModules = allModules.filter(m => !m.hasAccess);
  const sortedModules = [...accessibleModules, ...disabledModules];

  // If no modules at all, show empty state
  const hasNoAccess = accessibleModules.length === 0;

  return (
    <HeaderOnlyLayout>
      <div 
        className="min-h-[calc(100vh-56px)] px-6"
        style={{ backgroundColor: 'var(--app-bg)' }}
      >
        {/* Centered content container */}
        <div className="mx-auto w-full max-w-[640px] pt-8 pb-12">
          {/* Header — left-aligned with grid, tighter spacing */}
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

          {/* Module Grid */}
          {hasNoAccess ? (
            <div 
              className="p-5 rounded-xl overflow-hidden"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <p 
                className="text-[14px] mb-1"
                style={{ color: 'var(--text)' }}
              >
                No modules available
              </p>
              <p 
                className="text-[13px]"
                style={{ color: 'var(--text-muted)' }}
              >
                Contact your administrator to request access.
              </p>
            </div>
          ) : (
            <div 
              className={cn(
                "grid gap-4 w-full",
                "grid-cols-1 sm:grid-cols-2"
              )}
            >
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
          )}
        </div>
      </div>
    </HeaderOnlyLayout>
  );
}
