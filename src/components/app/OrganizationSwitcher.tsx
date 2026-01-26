import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * ORGANIZATION SWITCHER — COMPACT HEADER COMPONENT
 * 
 * Shows current organization with dropdown to switch.
 * 
 * Variants:
 * - "dropdown" (default): Compact trigger with dropdown menu
 * - "list": Full list of organizations (for org picker pages)
 */

interface OrganizationSwitcherProps {
  className?: string;
  variant?: "dropdown" | "list";
}

export function OrganizationSwitcher({ className, variant = "dropdown" }: OrganizationSwitcherProps) {
  const { 
    tenantMemberships, 
    activeTenant, 
    setActiveTenant,
    isPlatformAdmin,
  } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSelect = (tenantId: string) => {
    setActiveTenant(tenantId);
    setOpen(false);
  };

  // List variant - shows all orgs as a selectable list
  if (variant === "list") {
    if (tenantMemberships.length === 0) {
      return (
        <div className={cn("text-[13px]", className)} style={{ color: 'var(--text-muted)' }}>
          No organizations available
        </div>
      );
    }

    return (
      <div className={cn("space-y-1", className)}>
        {tenantMemberships.map((org) => (
          <button
            key={org.tenant_id}
            onClick={() => handleSelect(org.tenant_id)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg",
              "text-left text-[14px] transition-colors",
              "hover:bg-muted",
              activeTenant?.tenant_id === org.tenant_id && "bg-muted"
            )}
            style={{ color: 'var(--text)' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Building2 className="h-4 w-4 flex-shrink-0 opacity-60" />
              <span className="truncate">{org.tenant_name}</span>
            </div>
            {activeTenant?.tenant_id === org.tenant_id && (
              <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant - only show if there's an active tenant
  if (!activeTenant) return null;
  
  // Platform admins see the switcher even with 1 org for clarity
  // Regular users need 2+ orgs
  if (tenantMemberships.length < 2 && !isPlatformAdmin) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 px-2.5 py-1.5 rounded-md",
          "text-[13px] font-medium text-muted-foreground",
          "hover:bg-muted transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
          className
        )}
      >
        <Building2 className="h-4 w-4 opacity-60" />
        <span className="max-w-[120px] truncate">
          {activeTenant.tenant_name}
        </span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="start" 
        className="w-[200px]"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal uppercase tracking-wide">
          Organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {tenantMemberships.map((org) => (
          <DropdownMenuItem
            key={org.tenant_id}
            onClick={() => handleSelect(org.tenant_id)}
            className="flex items-center justify-between gap-2"
          >
            <span className="truncate">{org.tenant_name}</span>
            {org.tenant_id === activeTenant.tenant_id && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
