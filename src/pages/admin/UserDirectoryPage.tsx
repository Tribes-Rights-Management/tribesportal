import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ChevronRight, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MemberDetailsSheet } from "@/components/admin/MemberDetailsSheet";
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

/**
 * MEMBER DIRECTORY PAGE — MOBILE-FIRST VERTICAL LAYOUT
 * 
 * Mobile: Stacked MemberCard list with email + role/status chips
 * Desktop: Table layout with expandable rows
 * 
 * Rules:
 * - No horizontal scrolling
 * - Emails truncate with copy icon
 * - Scroll-to-top on mount
 */
export default function UserDirectoryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, user_id, email, full_name, platform_role, status, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      toast({
        title: "Operation failed",
        description: "Unable to retrieve users",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: memberships, error: membershipsError } = await supabase
      .from("tenant_memberships")
      .select(`
        id,
        user_id,
        tenant_id,
        status,
        role,
        allowed_contexts,
        created_at,
        tenants(name)
      `);

    if (membershipsError) {
      console.error("Error fetching memberships:", membershipsError);
    }

    const membershipsByUser = new Map<string, TenantMembership[]>();
    memberships?.forEach((m: any) => {
      const existing = membershipsByUser.get(m.user_id) || [];
      existing.push({
        id: m.id,
        tenant_id: m.tenant_id,
        tenant_name: m.tenants?.name || "Unknown",
        status: m.status,
        role: m.role,
        allowed_contexts: m.allowed_contexts || [],
        created_at: m.created_at,
      });
      membershipsByUser.set(m.user_id, existing);
    });

    const usersWithMemberships: UserWithProfile[] = (profiles || []).map(profile => ({
      ...profile,
      memberships: membershipsByUser.get(profile.user_id) || [],
    }));

    setUsers(usersWithMemberships);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updatePlatformRole = async (userId: string, userProfileId: string, newRole: PlatformRole) => {
    if (userId === currentProfile?.user_id) {
      toast({
        title: "Operation denied",
        description: "Cannot modify own role",
        variant: "destructive",
      });
      return;
    }

    setUpdating(userProfileId);
    const { error } = await supabase
      .from("user_profiles")
      .update({ platform_role: newRole })
      .eq("id", userProfileId);

    if (error) {
      toast({
        title: "Operation failed",
        description: "Unable to update role",
        variant: "destructive",
      });
    } else {
      toast({ title: "Role updated" });
      fetchUsers();
    }
    setUpdating(null);
  };

  const updateUserStatus = async (userId: string, userProfileId: string, newStatus: MembershipStatus) => {
    if (userId === currentProfile?.user_id) {
      toast({
        title: "Operation denied",
        description: "Cannot modify own status",
        variant: "destructive",
      });
      return;
    }

    setUpdating(userProfileId);
    const { error } = await supabase
      .from("user_profiles")
      .update({ status: newStatus })
      .eq("id", userProfileId);

    if (error) {
      toast({
        title: "Operation failed",
        description: "Unable to update status",
        variant: "destructive",
      });
    } else {
      toast({ title: "Status updated" });
      fetchUsers();
    }
    setUpdating(null);
  };

  const updateMembershipStatus = async (membershipId: string, newStatus: MembershipStatus) => {
    setUpdating(membershipId);
    const { error } = await supabase
      .from("tenant_memberships")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", membershipId);

    if (error) {
      toast({
        title: "Operation failed",
        description: "Unable to update membership",
        variant: "destructive",
      });
    } else {
      toast({ title: "Membership updated" });
      fetchUsers();
    }
    setUpdating(null);
  };

  const formatPlatformRole = (role: PlatformRole): string => {
    switch (role) {
      case "platform_admin": return "Admin";
      case "platform_user": return "User";
      case "external_auditor": return "Auditor";
      default: return role;
    }
  };

  const formatStatus = (status: MembershipStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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

  const handleRowClick = (user: UserWithProfile) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-full py-6 sm:py-10 px-4 sm:px-6 overflow-x-hidden"
      style={{ backgroundColor: 'var(--platform-canvas)' }}
    >
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link 
            to="/admin" 
            className="h-11 w-11 sm:h-8 sm:w-8 rounded flex items-center justify-center transition-colors shrink-0"
            style={{ color: 'var(--platform-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" />
          </Link>
          <div className="min-w-0">
            <h1 
              className="text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em]"
              style={{ color: 'var(--platform-text)' }}
            >
              Member Directory
            </h1>
            <p 
              className="text-[14px] sm:text-[15px] mt-0.5"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {users.length} account(s)
            </p>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div 
            className="py-16 text-center text-[14px] rounded-lg"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-secondary)' 
            }}
          >
            Retrieving records
          </div>
        ) : users.length === 0 ? (
          <div 
            className="py-16 text-center rounded-lg"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              border: '1px solid var(--platform-border)',
              color: 'var(--platform-text-secondary)' 
            }}
          >
            <p className="text-[14px]">No users.</p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--platform-text-muted)' }}>
              Records will appear when users are provisioned.
            </p>
          </div>
        ) : (
          /* Mobile-first: Always use card layout */
          <div className="space-y-2">
            {users.map((user) => (
              <MemberCard
                key={user.id}
                user={user}
                isCurrentUser={user.user_id === currentProfile?.user_id}
                onSelect={() => handleRowClick(user)}
                formatPlatformRole={formatPlatformRole}
                formatStatus={formatStatus}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Member Details Sheet */}
      <MemberDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        user={selectedUser}
        currentUserId={currentProfile?.user_id}
        updating={updating}
        onUpdatePlatformRole={updatePlatformRole}
        onUpdateUserStatus={updateUserStatus}
        onUpdateMembershipStatus={updateMembershipStatus}
      />
    </div>
  );
}

/**
 * MEMBER CARD — Mobile-first list item
 * 
 * Row 1: Email (truncated) + chevron
 * Row 2: Role + Status chips (wrap, never overflow)
 */
interface MemberCardProps {
  user: UserWithProfile;
  isCurrentUser: boolean;
  onSelect: () => void;
  formatPlatformRole: (role: PlatformRole) => string;
  formatStatus: (status: MembershipStatus) => string;
  getStatusColor: (status: MembershipStatus) => { bg: string; text: string };
}

function MemberCard({
  user,
  isCurrentUser,
  onSelect,
  formatPlatformRole,
  formatStatus,
  getStatusColor,
}: MemberCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      toast({ description: "Copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ description: "Failed to copy", variant: "destructive" });
    }
  };

  const activeOrgCount = user.memberships.filter(m => m.status === "active").length;

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-lg p-4 transition-colors overflow-hidden"
      style={{ 
        backgroundColor: 'var(--platform-surface)',
        border: '1px solid var(--platform-border)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--platform-surface)'}
    >
      {/* Row 1: Email + Copy + Chevron */}
      <div className="flex items-center gap-2">
        {/* Email - truncates */}
        <div className="min-w-0 flex-1">
          <div 
            className="text-[15px] font-medium whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ color: 'var(--platform-text)' }}
            title={user.email}
          >
            {user.email}
          </div>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
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

        {/* Chevron */}
        <ChevronRight 
          className="h-5 w-5 shrink-0" 
          style={{ color: 'var(--platform-text-muted)' }} 
        />
      </div>

      {/* Row 2: Chips (wrap allowed) */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {/* Role chip */}
        <span 
          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: 'var(--platform-text-secondary)',
          }}
        >
          {formatPlatformRole(user.platform_role)}
        </span>

        {/* Status chip */}
        <span 
          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
          style={{ 
            backgroundColor: getStatusColor(user.status).bg,
            color: getStatusColor(user.status).text,
          }}
        >
          {formatStatus(user.status)}
        </span>

        {/* Org count */}
        {activeOrgCount > 0 && (
          <span 
            className="text-[11px]"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            {activeOrgCount} org(s)
          </span>
        )}

        {/* Current user indicator */}
        {isCurrentUser && (
          <span 
            className="text-[10px] uppercase tracking-wide"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            (you)
          </span>
        )}
      </div>
    </button>
  );
}
