import type { Database } from "@/integrations/supabase/types";

type PlatformRole = Database["public"]["Enums"]["platform_role"];
type PortalRole = Database["public"]["Enums"]["portal_role"];
type PortalContext = Database["public"]["Enums"]["portal_context"];
type MembershipStatus = Database["public"]["Enums"]["membership_status"];

interface TenantMembership {
  id: string;
  tenant_id: string;
  tenant_name: string;
  status: MembershipStatus;
  role: PortalRole;
  allowed_contexts: PortalContext[];
}

interface CapabilitiesMatrixProps {
  platformRole: PlatformRole;
  memberships: TenantMembership[];
}

/**
 * CAPABILITIES MATRIX — READ-ONLY GOVERNANCE VIEW
 * 
 * Design Rules:
 * - Grid-based display of bounded rights
 * - Always read-only (capabilities derived from role)
 * - No toggles or switches
 * - Capabilities: View, Submit, Approve, Execute, Export, Administer
 */
export function CapabilitiesMatrix({ 
  platformRole, 
  memberships 
}: CapabilitiesMatrixProps) {
  const capabilities = ["View", "Submit", "Approve", "Execute", "Export", "Administer"];
  
  // Derive capabilities from platform role
  const getPlatformCapabilities = (role: PlatformRole): string[] => {
    if (role === "platform_admin") {
      return ["View", "Submit", "Approve", "Execute", "Export", "Administer"];
    }
    return ["View"];
  };

  // Derive capabilities from tenant role
  const getTenantCapabilities = (role: PortalRole): string[] => {
    switch (role) {
      case "tenant_admin":
        return ["View", "Submit", "Approve", "Execute", "Export", "Administer"];
      case "tenant_user":
        return ["View", "Submit", "Export"];
      case "viewer":
        return ["View"];
      default:
        return [];
    }
  };

  const platformCapabilities = getPlatformCapabilities(platformRole);

  return (
    <section className="mb-8">
      <h2 
        className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        Capabilities Matrix
      </h2>
      <div 
        className="rounded overflow-hidden"
        style={{ 
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)'
        }}
      >
        {/* Platform Level */}
        <div className="p-4">
          <p 
            className="text-[11px] font-medium uppercase tracking-[0.04em] mb-3"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Platform Level
          </p>
          <div className="flex gap-3 flex-wrap">
            {capabilities.map((cap) => (
              <div
                key={cap}
                className="px-3 py-1.5 text-[12px] rounded"
                style={{ 
                  backgroundColor: platformCapabilities.includes(cap) 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'transparent',
                  color: platformCapabilities.includes(cap) 
                    ? 'var(--platform-text)' 
                    : 'var(--platform-text-muted)',
                  border: '1px solid var(--platform-border)'
                }}
              >
                {cap}
              </div>
            ))}
          </div>
        </div>

        {/* Tenant Level Capabilities */}
        {memberships.filter(m => m.status === "active").length > 0 && (
          <div 
            className="p-4"
            style={{ borderTop: '1px solid var(--platform-border)' }}
          >
            <p 
              className="text-[11px] font-medium uppercase tracking-[0.04em] mb-3"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Organization Level
            </p>
            <div className="space-y-4">
              {memberships.filter(m => m.status === "active").map((membership) => {
                const tenantCaps = getTenantCapabilities(membership.role);
                return (
                  <div key={membership.id}>
                    <p 
                      className="text-[13px] font-medium mb-2"
                      style={{ color: 'var(--platform-text)' }}
                    >
                      {membership.tenant_name}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {capabilities.map((cap) => (
                        <div
                          key={`${membership.id}-${cap}`}
                          className="px-2.5 py-1 text-[11px] rounded"
                          style={{ 
                            backgroundColor: tenantCaps.includes(cap) 
                              ? 'rgba(255,255,255,0.06)' 
                              : 'transparent',
                            color: tenantCaps.includes(cap) 
                              ? 'var(--platform-text-secondary)' 
                              : 'var(--platform-text-muted)',
                            border: '1px solid var(--platform-border)'
                          }}
                        >
                          {cap}
                        </div>
                      ))}
                    </div>
                    {/* Context Access */}
                    <p 
                      className="text-[11px] mt-2"
                      style={{ color: 'var(--platform-text-muted)' }}
                    >
                      Contexts: {membership.allowed_contexts.map(c => 
                        c.charAt(0).toUpperCase() + c.slice(1)
                      ).join(", ") || "None assigned"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No active memberships */}
        {memberships.filter(m => m.status === "active").length === 0 && (
          <div 
            className="p-4"
            style={{ borderTop: '1px solid var(--platform-border)' }}
          >
            <p 
              className="text-[13px]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              No active organization memberships.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
