import { Checkbox } from "@/components/ui/checkbox";
import type { Database } from "@/integrations/supabase/types";

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
  created_at: string;
  updated_at: string;
}

interface ScopeAssignmentsProps {
  memberships: TenantMembership[];
  editMode: boolean;
  formatRole: (role: PortalRole) => string;
  formatStatus: (status: MembershipStatus) => string;
  getTenantRoleDescription: (role: PortalRole) => string;
  onRoleChange: (membership: TenantMembership, newRole: PortalRole) => void;
  onStatusChange: (membership: TenantMembership, newStatus: MembershipStatus) => void;
  onContextChange: (membership: TenantMembership, newContexts: PortalContext[]) => void;
}

/**
 * SCOPE ASSIGNMENTS — EXPLICIT ENTITY LISTING
 * 
 * Design Rules:
 * - Explicit entities named (no wildcards)
 * - No implicit inheritance without explanation
 * - Listed, not toggled
 * - Clear scope boundaries
 */
export function ScopeAssignments({
  memberships,
  editMode,
  formatRole,
  formatStatus,
  getTenantRoleDescription,
  onRoleChange,
  onStatusChange,
  onContextChange,
}: ScopeAssignmentsProps) {
  const allContexts: PortalContext[] = ["publishing", "licensing"];

  const handleContextToggle = (membership: TenantMembership, context: PortalContext, checked: boolean) => {
    const newContexts = checked
      ? [...membership.allowed_contexts, context]
      : membership.allowed_contexts.filter(c => c !== context);
    onContextChange(membership, newContexts);
  };

  return (
    <section className="mb-8">
      <h2 
        className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        Scope Assignments
      </h2>
      <div 
        className="rounded overflow-hidden"
        style={{ 
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)'
        }}
      >
        {memberships.length === 0 ? (
          <div className="p-6">
            <p 
              className="text-[14px]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              No organization assignments.
            </p>
            <p 
              className="text-[13px] mt-1"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              User has not been assigned to any organizations.
            </p>
          </div>
        ) : (
          <div>
            {memberships.map((membership, index) => (
              <div
                key={membership.id}
                className="p-5"
                style={{ 
                  borderTop: index > 0 ? '1px solid var(--platform-border)' : undefined
                }}
              >
                {/* Organization Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p 
                      className="text-[15px] font-medium"
                      style={{ color: 'var(--platform-text)' }}
                    >
                      {membership.tenant_name}
                    </p>
                    <p 
                      className="text-[13px] mt-0.5"
                      style={{ color: 'var(--platform-text-secondary)' }}
                    >
                      {formatRole(membership.role)} · {formatStatus(membership.status)}
                    </p>
                  </div>
                  {editMode && (
                    <div className="flex gap-2">
                      {membership.status === "active" && (
                        <button
                          onClick={() => onStatusChange(membership, "suspended")}
                          className="px-2.5 py-1 text-[11px] rounded transition-colors"
                          style={{ 
                            color: 'var(--platform-text-muted)',
                            border: '1px solid var(--platform-border)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          Suspend
                        </button>
                      )}
                      {membership.status !== "active" && (
                        <button
                          onClick={() => onStatusChange(membership, "active")}
                          className="px-2.5 py-1 text-[11px] rounded transition-colors"
                          style={{ 
                            color: 'var(--platform-text-muted)',
                            border: '1px solid var(--platform-border)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => onStatusChange(membership, "revoked")}
                        className="px-2.5 py-1 text-[11px] rounded transition-colors"
                        style={{ 
                          color: '#B54545',
                          border: '1px solid #4A2525'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(181,69,69,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Revoke
                      </button>
                    </div>
                  )}
                </div>

                {/* Role Assignment */}
                <div className="mb-4">
                  <p 
                    className="text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
                    style={{ color: 'var(--platform-text-muted)' }}
                  >
                    Organization Role
                  </p>
                  <p 
                    className="text-[13px] mb-2"
                    style={{ color: 'var(--platform-text-secondary)' }}
                  >
                    {getTenantRoleDescription(membership.role)}
                  </p>
                  {editMode && (
                    <div className="flex gap-2 mt-2">
                      {(["tenant_admin", "tenant_user", "viewer"] as PortalRole[]).map((role) => (
                        <button
                          key={role}
                          onClick={() => membership.role !== role && onRoleChange(membership, role)}
                          className="px-3 py-1.5 text-[12px] rounded transition-colors"
                          style={{ 
                            backgroundColor: membership.role === role 
                              ? 'rgba(255,255,255,0.1)' 
                              : 'transparent',
                            color: membership.role === role 
                              ? 'var(--platform-text)' 
                              : 'var(--platform-text-muted)',
                            border: '1px solid var(--platform-border)'
                          }}
                          onMouseEnter={(e) => {
                            if (membership.role !== role) {
                              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (membership.role !== role) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {formatRole(role)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Context Access */}
                <div>
                  <p 
                    className="text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
                    style={{ color: 'var(--platform-text-muted)' }}
                  >
                    Context Access
                  </p>
                  <div className="flex gap-4">
                    {allContexts.map((context) => {
                      const hasAccess = membership.allowed_contexts.includes(context);
                      const label = context.charAt(0).toUpperCase() + context.slice(1);
                      
                      if (editMode) {
                        return (
                          <label 
                            key={context}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={hasAccess}
                              onCheckedChange={(checked) => 
                                handleContextToggle(membership, context, !!checked)
                              }
                              className="border-white/20 data-[state=checked]:bg-white/90 data-[state=checked]:text-black"
                            />
                            <span 
                              className="text-[13px]"
                              style={{ color: 'var(--platform-text-secondary)' }}
                            >
                              {label}
                            </span>
                          </label>
                        );
                      }

                      return (
                        <span
                          key={context}
                          className="text-[13px]"
                          style={{ 
                            color: hasAccess 
                              ? 'var(--platform-text)' 
                              : 'var(--platform-text-muted)',
                            textDecoration: hasAccess ? 'none' : 'line-through'
                          }}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
