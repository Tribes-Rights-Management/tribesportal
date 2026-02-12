import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  AppListToolbar,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
  AppEmptyState,
  AppButton,
  AppSelect,
} from "@/components/app-ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PortalUser {
  user_id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  clients: string[];
  created_at: string;
  type: "active" | "pending";
}

function getInitials(name: string, email: string): string {
  if (name && name !== "—") {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function getRoleBadgeVariant(role: string): "default" | "success" | "warning" | "info" {
  switch (role) {
    case "owner": return "info";
    case "team": return "default";
    case "viewer": return "default";
    default: return "default";
  }
}

function getStatusBadgeVariant(status: string): "success" | "warning" | "default" {
  switch (status) {
    case "active": return "success";
    case "pending": return "warning";
    case "removed": return "default";
    default: return "default";
  }
}

export default function RightsUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteClientId, setInviteClientId] = useState("");
  const [inviteRole, setInviteRole] = useState("team");
  const [canSubmitSongs, setCanSubmitSongs] = useState(false);
  const [canViewContracts, setCanViewContracts] = useState(false);
  const [canManageTeam, setCanManageTeam] = useState(false);
  const [canDownloadExports, setCanDownloadExports] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Fetch active members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["rights-users"],
    queryFn: async () => {
      const { data: memberships, error } = await supabase
        .from("client_account_members")
        .select(`
          id, user_id, role, created_at, removed_at,
          client_accounts!inner(id, name)
        `)
        .is("removed_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((memberships || []).map(m => m.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, email, full_name, status")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const userMap = new Map<string, PortalUser>();
      for (const m of (memberships || [])) {
        if (!userMap.has(m.user_id)) {
          const profile = profileMap.get(m.user_id);
          userMap.set(m.user_id, {
            user_id: m.user_id,
            name: profile?.full_name || "—",
            email: profile?.email || "—",
            status: profile?.status || "active",
            role: m.role,
            clients: [],
            created_at: m.created_at,
            type: "active",
          });
        }
        const clientData = m.client_accounts as any;
        userMap.get(m.user_id)!.clients.push(clientData?.name || "Unknown");
      }

      return Array.from(userMap.values());
    },
  });

  // Fetch pending invitations
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ["rights-users-pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_invitations")
        .select(`
          id, email, role, created_at, expires_at, accepted_at,
          client_accounts(id, name)
        `)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return (data || [])
        .filter(inv => inv.expires_at && new Date(inv.expires_at) > new Date())
        .map(inv => ({
          user_id: `pending-${inv.id}`,
          name: "Invitation pending",
          email: inv.email,
          status: "pending",
          role: inv.role || "team",
          clients: [(inv.client_accounts as any)?.name || "Unknown"],
          created_at: inv.created_at || "",
          type: "pending" as const,
        }));
    },
  });

  // Fetch client accounts for invite modal
  const { data: clientAccounts = [] } = useQuery({
    queryKey: ["client-accounts-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_accounts")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  // Combine and filter
  const allUsers = useMemo(() => {
    const combined = [...members, ...pendingInvites];
    let filtered = combined;

    if (statusFilter !== "all") {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.clients.some(c => c.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [members, pendingInvites, search, statusFilter]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteClientId || !user) return;
    setInviting(true);
    try {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const token = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from("client_invitations").insert({
        client_account_id: inviteClientId,
        email: inviteEmail.toLowerCase().trim(),
        invited_by: user.id,
        token,
        role: inviteRole,
        expires_at: expiresAt.toISOString(),
      });
      if (error) throw error;

      const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`;
      console.log("Client invite URL:", inviteUrl);

      toast({ description: `Invitation sent to ${inviteEmail}` });
      queryClient.invalidateQueries({ queryKey: ["rights-users-pending"] });
      setInviteOpen(false);
      resetInviteForm();
    } catch (err: any) {
      console.error("Failed to create invitation:", err);
      toast({ description: "Failed to send invitation", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteClientId("");
    setInviteRole("team");
    setCanSubmitSongs(false);
    setCanViewContracts(false);
    setCanManageTeam(false);
    setCanDownloadExports(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const inputClass =
    "w-full h-10 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-foreground transition-colors";

  return (
    <>
      <AppListToolbar
        placeholder="Search by name, email, or client..."
        searchValue={search}
        onSearchChange={setSearch}
        count={allUsers.length > 0 ? `${allUsers.length} user${allUsers.length !== 1 ? "s" : ""}` : undefined}
        action={
          <AppButton intent="primary" size="sm" onClick={() => setInviteOpen(true)}>
            Invite User
          </AppButton>
        }
      />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : allUsers.length === 0 ? (
        <AppEmptyState
          icon="users"
          message="No users yet"
          description="Invite users to grant them portal access to client accounts."
          action={
            <AppButton intent="primary" size="sm" onClick={() => setInviteOpen(true)}>
              Invite User
            </AppButton>
          }
        />
      ) : (
        <AppTable columns={["35%", "25%", "15%", "15%", "10%"]}>
          <AppTableHeader>
            <AppTableRow header>
              <AppTableHead>Name</AppTableHead>
              <AppTableHead>Clients</AppTableHead>
              <AppTableHead>Role</AppTableHead>
              <AppTableHead>Status</AppTableHead>
              <AppTableHead>Added</AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            {allUsers.map((u) => (
              <AppTableRow key={u.user_id}>
                <AppTableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[12px] font-medium text-muted-foreground shrink-0">
                      {getInitials(u.name, u.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-foreground truncate">
                        {u.name}
                      </p>
                      <p className="text-[13px] text-muted-foreground truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                </AppTableCell>
                <AppTableCell>
                  <span className="text-sm text-foreground">
                    {u.clients.join(", ")}
                  </span>
                </AppTableCell>
                <AppTableCell>
                  <AppTableBadge variant={getRoleBadgeVariant(u.role)}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                  </AppTableBadge>
                </AppTableCell>
                <AppTableCell>
                  <AppTableBadge variant={getStatusBadgeVariant(u.status)}>
                    {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </AppTableBadge>
                </AppTableCell>
                <AppTableCell muted>
                  {formatDate(u.created_at)}
                </AppTableCell>
              </AppTableRow>
            ))}
          </AppTableBody>
        </AppTable>
      )}

      {/* Invite User Modal */}
      <Dialog open={inviteOpen} onOpenChange={(open) => { if (!open) { setInviteOpen(false); resetInviteForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send a portal invitation to grant access to a client account.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Client</label>
                <AppSelect
                  value={inviteClientId}
                  onChange={setInviteClientId}
                  placeholder="Select a client"
                  options={clientAccounts.map(c => ({ value: c.id, label: c.name }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                <AppSelect
                  value={inviteRole}
                  onChange={setInviteRole}
                  options={[
                    { value: "owner", label: "Owner" },
                    { value: "team", label: "Team" },
                    { value: "viewer", label: "Viewer" },
                  ]}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground block">Permissions</label>
                <div className="flex items-center gap-2">
                  <Checkbox id="perm-songs" checked={canSubmitSongs} onCheckedChange={(v) => setCanSubmitSongs(!!v)} />
                  <Label htmlFor="perm-songs" className="text-sm">Can submit songs</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="perm-contracts" checked={canViewContracts} onCheckedChange={(v) => setCanViewContracts(!!v)} />
                  <Label htmlFor="perm-contracts" className="text-sm">Can view contracts</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="perm-team" checked={canManageTeam} onCheckedChange={(v) => setCanManageTeam(!!v)} />
                  <Label htmlFor="perm-team" className="text-sm">Can manage team</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="perm-exports" checked={canDownloadExports} onCheckedChange={(v) => setCanDownloadExports(!!v)} />
                  <Label htmlFor="perm-exports" className="text-sm">Can download exports</Label>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <AppButton intent="secondary" onClick={() => { setInviteOpen(false); resetInviteForm(); }}>
              Cancel
            </AppButton>
            <AppButton
              intent="primary"
              onClick={handleInvite}
              loading={inviting}
              disabled={!inviteEmail.trim() || !inviteClientId}
            >
              Send Invitation
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
