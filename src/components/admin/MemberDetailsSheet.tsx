import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { AppSheet, AppSheetBody } from "@/components/ui/app-sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AuthorityRecordSheet } from "./AuthorityRecordSheet";
import {
  AppDetailRow,
  AppSettingsCard,
} from "@/components/app-ui";
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
 * MEMBER DETAILS SHEET — MOBILE-FIRST VERTICAL LAYOUT
 * 
 * Uses SettingsRow/SettingsSectionCard for consistent patterns.
 * No grey bars, no horizontal scrolling.
 * 
 * Sections:
 * 1. Identity (email with copy, account created, status pill)
 * 2. Platform Authority (role as read-only pill)
 * 3. Organization Memberships (stacked cards)
 * 4. Governance (collapsed audit metadata)
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

  // Scroll to top when sheet opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure sheet is rendered
      setTimeout(() => {
        const sheetBody = document.querySelector('[data-sheet-body]');
        if (sheetBody) sheetBody.scrollTop = 0;
      }, 50);
    }
  }, [open]);

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

  const getStatusColorStyle = (status: MembershipStatus) => {
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
        <AppSheetBody className="space-y-6 overflow-x-hidden" data-sheet-body>
          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 1: IDENTITY
              ═══════════════════════════════════════════════════════════════════ */}
          <AppSettingsCard
            title="Identity"
            description="Account identification and status"
          >
            {/* Email with copy */}
            <AppDetailRow
              label="Email"
              value={
                <>
                  {user.email}
                  {isCurrentUser && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                      (you)
                    </span>
                  )}
                </>
              }
              variant="copyable"
            />

            {/* Account Created */}
            <AppDetailRow
              label="Account Created"
              value={formatDate(user.created_at)}
              variant="readonly"
            />

            {/* Account Status */}
            <AppDetailRow
              label="Account Status"
              value={formatStatus(user.status)}
              variant="readonly"
            />
          </AppSettingsCard>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 2: PLATFORM AUTHORITY
              ═══════════════════════════════════════════════════════════════════ */}
          <AppSettingsCard
            title="Platform Authority"
            description={isCurrentUser 
              ? "You cannot modify your own access" 
              : "Role determines system-wide authority level"}
          >
            <AppDetailRow
              label="Platform Role"
              value={formatPlatformRole(user.platform_role)}
              variant="readonly"
            />
            <AppDetailRow
              label="Authority & Permissions"
              value="View record"
              variant="select"
              onSelect={() => setAuthorityRecordOpen(true)}
            />
          </AppSettingsCard>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 3: ORGANIZATION MEMBERSHIPS
              ═══════════════════════════════════════════════════════════════════ */}
          <section>
            <h2 
              className="text-[10px] font-medium uppercase tracking-[0.08em] mb-3"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Organization Memberships
            </h2>
            
            {user.memberships.length === 0 ? (
              <div 
                className="py-8 text-center rounded-lg"
                style={{ 
                  backgroundColor: 'var(--platform-surface)',
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
                  <AppSettingsCard
                    key={membership.id}
                    title={membership.tenant_name}
                    description={formatRole(membership.role)}
                  >
                    <AppDetailRow
                      label="Context Access"
                      value={membership.allowed_contexts.length === 0 
                        ? "None" 
                        : membership.allowed_contexts.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ")}
                      variant="readonly"
                    />
                    <AppDetailRow
                      label="Status"
                      value={formatStatus(membership.status)}
                      variant="readonly"
                    />
                  </AppSettingsCard>
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
                className="w-full flex items-center justify-between py-3 min-h-[44px]"
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
              <AppSettingsCard
                title="Audit Metadata"
                description="Authority changes are logged and timestamped"
              >
                <AppDetailRow
                  label="Record Created"
                  value={formatDate(user.created_at)}
                  variant="readonly"
                />
              </AppSettingsCard>
            </CollapsibleContent>
          </Collapsible>

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
              You are viewing your own record. Some modifications require another administrator.
            </div>
          )}
        </AppSheetBody>
      </AppSheet>

      {/* Authority Record Child Sheet */}
      <AuthorityRecordSheet
        open={authorityRecordOpen}
        onOpenChange={setAuthorityRecordOpen}
        user={user}
        isCurrentUser={isCurrentUser}
      />
    </>
  );
}
