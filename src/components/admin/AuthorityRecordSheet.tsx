import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { AppSheet, AppSheetBody } from "@/components/ui/app-sheet";
import { DetailRow, DetailRowGroup } from "@/components/ui/detail-row";
import type { Database } from "@/integrations/supabase/types";

type PlatformRole = Database["public"]["Enums"]["platform_role"];
type PortalRole = Database["public"]["Enums"]["portal_role"];
type MembershipStatus = Database["public"]["Enums"]["membership_status"];

interface TenantMembership {
  id: string;
  tenant_id: string;
  tenant_name: string;
  status: MembershipStatus;
  role: PortalRole;
  allowed_contexts: string[];
  created_at: string;
}

interface UserWithProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  platform_role: PlatformRole;
  status: MembershipStatus;
  created_at: string;
  memberships: TenantMembership[];
}

interface AuthorityRecordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithProfile;
  isCurrentUser: boolean;
}

/**
 * AUTHORITY RECORD SHEET — CHILD VIEW OF MEMBER DETAILS
 * 
 * Navigation: Back returns to Member Details (parent sheet stays open)
 * 
 * Layout:
 * - Capabilities as informational labels, not buttons or toggles
 * - Grouped by level: Platform → Organization
 * - Vertical scrolling, no horizontal sections
 * - Read-only: capabilities read as "granted rights", not actions
 */
