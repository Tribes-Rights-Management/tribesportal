import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AppSettingsCard,
  AppDetailRow,
  AppButton,
} from "@/components/app-ui";
import {
  AppModal,
  AppModalBody,
  AppModalFooter,
} from "@/components/ui/app-modal";

interface ClientSettingsTabProps {
  client: any;
}

export default function ClientSettingsTab({ client }: ClientSettingsTabProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.primary_email || "");
  const [line1, setLine1] = useState(client.address_line1 || "");
  const [line2, setLine2] = useState(client.address_line2 || "");
  const [city, setCity] = useState(client.city || "");
  const [state, setState] = useState(client.state_province || "");
  const [postal, setPostal] = useState(client.postal_code || "");
  const [country, setCountry] = useState(client.country || "");
  

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("client_accounts")
        .update({
          name: name.trim(),
          primary_email: email.trim() || null,
          address_line1: line1.trim() || null,
          address_line2: line2.trim() || null,
          city: city.trim() || null,
          state_province: state.trim() || null,
          postal_code: postal.trim() || null,
          country: country.trim() || null,
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
            <AppDetailRow
              label="Address"
              value={
                [client.address_line1, client.city, client.state_province, client.country]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
            
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
      <AppModal
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction === "archived" ? "Archive Client" : confirmAction === "suspended" ? "Suspend Client" : "Reactivate Client"}
        description={
          confirmAction === "archived"
            ? "This will archive the client account. It can be restored later."
            : confirmAction === "suspended"
            ? "This will suspend the client's access to the portal."
            : "This will restore the client's access."
        }
        maxWidth="sm"
      >
        <AppModalFooter>
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
        </AppModalFooter>
      </AppModal>
    </div>
  );
}
