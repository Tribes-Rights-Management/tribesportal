import { X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSheet, AppSheetBody, AppSheetHeader } from "@/components/ui/app-sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
 * MEMBER DETAILS SHEET — INSTITUTIONAL STANDARD
 * 
 * - Full-height bottom sheet on mobile (90-95vh)
 * - Side panel on desktop
 * - Vertical, scrollable content
 * - Stacked cards for memberships (no tables)
 * - Full-width controls with min 44px height
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
  const navigate = useNavigate();

  if (!user) return null;

  const isCurrentUser = user.user_id === currentUserId;

  const formatRole = (role: PortalRole): string => {
    switch (role) {
      case "tenant_admin": return "Admin";
      case "tenant_user": return "Member";
      case "viewer": return "Viewer";
      default: return role;
    }
  };

  const formatPlatformRole = (role: PlatformRole): string => {
    switch (role) {
      case "platform_admin": return "Administrator";
      case "platform_user": return "User";
      case "external_auditor": return "Auditor";
      default: return role;
    }
  };

  const formatContexts = (contexts: string[]): string => {
    return contexts.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") || "None";
  };

  const formatStatus = (status: MembershipStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <AppSheet 
      open={open} 
      onOpenChange={onOpenChange}
      title="Member Details"
      description={user.email}
      width="lg"
    >
      <AppSheetBody className="space-y-6">
        {/* Email Section */}
        <div>
          <label 
            className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Email Address
          </label>
          <div 
            className="text-[15px] break-words"
            style={{ color: 'var(--platform-text)' }}
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
          </div>
        </div>

        {/* Platform Role */}
        <div>
          <label 
            className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Platform Role
          </label>
          {isCurrentUser ? (
            <div>
              <div 
                className="inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-medium"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'var(--platform-text)',
                }}
              >
                {formatPlatformRole(user.platform_role)}
              </div>
              <p className="text-[12px] mt-2" style={{ color: 'var(--platform-text-muted)' }}>
                You cannot change your own role.
              </p>
            </div>
          ) : (
            <Select
              value={user.platform_role}
              onValueChange={(value) => onUpdatePlatformRole(user.user_id, user.id, value as PlatformRole)}
              disabled={updating === user.id}
            >
              <SelectTrigger 
                className="w-full h-11 text-[14px] bg-transparent border-white/10"
                style={{ color: 'var(--platform-text)' }}
              >
                <SelectValue>{formatPlatformRole(user.platform_role)}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1B] border-white/10">
                <SelectItem value="platform_admin" className="text-white/80 focus:bg-white/10 focus:text-white">Administrator</SelectItem>
                <SelectItem value="platform_user" className="text-white/80 focus:bg-white/10 focus:text-white">User</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Account Status */}
        <div>
          <label 
            className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Account Status
          </label>
          {isCurrentUser ? (
            <div>
              <div 
                className="inline-flex items-center px-3 py-1.5 rounded-md text-[13px] font-medium"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'var(--platform-text)',
                }}
              >
                {formatStatus(user.status)}
              </div>
              <p className="text-[12px] mt-2" style={{ color: 'var(--platform-text-muted)' }}>
                You cannot change your own access.
              </p>
            </div>
          ) : (
            <Select
              value={user.status}
              onValueChange={(value) => onUpdateUserStatus(user.user_id, user.id, value as MembershipStatus)}
              disabled={updating === user.id}
            >
              <SelectTrigger 
                className="w-full h-11 text-[14px] bg-transparent border-white/10"
                style={{ color: 'var(--platform-text)' }}
              >
                <SelectValue>{formatStatus(user.status)}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1B] border-white/10">
                <SelectItem value="active" className="text-white/80 focus:bg-white/10 focus:text-white">Active</SelectItem>
                <SelectItem value="pending" className="text-white/80 focus:bg-white/10 focus:text-white">Pending</SelectItem>
                <SelectItem value="suspended" className="text-white/80 focus:bg-white/10 focus:text-white">Suspended</SelectItem>
                <SelectItem value="revoked" className="text-white/80 focus:bg-white/10 focus:text-white">Revoked</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Account Created */}
        <div>
          <label 
            className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Account Created
          </label>
          <div 
            className="text-[14px]"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            {new Date(user.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Authority Action */}
        <div>
          <button
            onClick={() => {
              onOpenChange(false);
              navigate(`/admin/users/${user.user_id}/permissions`);
            }}
            className="w-full h-11 flex items-center justify-between px-4 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
          >
            <span className="text-[14px]">View Authority & Permissions</span>
            <ChevronRight className="h-4 w-4" style={{ color: 'var(--platform-text-muted)' }} />
          </button>
        </div>

        {/* Tenant Memberships */}
        <div>
          <label 
            className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-3"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Organization Memberships
          </label>
          
          {user.memberships.length === 0 ? (
            <div 
              className="py-6 text-center rounded-lg"
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
                  className="rounded-lg p-4"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--platform-border)',
                  }}
                >
                  {/* Organization Name */}
                  <div 
                    className="text-[15px] font-medium mb-3"
                    style={{ color: 'var(--platform-text)' }}
                  >
                    {membership.tenant_name}
                  </div>
                  
                  {/* Details Grid - Stacked vertically */}
                  <div className="space-y-3">
                    {/* Role */}
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-[12px]"
                        style={{ color: 'var(--platform-text-muted)' }}
                      >
                        Role
                      </span>
                      <span 
                        className="text-[13px]"
                        style={{ color: 'var(--platform-text-secondary)' }}
                      >
                        {formatRole(membership.role)}
                      </span>
                    </div>
                    
                    {/* Access Scope */}
                    <div className="flex items-start justify-between gap-4">
                      <span 
                        className="text-[12px] shrink-0"
                        style={{ color: 'var(--platform-text-muted)' }}
                      >
                        Access
                      </span>
                      <span 
                        className="text-[13px] text-right break-words"
                        style={{ color: 'var(--platform-text-secondary)' }}
                      >
                        {formatContexts(membership.allowed_contexts)}
                      </span>
                    </div>
                    
                    {/* Membership Status with Selector */}
                    <div className="pt-2" style={{ borderTop: '1px solid var(--platform-border)' }}>
                      <label 
                        className="block text-[11px] font-medium uppercase tracking-[0.04em] mb-2"
                        style={{ color: 'var(--platform-text-muted)' }}
                      >
                        Membership Status
                      </label>
                      <Select
                        value={membership.status}
                        onValueChange={(value) => onUpdateMembershipStatus(membership.id, value as MembershipStatus)}
                        disabled={updating === membership.id}
                      >
                        <SelectTrigger 
                          className="w-full h-10 text-[13px] bg-transparent border-white/10"
                          style={{ color: 'var(--platform-text)' }}
                        >
                          <SelectValue>{formatStatus(membership.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1B] border-white/10">
                          <SelectItem value="active" className="text-white/80 focus:bg-white/10 focus:text-white">Active</SelectItem>
                          <SelectItem value="pending" className="text-white/80 focus:bg-white/10 focus:text-white">Pending</SelectItem>
                          <SelectItem value="suspended" className="text-white/80 focus:bg-white/10 focus:text-white">Suspended</SelectItem>
                          <SelectItem value="revoked" className="text-white/80 focus:bg-white/10 focus:text-white">Revoked</SelectItem>
                          <SelectItem value="denied" className="text-white/80 focus:bg-white/10 focus:text-white">Denied</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppSheetBody>
    </AppSheet>
  );
}
