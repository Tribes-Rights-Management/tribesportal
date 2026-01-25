import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { AppSheet, AppSheetBody } from "@/components/ui/app-sheet";
import {
  SettingsRow,
  SettingsSectionCard,
} from "@/components/ui/settings-row";
import { AppButton } from "@/components/app-ui";
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
 * AUTHORITY RECORD SHEET — MOBILE-FIRST VERTICAL LAYOUT
 * 
 * Back navigation returns to Member Details (parent sheet stays open).
 * 
 * Sections:
 * 1. User Identity Summary
 * 2. Platform-Level Capabilities (role + granted rights as chips)
 * 3. Organization-Level Capabilities (per-org cards)
 * 4. Audit Metadata
 * 5. Governance Notice
 * 
 * Rules:
 * - No horizontal scrolling
 * - Capabilities render as wrapping chips, never overflow
 * - Scroll-to-top on open
 */
export function AuthorityRecordSheet({
  open,
  onOpenChange,
  user,
  isCurrentUser,
}: AuthorityRecordSheetProps) {
  const capabilities = ["View", "Submit", "Approve", "Execute", "Export", "Administer"];

  // Scroll to top when sheet opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const sheetBody = document.querySelector('[data-authority-sheet-body]');
        if (sheetBody) sheetBody.scrollTop = 0;
      }, 50);
    }
  }, [open]);

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
      <AppSheetBody className="space-y-6 overflow-x-hidden" data-authority-sheet-body>
        {/* Back to Member Details */}
        <AppButton
          onClick={() => onOpenChange(false)}
          intent="ghost"
          size="sm"
          icon={<ArrowLeft />}
          className="-mt-2"
        >
          Back to Member Details
        </AppButton>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: USER IDENTITY SUMMARY
            ═══════════════════════════════════════════════════════════════════ */}
        <SettingsSectionCard
          title="User Identity"
          description="Primary identification"
        >
          <SettingsRow
            label="Display Name"
            value={user.full_name || "—"}
            variant="readonly"
          />
          <SettingsRow
            label="Email"
            value={user.email}
            variant="copyable"
          />
        </SettingsSectionCard>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: PLATFORM-LEVEL CAPABILITIES
            ═══════════════════════════════════════════════════════════════════ */}
        <SettingsSectionCard
          title="Platform-Level Capabilities"
          description="System-wide authority derived from platform role"
        >
          {/* Platform Role - pill display */}
          <div 
            className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            style={{ borderBottom: '1px solid var(--platform-border)' }}
          >
            <span 
              className="text-[13px]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Assigned Role
            </span>
            <span 
              className="inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-medium self-start sm:self-auto"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: 'var(--platform-text)',
              }}
            >
              {formatPlatformRole(user.platform_role)}
            </span>
          </div>

          {/* Capabilities as wrapping chips */}
          <div className="px-4 py-4 sm:px-6">
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
                  <span
                    key={cap}
                    className="px-2.5 py-1 text-[12px] rounded"
                    style={{ 
                      backgroundColor: isGranted 
                        ? 'hsl(var(--border))' 
                        : 'transparent',
                      color: isGranted 
                        ? 'var(--platform-text)' 
                        : 'var(--platform-text-muted)',
                      border: `1px solid ${isGranted ? 'hsl(var(--border))' : 'var(--platform-border)'}`,
                      opacity: isGranted ? 1 : 0.5,
                    }}
                  >
                    {cap}
                  </span>
                );
              })}
            </div>
          </div>
        </SettingsSectionCard>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: ORGANIZATION-LEVEL CAPABILITIES
            ═══════════════════════════════════════════════════════════════════ */}
        <section>
          <h2 
            className="text-[10px] font-medium uppercase tracking-[0.08em] mb-3"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Organization-Level Capabilities
          </h2>
          
          {activeMemberships.length === 0 ? (
            <div 
              className="py-8 text-center rounded-lg"
              style={{ 
                backgroundColor: 'var(--platform-surface)',
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
                  <SettingsSectionCard
                    key={membership.id}
                    title={membership.tenant_name}
                    description={formatRole(membership.role)}
                  >
                    {/* Context Scope */}
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

                    {/* Granted Rights */}
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
                            <span
                              key={`${membership.id}-${cap}`}
                              className="px-2 py-0.5 text-[11px] rounded"
                              style={{ 
                                backgroundColor: isGranted 
                                  ? 'rgba(255,255,255,0.06)' 
                                  : 'transparent',
                                color: isGranted 
                                  ? 'var(--platform-text-secondary)' 
                                  : 'var(--platform-text-muted)',
                                border: `1px solid ${isGranted ? 'hsl(var(--border))' : 'var(--platform-border)'}`,
                                opacity: isGranted ? 1 : 0.4,
                              }}
                            >
                              {cap}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </SettingsSectionCard>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4: AUDIT METADATA
            ═══════════════════════════════════════════════════════════════════ */}
        <SettingsSectionCard
          title="Audit Metadata"
          description="Record creation and modification history"
        >
          <SettingsRow
            label="Record Created"
            value={formatDate(user.created_at)}
            variant="readonly"
          />
        </SettingsSectionCard>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5: GOVERNANCE NOTICE
            ═══════════════════════════════════════════════════════════════════ */}
        <div 
          className="p-4 rounded-lg text-[12px]"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--platform-border)',
            color: 'var(--platform-text-muted)',
          }}
        >
          {isCurrentUser ? (
            "Authority records cannot be self-modified. Contact another administrator to adjust your permissions."
          ) : (
            "Authority changes are logged and timestamped. Changes are effective immediately upon confirmation."
          )}
        </div>
      </AppSheetBody>
    </AppSheet>
  );
}