export function AuthorityRecordSheet({
  open,
  onOpenChange,
  user,
  isCurrentUser,
}: AuthorityRecordSheetProps) {
  const capabilities = ["View", "Submit", "Approve", "Execute", "Export", "Administer"];

  // Derive capabilities from platform role
  const getPlatformCapabilities = (role: PlatformRole): string[] => {
    switch (role) {
      case "platform_admin":
        return ["View", "Submit", "Approve", "Execute", "Export", "Administer"];
      case "external_auditor":
        return ["View", "Export"];
      case "platform_user":
      default:
        return ["View"];
    }
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

  const formatPlatformRole = (role: PlatformRole): string => {
    switch (role) {
      case "platform_admin": return "Platform Administrator";
      case "platform_user": return "Platform User";
      case "external_auditor": return "External Auditor";
      default: return role;
    }
  };

  const formatRole = (role: PortalRole): string => {
    switch (role) {
      case "tenant_admin": return "Administrator";
      case "tenant_user": return "Member";
      case "viewer": return "Viewer";
      default: return role;
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM d, yyyy 'at' HH:mm");
    } catch {
      return date;
    }
  };

  const platformCapabilities = getPlatformCapabilities(user.platform_role);
  const activeMemberships = user.memberships.filter(m => m.status === "active");

  return (
    <AppSheet 
      open={open} 
      onOpenChange={onOpenChange}
      title="Authority Record"
      description="Role assignment and capability matrix"
      width="lg"
    >
      <AppSheetBody className="space-y-8">
        {/* Back to Member Details */}
        <button
          onClick={() => onOpenChange(false)}
          className="flex items-center gap-2 text-[13px] transition-colors -mt-2"
          style={{ color: 'var(--platform-text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--platform-text)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--platform-text-secondary)'}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Member Details</span>
        </button>

        {/* ═══════════════════════════════════════════════════════════════════
            USER IDENTITY SUMMARY
            ═══════════════════════════════════════════════════════════════════ */}
        <div 
          className="rounded-lg overflow-hidden"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--platform-border)',
          }}
        >
          <DetailRowGroup>
            <DetailRow 
              label="Name"
              value={user.full_name || user.email}
            />
            <DetailRow 
              label="Email"
              value={user.email}
              copyable
            />
          </DetailRowGroup>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            PLATFORM-LEVEL CAPABILITIES
            ═══════════════════════════════════════════════════════════════════ */}
        <section>
          <h2 
            className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Platform-Level Capabilities
          </h2>
          <div 
            className="rounded-lg overflow-hidden"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--platform-border)',
            }}
          >
            <DetailRowGroup>
              <DetailRow 
                label="Assigned Role"
                value={formatPlatformRole(user.platform_role)}
                variant="role"
              />
            </DetailRowGroup>

            {/* Capabilities as Labels */}
            <div className="px-4 py-4 sm:px-6" style={{ borderTop: '1px solid var(--platform-border)' }}>
              <span 
                className="text-[11px] font-medium uppercase tracking-[0.04em] block mb-3"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                Granted Rights
              </span>
              <div className="flex flex-wrap gap-2">
                {capabilities.map((cap) => {
                  const isGranted = platformCapabilities.includes(cap);
                  return (
                    <div
                      key={cap}
                      className="px-3 py-1.5 text-[12px] rounded"
                      style={{ 
                        backgroundColor: isGranted 
                          ? 'rgba(255,255,255,0.08)' 
                          : 'transparent',
                        color: isGranted 
                          ? 'var(--platform-text)' 
                          : 'var(--platform-text-muted)',
                        border: `1px solid ${isGranted ? 'rgba(255,255,255,0.12)' : 'var(--platform-border)'}`,
                        opacity: isGranted ? 1 : 0.5,
                      }}
                    >
                      {cap}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            ORGANIZATION-LEVEL CAPABILITIES
            ═══════════════════════════════════════════════════════════════════ */}
        <section>
          <h2 
            className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Organization-Level Capabilities
          </h2>
          
          {activeMemberships.length === 0 ? (
            <div 
              className="py-8 text-center rounded-lg"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--platform-border)',
              }}
            >
              <p className="text-[13px]" style={{ color: 'var(--platform-text-muted)' }}>
                No active organization memberships
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMemberships.map((membership) => {
                const tenantCaps = getTenantCapabilities(membership.role);
                return (
                  <div
                    key={membership.id}
                    className="rounded-lg overflow-hidden"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--platform-border)',
                    }}
                  >
                    {/* Organization Header */}
                    <div 
                      className="px-4 py-3 sm:px-6"
                      style={{ borderBottom: '1px solid var(--platform-border)' }}
                    >
                      <div 
                        className="text-[15px] font-medium"
                        style={{ color: 'var(--platform-text)' }}
                      >
                        {membership.tenant_name}
                      </div>
                      <div 
                        className="text-[13px] mt-1"
                        style={{ color: 'var(--platform-text-secondary)' }}
                      >
                        {formatRole(membership.role)}
                      </div>
                    </div>

                    {/* Context Access */}
                    <div 
                      className="px-4 py-4 sm:px-6" 
                      style={{ borderBottom: '1px solid var(--platform-border)' }}
                    >
                      <span 
                        className="text-[11px] font-medium uppercase tracking-[0.04em] block mb-2"
                        style={{ color: 'var(--platform-text-muted)' }}
                      >
                        Context Scope
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {membership.allowed_contexts.length === 0 ? (
                          <span 
                            className="text-[12px]"
                            style={{ color: 'var(--platform-text-muted)' }}
                          >
                            No contexts assigned
                          </span>
                        ) : (
                          membership.allowed_contexts.map((ctx) => (
                            <span
                              key={ctx}
                              className="inline-flex items-center px-2.5 py-1 rounded text-[11px]"
                              style={{ 
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                color: 'var(--platform-text)',
                              }}
                            >
                              {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Capabilities as Labels */}
                    <div className="px-4 py-4 sm:px-6">
                      <span 
                        className="text-[11px] font-medium uppercase tracking-[0.04em] block mb-3"
                        style={{ color: 'var(--platform-text-muted)' }}
                      >
                        Granted Rights
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {capabilities.map((cap) => {
                          const isGranted = tenantCaps.includes(cap);
                          return (
                            <div
                              key={`${membership.id}-${cap}`}
                              className="px-2.5 py-1 text-[11px] rounded"
                              style={{ 
                                backgroundColor: isGranted 
                                  ? 'rgba(255,255,255,0.06)' 
                                  : 'transparent',
                                color: isGranted 
                                  ? 'var(--platform-text-secondary)' 
                                  : 'var(--platform-text-muted)',
                                border: `1px solid ${isGranted ? 'rgba(255,255,255,0.08)' : 'var(--platform-border)'}`,
                                opacity: isGranted ? 1 : 0.4,
                              }}
                            >
                              {cap}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            AUDIT METADATA
            ═══════════════════════════════════════════════════════════════════ */}
        <section>
          <h2 
            className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Audit Metadata
          </h2>
          <div 
            className="rounded-lg overflow-hidden"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--platform-border)',
            }}
          >
            <DetailRowGroup>
              <DetailRow 
                label="Record Created"
                value={formatDate(user.created_at)}
              />
            </DetailRowGroup>
            <div 
              className="px-4 py-3 sm:px-6 text-[11px]"
              style={{ 
                color: 'var(--platform-text-muted)',
                borderTop: '1px solid var(--platform-border)',
              }}
            >
              Authority changes are logged and timestamped. Changes are effective immediately upon confirmation.
            </div>
          </div>
        </section>

        {/* Self-view notice */}
        {isCurrentUser && (
          <div 
            className="p-4 rounded-lg text-[12px]"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-muted)',
            }}
          >
            Authority records cannot be self-modified. Contact another administrator to adjust your permissions.
          </div>
        )}
      </AppSheetBody>
    </AppSheet>
  );
}
