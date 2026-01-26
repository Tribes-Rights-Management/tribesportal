import { useState } from "react";
import { useAuth, TenantMembership } from "@/contexts/AuthContext";
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
 * Only renders if user has multiple organizations.
 * Stripe-like minimal design.
 */

interface OrganizationSwitcherProps {
  className?: string;
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
  const { 
    tenantMemberships, 
    activeTenant, 
    setActiveTenant,
    isPlatformAdmin,
  } = useAuth();
  const [open, setOpen] = useState(false);

  // Don't render if no active tenant or only one org
  if (!activeTenant) return null;
  
  // Platform admins see the switcher even with 1 org for clarity
  // Regular users need 2+ orgs
  if (tenantMemberships.length < 2 && !isPlatformAdmin) return null;

  const handleSelect = (tenantId: string) => {
    if (tenantId !== activeTenant.tenant_id) {
      setActiveTenant(tenantId);
    }
    setOpen(false);
  };

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
