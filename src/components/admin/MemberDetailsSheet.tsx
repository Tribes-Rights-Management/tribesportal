import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { AppSheet, AppSheetBody } from "@/components/ui/app-sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AuthorityRecordSheet } from "./AuthorityRecordSheet";
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

interface MemberDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithProfile | null;
  currentUserId: string | undefined;
  updating: string | null;
  onUpdatePlatformRole: (userId: string, userProfileId: string, newRole: PlatformRole) => void;
  onUpdateUserStatus: (userId: string, userProfileId: string, newStatus: MembershipStatus) => void;
  onUpdateMembershipStatus: (membershipId: string, newStatus: MembershipStatus) => void;
}

/**
 * MEMBER DETAILS SHEET — INSTITUTIONAL GOVERNANCE VIEW
 * 
 * Structure:
 * - Section 1: Identity (Email, Account Created, Status pill)
 * - Section 2: Platform Authority (Role as read-only, immutability explanation)
 * - Section 3: Organization Memberships (each org as a card)
 * - Section 4: Governance (collapsed, audit metadata only)
 * 
 * Rules:
 * - No disabled inputs for display-only data
 * - Status/Role shown as pills, not form controls
 * - Authority Record is a child sheet, not a page
 */
export function MemberDetailsSheet({
  open,
  onOpenChange,
  user,
  currentUserId,
  updating,
  onUpdatePlatformRole,
  onUpdateUserStatus,
  onUpdateMembershipStatus,
}: MemberDetailsSheetProps) {
  const [authorityRecordOpen, setAuthorityRecordOpen] = useState(false);
  const [governanceOpen, setGovernanceOpen] = useState(false);

  if (!user) return null;

  const isCurrentUser = user.user_id === currentUserId;

  const formatRole = (role: PortalRole): string => {
    switch (role) {
      case "tenant_admin": return "Administrator";
      case "tenant_user": return "Member";
      case "viewer": return "Viewer";
      default: return role;
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

  const formatContexts = (contexts: string[]): string => {
    return contexts.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") || "None";
  };

  const formatStatus = (status: MembershipStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch {
      return date;
    }
  };

  const getStatusColor = (status: MembershipStatus) => {
    switch (status) {
      case "active":
        return { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80" };
      case "pending":
        return { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15" };
      case "suspended":
        return { bg: "rgba(249, 115, 22, 0.15)", text: "#fb923c" };
      case "revoked":
      case "denied":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" };
      default:
        return { bg: "rgba(255,255,255,0.06)", text: "var(--platform-text)" };
    }
  };

  return (
    <>
      <AppSheet 
        open={open} 
        onOpenChange={onOpenChange}
        title="Member Details"
        description={user.full_name || user.email}
        width="lg"
      >
        <AppSheetBody className="space-y-8">
          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 1: IDENTITY
              ═══════════════════════════════════════════════════════════════════ */}
          <section>
            <h2 
              className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Identity
            </h2>
            <div 
              className="rounded-lg p-5 space-y-4"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--platform-border)',
              }}
            >
              {/* Email */}
              <div className="flex items-start justify-between gap-4">
                <span 
                  className="text-[12px] shrink-0"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Email
                </span>
                <span 
                  className="text-[14px] text-right break-all font-mono"
                  style={{ color: 'var(--platform-text)' }}
                >
                  {user.email}
                  {isCurrentUser && (
                    <span 
                      className="ml-2 text-[10px] uppercase tracking-wide font-sans"
                      style={{ color: 'var(--platform-text-muted)' }}
                    >
                      (you)
                    </span>
                  )}
                </span>
              </div>

              {/* Account Created */}
              <div className="flex items-center justify-between">
                <span 
                  className="text-[12px]"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Account Created
                </span>
                <span 
                  className="text-[13px]"
                  style={{ color: 'var(--platform-text-secondary)' }}
                >
                  {formatDate(user.created_at)}
                </span>
              </div>

              {/* Account Status - Always as pill */}
              <div className="flex items-center justify-between">
                <span 
                  className="text-[12px]"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Account Status
                </span>
                <div 
                  className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium"
                  style={{ 
                    backgroundColor: getStatusColor(user.status).bg,
                    color: getStatusColor(user.status).text,
                  }}
                >
                  {formatStatus(user.status)}
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 2: PLATFORM AUTHORITY
              ═══════════════════════════════════════════════════════════════════ */}
          <section>
            <h2 
              className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Platform Authority
            </h2>
            <div 
              className="rounded-lg p-5 space-y-4"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--platform-border)',
              }}
            >
              {/* Platform Role - Always read-only display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[12px]"
                    style={{ color: 'var(--platform-text-muted)' }}
                  >
                    Platform Role
                  </span>
                  <div 
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-medium"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'var(--platform-text)',
                    }}
                  >
                    {formatPlatformRole(user.platform_role)}
                  </div>
                </div>
                <p 
                  className="text-[12px]"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  {isCurrentUser 
                    ? "You cannot modify your own access."
                    : "Role determines system-wide authority level."}
                </p>
              </div>

              {/* View Authority Record Action */}
              <button
                onClick={() => setAuthorityRecordOpen(true)}
                className="w-full h-11 flex items-center justify-between px-4 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--platform-border)',
                  color: 'var(--platform-text)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
              >
                <span className="text-[14px]">View Authority Record</span>
                <ChevronRight className="h-4 w-4" style={{ color: 'var(--platform-text-muted)' }} />
              </button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 3: ORGANIZATION MEMBERSHIPS
              ═══════════════════════════════════════════════════════════════════ */}
          <section>
            <h2 
              className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Organization Memberships
            </h2>
            
            {user.memberships.length === 0 ? (
              <div 
                className="py-8 text-center rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--platform-border)',
                }}
              >
                <p className="text-[13px]" style={{ color: 'var(--platform-text-muted)' }}>
                  No organization memberships
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {user.memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="rounded-lg p-5"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--platform-border)',
                    }}
                  >
                    {/* Organization Name */}
                    <div 
                      className="text-[15px] font-medium mb-4"
                      style={{ color: 'var(--platform-text)' }}
                    >
                      {membership.tenant_name}
                    </div>
                    
                    {/* Stacked Details */}
                    <div className="space-y-3">
                      {/* Organization Role - Read-only */}
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[12px]"
                          style={{ color: 'var(--platform-text-muted)' }}
                        >
                          Organization Role
                        </span>
                        <div 
                          className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium"
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            color: 'var(--platform-text)',
                          }}
                        >
                          {formatRole(membership.role)}
                        </div>
                      </div>
                      
                      {/* Context Access - Read-only */}
                      <div className="flex items-start justify-between gap-4">
                        <span 
                          className="text-[12px] shrink-0"
                          style={{ color: 'var(--platform-text-muted)' }}
                        >
                          Context Access
                        </span>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {membership.allowed_contexts.length === 0 ? (
                            <span 
                              className="text-[12px]"
                              style={{ color: 'var(--platform-text-muted)' }}
                            >
                              None
                            </span>
                          ) : (
                            membership.allowed_contexts.map((ctx) => (
                              <span
                                key={ctx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px]"
                                style={{ 
                                  backgroundColor: 'rgba(255,255,255,0.04)',
                                  color: 'var(--platform-text-secondary)',
                                }}
                              >
                                {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                      
                      {/* Membership Status - Read-only pill */}
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[12px]"
                          style={{ color: 'var(--platform-text-muted)' }}
                        >
                          Membership Status
                        </span>
                        <div 
                          className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium"
                          style={{ 
                            backgroundColor: getStatusColor(membership.status).bg,
                            color: getStatusColor(membership.status).text,
                          }}
                        >
                          {formatStatus(membership.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 4: GOVERNANCE (Collapsed by default)
              ═══════════════════════════════════════════════════════════════════ */}
          <Collapsible open={governanceOpen} onOpenChange={setGovernanceOpen}>
            <CollapsibleTrigger asChild>
              <button
                className="w-full flex items-center justify-between py-3"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                <span className="text-[10px] font-medium uppercase tracking-[0.08em]">
                  Governance
                </span>
                {governanceOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div 
                className="rounded-lg p-5 space-y-3"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--platform-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[11px]"
                    style={{ color: 'var(--platform-text-muted)' }}
                  >
                    Record Created
                  </span>
                  <span 
                    className="text-[12px] font-mono"
                    style={{ color: 'var(--platform-text-secondary)' }}
                  >
                    {formatDate(user.created_at)}
                  </span>
                </div>
                <div 
                  className="text-[11px] pt-2"
                  style={{ 
                    color: 'var(--platform-text-muted)',
                    borderTop: '1px solid var(--platform-border)',
                  }}
                >
                  Authority changes are logged and timestamped.
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </AppSheetBody>
      </AppSheet>

      {/* Child Sheet: Authority Record */}
      <AuthorityRecordSheet
        open={authorityRecordOpen}
        onOpenChange={setAuthorityRecordOpen}
        user={user}
        isCurrentUser={isCurrentUser}
      />
    </>
  );
}