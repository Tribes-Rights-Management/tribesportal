import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export function TenantSelector() {
  const { tenantMemberships, activeTenant, setActiveTenant } = useAuth();

  // Don't show selector if user only belongs to one tenant
  if (tenantMemberships.length <= 1) {
    return activeTenant ? (
      <div className="flex items-center gap-2 text-[13px] text-[#3F3F46]">
        <Building2 className="h-4 w-4 text-[#71717A]" />
        <span className="font-medium">{activeTenant.tenant_name}</span>
      </div>
    ) : null;
  }

  return (
    <Select
      value={activeTenant?.tenant_id ?? ""}
      onValueChange={setActiveTenant}
    >
      <SelectTrigger className="w-auto min-w-[180px] h-9 border-[#E4E4E7] bg-white text-[13px]">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#71717A]" />
          <SelectValue placeholder="Select organization" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {tenantMemberships.map((membership) => (
          <SelectItem
            key={membership.tenant_id}
            value={membership.tenant_id}
            className="text-[13px]"
          >
            {membership.tenant_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
