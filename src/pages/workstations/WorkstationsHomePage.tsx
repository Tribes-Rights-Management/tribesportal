import { Link } from "react-router-dom";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { HeaderOnlyLayout } from "@/layouts/HeaderOnlyLayout";
import { 
  Settings, 
  HelpCircle, 
  FileText, 
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MODULES HOME PAGE — /workstations
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Single entry point for all authenticated users after login.
 * Displays a 2x2 grid of module tiles based on user permissions.
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ModuleTileProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

function ModuleTile({ title, description, icon: Icon, href }: ModuleTileProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group relative flex flex-col justify-between p-6 rounded-lg",
        "transition-all duration-200 ease-out",
        "hover:shadow-md hover:scale-[1.01]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      )}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-subtle)',
        // @ts-ignore
        '--tw-ring-color': '#0071E3',
      }}
    >
      {/* Icon */}
      <div 
        className="flex items-center justify-center w-10 h-10 rounded-lg mb-4"
        style={{ backgroundColor: 'var(--muted-wash)' }}
      >
        <Icon 
          className="h-5 w-5" 
          strokeWidth={1.5}
          style={{ color: 'var(--text-muted)' }}
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 
          className="text-[15px] font-medium mb-1"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </h3>
        <p 
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          {description}
        </p>
      </div>

      {/* Enter affordance */}
      <div 
        className="flex items-center gap-1 mt-4 text-[13px] font-medium group-hover:gap-2 transition-all"
        style={{ color: 'var(--text-muted)' }}
      >
        Enter
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
      </div>
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

  // Build visible modules based on permissions
  const modules: ModuleTileProps[] = [];

  if (canAccessSystemConsole) {
    modules.push({
      title: "System Console",
      description: "Platform governance, user management, security oversight, and compliance.",
      icon: Settings,
      href: "/console",
    });
  }

  if (canAccessHelpWorkstation) {
    modules.push({
      title: "Help Workstation",
      description: "Manage help articles, categories, audiences, and support messages.",
      icon: HelpCircle,
      href: "/help",
    });
  }

  if (canAccessTribesLicensing) {
    modules.push({
      title: "Tribes Licensing",
      description: "License requests, agreements, payments, and catalog management.",
      icon: FileText,
      href: "/licensing",
    });
  }

  if (canAccessTribesAdmin) {
    modules.push({
      title: "Tribes Admin",
      description: "Statements, documents, invoices, and payment management.",
      icon: LayoutDashboard,
      href: "/admin",
    });
  }

  // If no modules are accessible, show a message
  const hasNoAccess = modules.length === 0;

  return (
    <HeaderOnlyLayout>
      <div 
        className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-12"
        style={{ backgroundColor: 'var(--app-bg)' }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 
            className="text-[24px] font-semibold mb-2"
            style={{ color: 'var(--text)' }}
          >
            Welcome to TRIBES
          </h1>
          <p 
            className="text-[14px]"
            style={{ color: 'var(--text-muted)' }}
          >
            Select a module to get started
          </p>
        </div>

        {/* Module Grid */}
        {hasNoAccess ? (
          <div 
            className="text-center p-8 rounded-lg max-w-md"
            style={{ 
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p 
              className="text-[14px] mb-2"
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
              "grid gap-4 w-full max-w-2xl",
              modules.length === 1 && "grid-cols-1 max-w-sm",
              modules.length === 2 && "grid-cols-1 sm:grid-cols-2",
              modules.length === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              modules.length >= 4 && "grid-cols-1 sm:grid-cols-2",
            )}
          >
            {modules.map((module) => (
              <ModuleTile key={module.href} {...module} />
            ))}
          </div>
        )}
      </div>
    </HeaderOnlyLayout>
  );
}
