import { useNavigate } from "react-router-dom";
import { LayoutGrid, Settings, HelpCircle, FileText, LayoutDashboard } from "lucide-react";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { cn } from "@/lib/utils";
import { iconClass, iconStroke } from "@/components/ui/Icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HeaderIconButton } from "@/components/app/HeaderIconButton";
import { Separator } from "@/components/ui/separator";

/**
 * MODULE LAUNCHER POPOVER — TOP-RIGHT 4-SQUARES ICON
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Single source of truth for module navigation in the header.
 * Replaces the direct link to /workspaces with an inline popover menu.
 * 
 * Uses the same module list and permissions as /workspaces tiles.
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ModuleLauncherPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModuleLauncherPopover({ open, onOpenChange }: ModuleLauncherPopoverProps) {
  const navigate = useNavigate();
  const {
    canAccessSystemConsole,
    canAccessHelpWorkstation,
    canAccessTribesLicensing,
    canAccessTribesAdmin,
  } = useModuleAccess();

  // Single source of truth: same module list as /workspaces tiles
  const allModules = [
    {
      title: "System Console",
      icon: Settings,
      href: "/console",
      hasAccess: canAccessSystemConsole,
    },
    {
      title: "Help Workstation",
      icon: HelpCircle,
      href: "/help",
      hasAccess: canAccessHelpWorkstation,
    },
    {
      title: "Tribes Licensing",
      icon: FileText,
      href: "/licensing",
      hasAccess: canAccessTribesLicensing,
    },
    {
      title: "Tribes Admin",
      icon: LayoutDashboard,
      href: "/admin",
      hasAccess: canAccessTribesAdmin,
    },
  ];

  // Only show accessible modules in the launcher
  const accessibleModules = allModules.filter(m => m.hasAccess);

  const handleModuleClick = (href: string) => {
    navigate(href);
    onOpenChange(false);
  };

  const handleViewAll = () => {
    navigate("/workspaces");
    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <HeaderIconButton
          icon={LayoutGrid}
          aria-label="Modules"
        />
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        sideOffset={6}
        className={cn(
          "w-64 rounded-xl p-0 overflow-hidden shadow-lg",
          // Hard-enforce small, institutional SVGs inside this menu
          "[&_svg]:shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:[stroke-width:1.25]"
        )}
      >
        {/* Module list */}
        <div className="py-1">
          {accessibleModules.length > 0 ? (
            accessibleModules.map((module) => (
              <button
                key={module.href}
                onClick={() => handleModuleClick(module.href)}
                className={cn(
                  "w-full h-10 px-4 text-sm flex items-center gap-3",
                  "hover:bg-muted/50 transition-colors cursor-pointer",
                  "text-foreground"
                )}
              >
                <module.icon
                  className={cn(iconClass("xs"), "text-muted-foreground")}
                  strokeWidth={iconStroke("default")}
                />
                {module.title}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No modules available
            </div>
          )}
        </div>

        <Separator />

        {/* View all link */}
        <div className="py-1">
          <button
            onClick={handleViewAll}
            className={cn(
              "w-full h-10 px-4 text-sm flex items-center gap-3",
              "hover:bg-muted/50 transition-colors cursor-pointer",
              "text-muted-foreground"
            )}
          >
            <LayoutGrid
              className={cn(iconClass("xs"), "text-muted-foreground")}
              strokeWidth={iconStroke("default")}
            />
            View all modules
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
