import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { AppSheet, AppSheetBody } from "@/components/ui/app-sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AuthorityRecordSheet } from "./AuthorityRecordSheet";
import { toast } from "@/hooks/use-toast";
import {
  SettingsRow,
  SettingsSectionCard,
} from "@/components/ui/settings-row";
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
  const [copied, setCopied] = useState(false);

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

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      toast({ description: "Copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ description: "Failed to copy", variant: "destructive" });
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
          <SettingsSectionCard
            title="Identity"
            description="Account identification and status"
          >
            {/* Email with copy - custom row for truncation */}
            <div 
              className="px-4 py-4 sm:px-6 flex items-center justify-between gap-2"
              style={{ borderBottom: '1px solid var(--platform-border)' }}
            >
              <div className="min-w-0 flex-1">
                <span 
                  className="text-[12px] block mb-1"
                  style={{ color: 'var(--platform-text-muted)' }}
                >
                  Email
                </span>
                <span 
                  className="text-[14px] block whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ color: 'var(--platform-text)' }}
                  title={user.email}
                >
                  {user.email}
                  {isCurrentUser && (
                    <span 
                      className="ml-2 text-[10px] uppercase tracking-wide"
                      style={{ color: 'var(--platform-text-muted)' }}
                    >
                      (you)
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="shrink-0 p-2 rounded transition-colors hover:bg-white/[0.06] min-h-[44px] min-w-[44px] flex items-center justify-center"
                style={{ color: 'var(--platform-text-muted)' }}
                aria-label="Copy email"
              >
                {copied ? (
                  <Check className="h-4 w-4" style={{ color: '#4ade80' }} />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Account Created */}
            <SettingsRow
              label="Account Created"
              value={formatDate(user.created_at)}
              variant="readonly"
            />

            {/* Account Status - pill display */}
            <div 
              className="px-4 py-4 sm:px-6 flex items-center justify-between gap-2"
              style={{ borderBottom: '1px solid var(--platform-border)' }}
            >
              <span 
                className="text-[13px]"
                style={{ color: 'var(--platform-text-secondary)' }}
              >
                Account Status
              </span>
              <span 
                className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium"
                style={{ 
                  backgroundColor: getStatusColorStyle(user.status).bg,
                  color: getStatusColorStyle(user.status).text,
                }}
              >
                {formatStatus(user.status)}
              </span>
            </div>
          </SettingsSectionCard>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 2: PLATFORM AUTHORITY
              ═══════════════════════════════════════════════════════════════════ */}
          <SettingsSectionCard
            title="Platform Authority"
            description={isCurrentUser 
              ? "You cannot modify your own access" 
              : "Role determines system-wide authority level"}
          >
            {/* Platform Role - pill display */}
            <div 
              className="px-4 py-4 sm:px-6 flex items-center justify-between gap-2"
              style={{ borderBottom: '1px solid var(--platform-border)' }}
            >
              <span 
                className="text-[13px]"
                style={{ color: 'var(--platform-text-secondary)' }}
              >
                Platform Role
              </span>
              <span 
                className="inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-medium"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'var(--platform-text)',
                }}
              >
                {formatPlatformRole(user.platform_role)}
              </span>
            </div>

            {/* View Authority Record */}
            <SettingsRow
              label="Authority & Permissions"
              value="View record"
              variant="select"
              onSelect={() => setAuthorityRecordOpen(true)}
            />
          </SettingsSectionCard>

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
                  <SettingsSectionCard
                    key={membership.id}
                    title={membership.tenant_name}
                    description={formatRole(membership.role)}
                  >
                    {/* Context Access */}
                    <div 
                      className="px-4 py-3 sm:px-6"
                      style={{ borderBottom: '1px solid var(--platform-border)' }}
                    >
                      <span 
                        className="text-[11px] font-medium uppercase tracking-[0.04em] block mb-2"
                        style={{ color: 'var(--platform-text-muted)' }}
                      >
                        Context Access
                      </span>
                      <div className="flex flex-wrap gap-1.5">
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
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                color: 'var(--platform-text-secondary)',
                              }}
                            >
                              {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Membership Status */}
                    <div 
                      className="px-4 py-3 sm:px-6 flex items-center justify-between gap-2"
                    >
                      <span 
                        className="text-[12px]"
                        style={{ color: 'var(--platform-text-muted)' }}
                      >
                        Status
                      </span>
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ 
                          backgroundColor: getStatusColorStyle(membership.status).bg,
                          color: getStatusColorStyle(membership.status).text,
                        }}
                      >
                        {formatStatus(membership.status)}
                      </span>
                    </div>
                  </SettingsSectionCard>
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
              <SettingsSectionCard
                title="Audit Metadata"
                description="Authority changes are logged and timestamped"
              >
                <SettingsRow
                  label="Record Created"
                  value={formatDate(user.created_at)}
                  variant="readonly"
                />
              </SettingsSectionCard>
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
