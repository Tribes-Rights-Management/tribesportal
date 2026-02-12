import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AppPageLayout,
  AppListToolbar,
  AppButton,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
  AppEmptyState,
} from "@/components/app-ui";
import {
  AppModal,
  AppModalBody,
  AppModalFooter,
  AppModalAction,
  AppModalCancel,
  AppModalField,
  AppModalFields,
} from "@/components/ui/app-modal";
import { Input } from "@/components/ui/input";

const statusVariant: Record<string, "default" | "warning"> = {
  active: "default",
  suspended: "warning",
};

export default function RightsClientsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_accounts")
        .select("id, name, primary_email, status, created_at")
        .neq("status", "archived")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  // Song counts per client (non-blocking)
  const { data: songCounts } = useQuery({
    queryKey: ["clients-song-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_interested_parties")
        .select("interested_party_id, interested_parties!inner(client_account_id)")
        .not("interested_parties.client_account_id", "is", null);
      if (error) return {};
      const counts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        const cid = row.interested_parties?.client_account_id;
        if (cid) counts[cid] = (counts[cid] || 0) + 1;
      });
      return counts;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("client_accounts")
        .insert({
          name: formName.trim(),
          primary_email: formEmail.trim() || null,
          phone: formPhone.trim() || null,
          notes: formNotes.trim() || null,
          status: "active" as any,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      toast({ description: "Client created" });
      setShowCreateDialog(false);
      resetForm();
      navigate(`/rights/clients/${data.id}`);
    },
    onError: () => {
      toast({ description: "Failed to create client", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormNotes("");
  };

  const filtered = searchQuery
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.primary_email || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clients;

  const count = filtered.length;

  return (
    <AppPageLayout title="Clients">
      <AppListToolbar
        placeholder="Search clients..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        count={`${count} ${count === 1 ? "client" : "clients"}`}
        action={
          <AppButton intent="primary" size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Client
          </AppButton>
        }
      />

      {isLoading ? (
        <AppEmptyState message="Loading clients..." size="lg" />
      ) : filtered.length === 0 ? (
        <AppTable columns={["40%", "25%", "20%", "15%"]}>
          <AppTableHeader>
            <AppTableRow header>
              <AppTableHead>Name</AppTableHead>
              <AppTableHead>Email</AppTableHead>
              <AppTableHead>Status</AppTableHead>
              <AppTableHead align="right">Songs</AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            <AppTableEmpty colSpan={4}>
              <AppEmptyState
                message={searchQuery ? "No clients match your search" : "No clients yet"}
                description={searchQuery ? "Try a different search term." : "Add your first client to get started."}
              />
            </AppTableEmpty>
          </AppTableBody>
        </AppTable>
      ) : (
        <AppTable columns={["40%", "25%", "20%", "15%"]}>
          <AppTableHeader>
            <AppTableRow header>
              <AppTableHead>Name</AppTableHead>
              <AppTableHead>Email</AppTableHead>
              <AppTableHead>Status</AppTableHead>
              <AppTableHead align="right">Songs</AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            {filtered.map((client) => (
              <AppTableRow
                key={client.id}
                clickable
                onClick={() => navigate(`/rights/clients/${client.id}`)}
              >
                <AppTableCell>{client.name}</AppTableCell>
                <AppTableCell muted>{client.primary_email || "—"}</AppTableCell>
                <AppTableCell>
                  <AppTableBadge variant={statusVariant[client.status] || "default"}>
                    {client.status}
                  </AppTableBadge>
                </AppTableCell>
                <AppTableCell align="right" muted>
                  {songCounts?.[client.id] ?? "—"}
                </AppTableCell>
              </AppTableRow>
            ))}
          </AppTableBody>
        </AppTable>
      )}

      <AppModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Add Client"
        preventClose={createMutation.isPending}
        maxWidth="sm"
      >
        <AppModalBody>
          <AppModalFields>
            <AppModalField label="Name" htmlFor="client-name">
              <Input
                id="client-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Client name"
                className="h-12 md:h-11 text-[16px] md:text-[14px] bg-muted/50 border rounded-[10px]"
              />
            </AppModalField>

            <AppModalField label="Primary email" htmlFor="client-email">
              <Input
                id="client-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
                className="h-12 md:h-11 text-[16px] md:text-[14px] bg-muted/50 border rounded-[10px]"
              />
            </AppModalField>

            <AppModalField label="Phone" htmlFor="client-phone">
              <Input
                id="client-phone"
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="h-12 md:h-11 text-[16px] md:text-[14px] bg-muted/50 border rounded-[10px]"
              />
            </AppModalField>

            <AppModalField label="Notes" htmlFor="client-notes">
              <textarea
                id="client-notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Optional notes"
                rows={3}
                className="w-full px-3 py-2.5 text-[16px] md:text-[14px] bg-muted/50 border rounded-[10px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </AppModalField>
          </AppModalFields>
        </AppModalBody>

        <AppModalFooter>
          <AppModalAction
            onClick={() => createMutation.mutate()}
            disabled={!formName.trim()}
            loading={createMutation.isPending}
            loadingText="Creating…"
          >
            Add Client
          </AppModalAction>
          <AppModalCancel
            onClick={() => { setShowCreateDialog(false); resetForm(); }}
            disabled={createMutation.isPending}
          >
            Cancel
          </AppModalCancel>
        </AppModalFooter>
      </AppModal>
    </AppPageLayout>
  );
}
