import { Link } from "react-router-dom";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { HeaderOnlyLayout } from "@/layouts/HeaderOnlyLayout";
import { 
  Settings, 
  HelpCircle, 
  FileText, 
  LayoutDashboard,
  ChevronRight,
  Lock,
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

interface ModuleTileProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  disabled?: boolean;
}

function ModuleTile({ title, description, icon: Icon, href, disabled = false }: ModuleTileProps) {
  const content = (
    <div
      className={cn(
        // Fixed height, overflow protection, padding
        "group relative flex flex-col h-[156px] p-[18px] rounded-2xl overflow-hidden",
        "border transition-all duration-150",
        disabled 
          ? "opacity-60 cursor-not-allowed border-[var(--border-subtle)]" 
          : "cursor-pointer border-[var(--border-subtle)] hover:border-[#D1D5DB] hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      )}
      style={{
        backgroundColor: 'var(--card-bg)',
      }}
    >
      {/* Top row: Icon chip + Chevron/Lock */}
      <div className="flex items-start justify-between shrink-0">
        {/* Icon container: 40px, soft gray, radius 12px */}
        <div 
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{ backgroundColor: 'var(--muted-wash)' }}
        >
          <Icon 
            className="h-5 w-5 shrink-0" 
            strokeWidth={1.5}
            style={{ color: 'var(--text-muted)' }}
          />
        </div>

        {/* Chevron or Lock */}
        {disabled ? (
          <Lock 
            className="h-[18px] w-[18px] shrink-0" 
            strokeWidth={1.5}
            style={{ color: 'var(--text-muted)' }}
          />
        ) : (
          <ChevronRight 
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-transform duration-150",
              "group-hover:translate-x-0.5"
            )}
            strokeWidth={1.5}
            style={{ color: 'var(--text-muted)' }}
          />
        )}
      </div>

      {/* Content: Title + Description — with overflow protection */}
      <div className="flex-1 flex flex-col justify-end min-w-0 mt-3">
        <h3 
          className="text-[16px] font-semibold leading-tight truncate"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </h3>
        <p 
          className="text-[13px] leading-snug mt-1 line-clamp-2 break-words"
          style={{ color: 'var(--text-muted)' }}
        >
          {description}
        </p>
      </div>
    </div>
  );

  if (disabled) {
    return content;
  }

  return (
    <Link
      to={href}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 rounded-2xl"
    >
      {content}
    </Link>
  );
}

export default function WorkstationsHomePage() {
  const {
    canAccessSystemConsole,
    canAccessHelpWorkstation,
    canAccessTribesLicensing,
    canAccessTribesAdmin,
  } = useModuleAccess();

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
          <div className="mb-4">
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
              className="p-5 rounded-2xl overflow-hidden"
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
                <ModuleTile 
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
