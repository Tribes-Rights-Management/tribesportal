import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Copy, X, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppPageLayout } from "@/components/app-ui";
import { ContentPanel, EmptyState, LoadingState } from "@/components/ui/page-shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

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
 * MEMBER DIRECTORY PAGE — INSTITUTIONAL DESIGN
 * 
 * Bloomberg Terminal aesthetic:
 * - Clean table with generous row padding
 * - Centered modal for member details (not side panel)
 * - Typography-driven hierarchy
 * - Sparse, authoritative visual language
 * - Thin icons (strokeWidth=1.5) for refined look
 */

export default function UserDirectoryPage() {
  const { profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const formatPlatformRole = (role: PlatformRole): string => {
    switch (role) {
      case "platform_admin": return "Administrator";
      case "platform_user": return "User";
      case "external_auditor": return "Auditor";
      default: return role;
    }
  };

  const formatStatus = (status: MembershipStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusStyle = (status: MembershipStatus) => {
    switch (status) {
      case "active":
        return { bg: "rgba(34, 197, 94, 0.12)", text: "#4ade80" };
      case "pending":
        return { bg: "rgba(234, 179, 8, 0.12)", text: "#facc15" };
      case "suspended":
        return { bg: "rgba(249, 115, 22, 0.12)", text: "#fb923c" };
      case "revoked":
      case "denied":
        return { bg: "rgba(239, 68, 68, 0.12)", text: "#f87171" };
      default:
        return { bg: "rgba(255,255,255,0.06)", text: "var(--platform-text-secondary)" };
    }
  };

  const handleRowClick = (user: UserWithProfile) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const isCurrentUser = (user: UserWithProfile) => user.user_id === currentProfile?.user_id;

  return (
    <AppPageLayout
      title="Member Directory"
      backLink={{ to: "/console", label: "System Console" }}
    >

      <ContentPanel>
        {loading ? (
          <LoadingState />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users."
            description="Records will appear when users are provisioned."
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Organizations</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const activeOrgCount = user.memberships.filter(m => m.status === "active").length;
                    const statusStyle = getStatusStyle(user.status);
                    
                    return (
                      <TableRow
                        key={user.id}
                        clickable
                        onClick={() => handleRowClick(user)}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-[15px] font-medium truncate"
                              style={{ color: 'var(--platform-text)' }}
                            >
                              {user.email}
                            </span>
                            {isCurrentUser(user) && (
                              <span 
                                className="text-[12px] uppercase tracking-wider font-medium"
                                style={{ color: 'var(--platform-text-muted)' }}
                              >
                                (YOU)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span 
                            className="inline-flex items-center px-3 py-1.5 rounded text-[12px] font-medium"
                            style={{ 
                              backgroundColor: 'var(--platform-surface-2)',
                              color: 'var(--platform-text)',
                            }}
                          >
                            {formatPlatformRole(user.platform_role)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span 
                            className="inline-flex items-center px-3 py-1.5 rounded text-[12px] font-medium"
                            style={{ 
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                            }}
                          >
                            {formatStatus(user.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[14px]" style={{ color: 'var(--platform-text-muted)' }}>
                            {activeOrgCount > 0 ? `${activeOrgCount} org${activeOrgCount > 1 ? 's' : ''}` : '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ChevronRight 
                            className="h-4 w-4 opacity-40 group-hover:opacity-70 transition-opacity" 
                             strokeWidth={1.5}
                            style={{ color: 'var(--platform-text-muted)' }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--platform-border)' }}>
              {users.map((user) => {
                const activeOrgCount = user.memberships.filter(m => m.status === "active").length;
                const statusStyle = getStatusStyle(user.status);
                
                return (
                  <button
                    key={user.id}
                    onClick={() => handleRowClick(user)}
                    className="w-full text-left px-4 py-5 transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Email row */}
                    <div className="flex items-center gap-2 mb-3">
                      <span 
                        className="text-[15px] font-medium truncate flex-1 min-w-0"
                        style={{ color: 'var(--platform-text)' }}
                      >
                        {user.email}
                      </span>
                      <ChevronRight 
                        className="h-5 w-5 shrink-0" 
                         strokeWidth={1.5}
                        style={{ color: 'var(--platform-text-muted)' }} 
                      />
                    </div>
                    
                    {/* Chips row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: 'var(--platform-text-secondary)',
                        }}
                      >
                        {formatPlatformRole(user.platform_role)}
                      </span>
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ 
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {formatStatus(user.status)}
                      </span>
                      {activeOrgCount > 0 && (
                        <span 
                          className="text-[11px]"
                          style={{ color: 'var(--platform-text-muted)' }}
                        >
                          {activeOrgCount} org(s)
                        </span>
                      )}
                      {isCurrentUser(user) && (
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
              })}
            </div>
          </>
        )}
      </ContentPanel>

      {/* Member Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent 
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0"
          hideDefaultClose
        >
          {selectedUser && (
            <>
              {/* Clean header: email + copy + close */}
              <DialogHeader className="px-6 pt-6 pb-5 border-b" style={{ borderColor: 'var(--platform-border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <DialogTitle 
                      className="text-[16px] font-medium"
                      style={{ color: 'var(--platform-text)' }}
                    >
                      {selectedUser.email}
                    </DialogTitle>
                    <button
                      onClick={() => handleCopyEmail(selectedUser.email)}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--platform-text-muted)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--platform-text-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--platform-text-muted)'}
                      title="Copy email"
                    >
                      <Copy className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded transition-colors row-hover"
                    style={{ color: 'var(--platform-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--platform-text)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--platform-text-secondary)'}
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </DialogHeader>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-6">
                
                {/* Identity Section - no redundant email */}
                <section className="pb-5 border-b" style={{ borderColor: 'var(--platform-border)' }}>
                  <h3 
                    className="text-[11px] uppercase tracking-wider font-medium mb-4"
                    style={{ color: 'var(--platform-text-muted)' }}
                  >
                    Identity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px]" style={{ color: 'var(--platform-text-muted)' }}>
                        Account Created
                      </span>
                      <span className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>
                        {formatDate(selectedUser.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px]" style={{ color: 'var(--platform-text-muted)' }}>
                        Account Status
                      </span>
                      <span 
                        className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium"
                        style={{ 
                          backgroundColor: getStatusStyle(selectedUser.status).bg,
                          color: getStatusStyle(selectedUser.status).text,
                        }}
                      >
                        {formatStatus(selectedUser.status)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Platform Authority Section */}
                <section className="pb-5 border-b" style={{ borderColor: 'var(--platform-border)' }}>
                  <h3 
                    className="text-[11px] uppercase tracking-wider font-medium mb-4"
                    style={{ color: 'var(--platform-text-muted)' }}
                  >
                    Platform Authority
                  </h3>
                  
                  {isCurrentUser(selectedUser) && (
                    <div 
                      className="flex items-start gap-2.5 px-3 py-2.5 rounded mb-4"
                      style={{ 
                        backgroundColor: 'var(--warning-bg)',
                        borderLeft: '2px solid var(--warning-border)'
                      }}
                    >
                      <AlertCircle 
                        className="h-3.5 w-3.5 shrink-0 mt-0.5" 
                        strokeWidth={1.5}
                        style={{ color: 'var(--warning-text)' }}
                      />
                      <span className="text-[12px]" style={{ color: 'var(--warning-text)' }}>
                        You cannot modify your own access
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[13px]" style={{ color: 'var(--platform-text-muted)' }}>
                      Platform Role
                    </span>
                    <span 
                      className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-medium"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        color: 'var(--platform-text)',
                      }}
                    >
                      {formatPlatformRole(selectedUser.platform_role)}
                    </span>
                  </div>
                </section>

                {/* Organization Memberships Section */}
                <section>
                  <h3 
                    className="text-[11px] uppercase tracking-wider font-medium mb-4"
                    style={{ color: 'var(--platform-text-muted)' }}
                  >
                    Organization Memberships
                  </h3>
                  
                  {selectedUser.memberships.length === 0 ? (
                    <p 
                      className="text-[13px] py-4"
                      style={{ color: 'var(--platform-text-muted)' }}
                    >
                      No organization memberships
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUser.memberships.map((m) => (
                        <div 
                          key={m.id}
                          className="flex items-center justify-between px-3 py-3 rounded-lg"
                          style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                        >
                          <span 
                            className="text-[14px] font-medium"
                            style={{ color: 'var(--platform-text)' }}
                          >
                            {m.tenant_name}
                          </span>
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                            style={{ 
                              backgroundColor: getStatusStyle(m.status).bg,
                              color: getStatusStyle(m.status).text,
                            }}
                          >
                            {formatStatus(m.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppPageLayout>
  );
}
