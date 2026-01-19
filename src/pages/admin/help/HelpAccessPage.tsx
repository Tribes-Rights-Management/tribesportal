import { useState, useEffect, useCallback } from "react";
import { Search, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { PageContainer } from "@/components/ui/page-container";
import { PageShell, ContentPanel, LoadingState, EmptyState } from "@/components/ui/page-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GrantHelpAccessModal } from "@/components/admin/help/GrantHelpAccessModal";
import { RevokeHelpAccessModal } from "@/components/admin/help/RevokeHelpAccessModal";
import { formatDistanceToNow } from "date-fns";

/**
 * HELP ACCESS PAGE — SYSTEM CONSOLE (PLATFORM ADMIN ONLY)
 * 
 * Allows platform admins to grant/revoke Help backend access
 * by toggling platform_user_capabilities.can_manage_help.
 * 
 * Company-scoped: NOT a workspace feature.
 */

interface UserWithHelpAccess {
  user_id: string;
  email: string;
  full_name: string | null;
  platform_role: string;
  can_manage_help: boolean;
  capability_updated_at: string | null;
}

export default function HelpAccessPage() {
  const { isPlatformAdmin, profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<UserWithHelpAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<UserWithHelpAccess | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    // Fetch all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, email, full_name, platform_role")
      .order("email", { ascending: true });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      toast({ 
        title: "Action failed",
        description: "Your change could not be saved. Please try again.", 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }

    // Fetch capabilities
    const { data: capabilities, error: capError } = await supabase
      .from("platform_user_capabilities")
      .select("user_id, can_manage_help, updated_at");

    if (capError) {
      console.error("Error fetching capabilities:", capError);
    }

    // Merge
    const capMap = new Map<string, { can_manage_help: boolean; updated_at: string }>();
    capabilities?.forEach((c) => {
      capMap.set(c.user_id, { can_manage_help: c.can_manage_help, updated_at: c.updated_at });
    });

    const merged: UserWithHelpAccess[] = (profiles || []).map((p) => ({
      user_id: p.user_id,
      email: p.email,
      full_name: p.full_name,
      platform_role: p.platform_role,
      can_manage_help: capMap.get(p.user_id)?.can_manage_help ?? false,
      capability_updated_at: capMap.get(p.user_id)?.updated_at ?? null,
    }));

    setUsers(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleGrantAccess = async (userId: string) => {
    const { error } = await supabase
      .from("platform_user_capabilities")
      .upsert({
        user_id: userId,
        can_manage_help: true,
        updated_at: new Date().toISOString(),
        updated_by: currentProfile?.user_id ?? null,
      });

    if (error) {
      console.error("Grant access error:", error);
      toast({ 
        title: "Action failed",
        description: "Your change could not be saved. Please try again.", 
        variant: "destructive" 
      });
      return false;
    }

    toast({ 
      title: "Help access granted",
      description: "This user can now manage Help content." 
    });
    fetchUsers();
    return true;
  };

  const handleRevokeAccess = async (userId: string) => {
    const { error } = await supabase
      .from("platform_user_capabilities")
      .update({
        can_manage_help: false,
        updated_at: new Date().toISOString(),
        updated_by: currentProfile?.user_id ?? null,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Revoke access error:", error);
      toast({ 
        title: "Action failed",
        description: "Your change could not be saved. Please try again.", 
        variant: "destructive" 
      });
      return false;
    }

    toast({ 
      title: "Help access revoked",
      description: "This user can no longer manage Help content." 
    });
    setRevokeTarget(null);
    fetchUsers();
    return true;
  };

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q))
    );
  });

  // Separate into granted and not granted for display
  const usersWithAccess = filteredUsers.filter((u) => u.can_manage_help);

  // Access guard — this page is only for platform admins
  if (!isPlatformAdmin) {
    return (
      <div 
        className="min-h-full flex items-center justify-center py-16 px-4"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <div className="text-center max-w-md">
          <h2 
            className="text-[18px] font-medium mb-3"
            style={{ color: 'var(--platform-text)' }}
          >
            Access restricted
          </h2>
          <p 
            className="text-[14px] mb-2"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            You do not have permission to manage Help access.
          </p>
          <p 
            className="text-[13px] mb-6"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            This page is available to Platform Administrators only. If you believe you need access, contact your administrator or email contact@tribesassets.com.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/admin'}
            style={{
              borderColor: 'var(--platform-border)',
              color: 'var(--platform-text)',
            }}
          >
            Back to System Console
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageShell
        title="Help Access"
        subtitle="Grant or revoke permission to manage Help content. Changes apply immediately."
        backTo="/admin"
        backLabel="System Console"
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" 
            style={{ color: 'var(--platform-text-muted)' }}
          />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              borderColor: 'var(--platform-border)',
              color: 'var(--platform-text)',
            }}
          />
        </div>
        <Button 
          onClick={() => setGrantModalOpen(true)}
          className="shrink-0"
          style={{
            backgroundColor: 'var(--platform-text)',
            color: 'var(--platform-canvas)',
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Grant access
        </Button>
      </div>

      {/* Content */}
      <ContentPanel>
        {loading ? (
          <LoadingState />
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p 
              className="text-[14px] font-medium mb-1"
              style={{ color: 'var(--platform-text)' }}
            >
              No users found
            </p>
            <p 
              className="text-[13px] mb-1"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              We couldn't load any user records to display here.
            </p>
            <p 
              className="text-[12px]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              If this persists, confirm your user directory source is configured and accessible for administrators.
            </p>
          </div>
        ) : searchQuery && filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p 
              className="text-[14px] font-medium mb-1"
              style={{ color: 'var(--platform-text)' }}
            >
              No matches
            </p>
            <p 
              className="text-[13px] mb-1"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              No users match your search.
            </p>
            <p 
              className="text-[12px]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Try a different name or email.
            </p>
          </div>
        ) : usersWithAccess.length === 0 ? (
          <div className="p-8 text-center">
            <p 
              className="text-[14px] font-medium mb-1"
              style={{ color: 'var(--platform-text)' }}
            >
              No Help managers yet
            </p>
            <p 
              className="text-[13px] mb-1"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              No users currently have Help management access.
            </p>
            <p 
              className="text-[12px]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Grant access to a staff user to enable Help content management.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--platform-border)' }}>
            {usersWithAccess.map((user) => (
              <HelpAccessRow
                key={user.user_id}
                user={user}
                onRevoke={() => setRevokeTarget(user)}
              />
            ))}
          </div>
        )}
      </ContentPanel>

      {/* Grant Modal */}
      <GrantHelpAccessModal
        open={grantModalOpen}
        onOpenChange={setGrantModalOpen}
        users={users.filter((u) => !u.can_manage_help)}
        onGrant={handleGrantAccess}
      />

      {/* Revoke Modal */}
      <RevokeHelpAccessModal
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        user={revokeTarget}
        onConfirm={() => revokeTarget && handleRevokeAccess(revokeTarget.user_id)}
      />
    </PageContainer>
  );
}

