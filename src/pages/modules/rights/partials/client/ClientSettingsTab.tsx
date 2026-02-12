import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  AppSettingsCard,
  AppDetailRow,
  AppButton,
  AppChip,
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

interface ClientSettingsTabProps {
  client: any;
}

export default function ClientSettingsTab({ client }: ClientSettingsTabProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  // Form state
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.primary_email || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [line1, setLine1] = useState(client.address_line1 || "");
  const [line2, setLine2] = useState(client.address_line2 || "");
  const [city, setCity] = useState(client.city || "");
  const [state, setState] = useState(client.state_province || "");
  const [postal, setPostal] = useState(client.postal_code || "");
  const [country, setCountry] = useState(client.country || "");
  const [notes, setNotes] = useState(client.notes || "");

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("client_accounts")
        .update({
          name: name.trim(),
          primary_email: email.trim() || null,
          phone: phone.trim() || null,
          address_line1: line1.trim() || null,
          address_line2: line2.trim() || null,
          city: city.trim() || null,
          state_province: state.trim() || null,
          postal_code: postal.trim() || null,
          country: country.trim() || null,
          notes: notes.trim() || null,
        })
        .eq("id", client.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-detail", client.id] });
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      toast({ description: "Client updated" });
      setEditing(false);
    },
    onError: () => {
      toast({ description: "Failed to update", variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const update: any = { status: newStatus };
      if (newStatus === "archived") update.archived_at = new Date().toISOString();
      const { error } = await supabase
        .from("client_accounts")
        .update(update)
        .eq("id", client.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-detail", client.id] });
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      toast({ description: "Status updated" });
      setConfirmAction(null);
    },
    onError: () => {
      toast({ description: "Failed to update status", variant: "destructive" });
    },
  });

  // --- Portal Access queries ---
  const { data: invitation, refetch: refetchInvite } = useQuery({
    queryKey: ["client-invitation", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_invitations")
        .select("id, email, token, expires_at, accepted_at, created_at")
        .eq("client_account_id", client.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: existingUser } = useQuery({
    queryKey: ["client-user-lookup", client.primary_email],
    queryFn: async () => {
      if (!client.primary_email) return null;
      const { data } = await supabase
        .from("user_profiles")
        .select("id, email, full_name, status")
        .eq("email", client.primary_email.toLowerCase())
        .maybeSingle();
      return data;
    },
    enabled: !!client.primary_email,
  });

  const handleInvite = async () => {
    if (!client.primary_email || !user) return;
    setInviting(true);
    try {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const token = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from("client_invitations").insert({
        client_account_id: client.id,
        email: client.primary_email.toLowerCase().trim(),
        invited_by: user.id,
        token,
        role: "client",
        expires_at: expiresAt.toISOString(),
      });
      if (error) throw error;

      const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`;
      console.log("Client invite URL:", inviteUrl);

      toast({ description: `Invitation sent to ${client.primary_email}` });
      refetchInvite();
    } catch (err: any) {
      console.error("Failed to create invitation:", err);
      toast({ description: "Failed to send invitation", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!invitation?.token) return;
    const url = `${window.location.origin}/invite/accept?token=${invitation.token}`;
    navigator.clipboard.writeText(url);
    toast({ description: "Invite link copied to clipboard" });
  };

  const handleResend = async () => {
    if (!invitation?.id) return;
    setInviting(true);
    try {
      await supabase.from("client_invitations").delete().eq("id", invitation.id);
      await handleInvite();
    } finally {
      setInviting(false);
    }
  };

  // --- Determine portal access state ---
  const invitationExpired = invitation?.expires_at && !invitation.accepted_at && new Date(invitation.expires_at) < new Date();
  const invitationPending = invitation && !invitation.accepted_at && !invitationExpired;
  const hasPortalAccess = existingUser && invitation?.accepted_at;

  const inputClass =
    "w-full h-10 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-foreground transition-colors";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Client Details */}
      <AppSettingsCard title="Client Details">
        {editing ? (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Primary Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Address Line 1</label>
                <input type="text" value={line1} onChange={(e) => setLine1(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Address Line 2</label>
                <input type="text" value={line2} onChange={(e) => setLine2(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">State/Province</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Postal Code</label>
                <input type="text" value={postal} onChange={(e) => setPostal(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-foreground transition-colors resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <AppButton intent="secondary" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </AppButton>
              <AppButton
                intent="primary"
                size="sm"
                onClick={() => updateMutation.mutate()}
                loading={updateMutation.isPending}
                disabled={!name.trim()}
              >
                Save Changes
              </AppButton>
            </div>
          </div>
        ) : (
          <>
            <AppDetailRow label="Name" value={client.name} variant="editable" ctaLabel="Edit" onCta={() => setEditing(true)} />
            <AppDetailRow label="Email" value={client.primary_email || "—"} />
            <AppDetailRow label="Phone" value={client.phone || "—"} />
            <AppDetailRow
              label="Address"
              value={
                [client.address_line1, client.city, client.state_province, client.country]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
            <AppDetailRow label="Notes" value={client.notes || "—"} />
          </>
        )}
      </AppSettingsCard>

      {/* Portal Access */}
      <AppSettingsCard title="Portal Access">
        {hasPortalAccess ? (
          <>
            <AppDetailRow label="Status" value={<AppChip status="pass" label="Active" />} />
            <AppDetailRow label="User" value={existingUser.full_name || existingUser.email} />
            <AppDetailRow label="Accepted" value={new Date(invitation.accepted_at!).toLocaleDateString()} />
          </>
        ) : invitationPending ? (
          <>
            <AppDetailRow label="Status" value={<AppChip status="pending" label="Pending" />} />
            <AppDetailRow label="Sent to" value={invitation.email} />
            <AppDetailRow label="Expires" value={new Date(invitation.expires_at!).toLocaleDateString()} />
            <div className="px-4 py-3 flex items-center gap-2">
              <AppButton intent="secondary" size="sm" onClick={handleCopyInviteLink}>
                Copy Invite Link
              </AppButton>
              <AppButton intent="secondary" size="sm" onClick={handleResend} loading={inviting}>
                Resend
              </AppButton>
            </div>
          </>
        ) : (
          <>
            {client.primary_email ? (
              <div className="px-4 py-3 space-y-2">
                <AppButton intent="primary" size="sm" onClick={handleInvite} loading={inviting}>
                  Grant Portal Access
                </AppButton>
                <p className="text-xs text-muted-foreground">
                  Sends an invitation to {client.primary_email}
                </p>
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Add an email address to this client before granting portal access.
                </p>
              </div>
            )}
          </>
        )}
      </AppSettingsCard>

      {/* Account Status */}
      <AppSettingsCard title="Account Status">
        <AppDetailRow label="Current Status" value={client.status} />
        <div className="px-4 py-3 flex items-center gap-2">
          {client.status === "active" && (
            <AppButton intent="secondary" size="sm" onClick={() => setConfirmAction("suspended")}>
              Suspend Client
            </AppButton>
          )}
          {client.status === "suspended" && (
            <AppButton intent="primary" size="sm" onClick={() => setConfirmAction("active")}>
              Reactivate Client
            </AppButton>
          )}
          {client.status !== "archived" && (
            <AppButton intent="danger" size="sm" onClick={() => setConfirmAction("archived")}>
              Archive Client
            </AppButton>
          )}
        </div>
      </AppSettingsCard>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "archived" ? "Archive Client" : confirmAction === "suspended" ? "Suspend Client" : "Reactivate Client"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "archived"
                ? "This will archive the client account. It can be restored later."
                : confirmAction === "suspended"
                ? "This will suspend the client's access to the portal."
                : "This will restore the client's access."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <AppButton intent="secondary" onClick={() => setConfirmAction(null)}>
              Cancel
            </AppButton>
            <AppButton
              intent={confirmAction === "archived" || confirmAction === "suspended" ? "danger" : "primary"}
              onClick={() => confirmAction && statusMutation.mutate(confirmAction)}
              loading={statusMutation.isPending}
            >
              Confirm
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
