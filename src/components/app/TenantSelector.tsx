import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { NAV_LABELS } from "@/styles/tokens";

/**
 * WORKSPACE SELECTOR — INSTITUTIONAL COMPONENT
 * 
 * Terminology: "Workspace" replaces "Organization" in user-facing UI
 */
export function TenantSelector() {
  const { tenantMemberships, activeTenant, setActiveTenant } = useAuth();

  // Single workspace: show as static label (no selector needed)
  if (tenantMemberships.length <= 1) {
    return null;
  }

  // Multiple workspaces: show dropdown selector
  return (
    <Select
      value={activeTenant?.tenant_id ?? ""}
      onValueChange={setActiveTenant}
    >
      <SelectTrigger className="w-auto min-w-[160px] h-8 border-[#E4E4E7] bg-white text-[12px] gap-1.5">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-[#71717A]" />
          <SelectValue placeholder={NAV_LABELS.SELECT_WORKSPACE} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {tenantMemberships.map((membership) => (
          <SelectItem
            key={membership.tenant_id}
            value={membership.tenant_id}
            className="text-[12px]"
          >
            {membership.tenant_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