/**
 * HelpAccessRow — Individual user row
 */
interface HelpAccessRowProps {
  user: UserWithHelpAccess;
  onRevoke: () => void;
}

function HelpAccessRow({ user, onRevoke }: HelpAccessRowProps) {
  const displayName = user.full_name || user.email;
  const updatedAt = user.capability_updated_at
    ? formatDistanceToNow(new Date(user.capability_updated_at), { addSuffix: true })
    : "—";

  return (
    <div className="flex items-center gap-4 p-4">
      {/* User info */}
      <div className="min-w-0 flex-1">
        <div 
          className="text-[14px] font-medium truncate"
          style={{ color: 'var(--platform-text)' }}
        >
          {displayName}
        </div>
        {user.full_name && (
          <div 
            className="text-[12px] truncate mt-0.5"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            {user.email}
          </div>
        )}
      </div>

      {/* Status badge */}
      <span 
        className="shrink-0 px-2 py-0.5 rounded text-[11px] font-medium"
        style={{ 
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          color: '#4ade80',
        }}
      >
        Enabled
      </span>

      {/* Last updated */}
      <div 
        className="hidden sm:block shrink-0 text-[12px] w-28 text-right"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        {updatedAt}
      </div>

      {/* Revoke action */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRevoke}
        className="shrink-0 text-[12px]"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        Revoke
      </Button>
    </div>
  );
}
