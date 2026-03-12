import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  PlatformPageLayout,
  PlatformListToolbar,
  PlatformButton,
  PlatformTable,
  PlatformTableHeader,
  PlatformTableBody,
  PlatformTableRow,
  PlatformTableHead,
  PlatformTableCell,
  PlatformTableEmpty,
  PlatformTableBadge,
  PlatformEmptyState,
} from "@/components/platform-ui";
import {
  PlatformModal,
  PlatformModalBody,
  PlatformModalFooter,
  PlatformModalAction,
  PlatformModalCancel,
  PlatformModalField,
  PlatformModalFields,
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
    <PlatformPageLayout title="Clients">
      <PlatformListToolbar
        placeholder="Search clients..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        count={`${count} ${count === 1 ? "client" : "clients"}`}
        action={
          <PlatformButton intent="primary" size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Client
          </PlatformButton>
        }
      />

      {isLoading ? (
        <PlatformEmptyState message="Loading clients..." size="lg" />
      ) : filtered.length === 0 ? (
        <PlatformTable columns={["40%", "25%", "20%", "15%"]}>
          <PlatformTableHeader>
            <PlatformTableRow header>
              <PlatformTableHead>Name</PlatformTableHead>
              <PlatformTableHead>Email</PlatformTableHead>
              <PlatformTableHead>Status</PlatformTableHead>
              <PlatformTableHead align="right">Songs</PlatformTableHead>
            </PlatformTableRow>
          </PlatformTableHeader>
          <PlatformTableBody>
            <PlatformTableEmpty colSpan={4}>
              <PlatformEmptyState
                message={searchQuery ? "No clients match your search" : "No clients yet"}
                description={searchQuery ? "Try a different search term." : "Add your first client to get started."}
              />
            </PlatformTableEmpty>
          </PlatformTableBody>
        </PlatformTable>
      ) : (
        <PlatformTable columns={["40%", "25%", "20%", "15%"]}>
          <PlatformTableHeader>
            <PlatformTableRow header>
              <PlatformTableHead>Name</PlatformTableHead>
              <PlatformTableHead>Email</PlatformTableHead>
              <PlatformTableHead>Status</PlatformTableHead>
              <PlatformTableHead align="right">Songs</PlatformTableHead>
            </PlatformTableRow>
          </PlatformTableHeader>
          <PlatformTableBody>
            {filtered.map((client) => (
              <PlatformTableRow
                key={client.id}
                clickable
                onClick={() => navigate(`/rights/clients/${client.id}`)}
              >
                <PlatformTableCell>{client.name}</PlatformTableCell>
                <PlatformTableCell muted>{client.primary_email || "—"}</PlatformTableCell>
                <PlatformTableCell>
                  <PlatformTableBadge variant={statusVariant[client.status] || "default"}>
                    {client.status}
                  </PlatformTableBadge>
                </PlatformTableCell>
                <PlatformTableCell align="right" muted>
                  {songCounts?.[client.id] ?? "—"}
                </PlatformTableCell>
              </PlatformTableRow>
            ))}
          </PlatformTableBody>
        </PlatformTable>
      )}

      <PlatformModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Add Client"
        preventClose={createMutation.isPending}
        maxWidth="sm"
      >
        <PlatformModalBody>
          <PlatformModalFields>
            <PlatformModalField label="Name" htmlFor="client-name">
              <Input
                id="client-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Client name"
                className="h-12 md:h-11 text-[16px] md:text-[14px] bg-muted/50 border rounded-[10px]"
              />
            </PlatformModalField>

            <PlatformModalField label="Primary email" htmlFor="client-email">
              <Input
                id="client-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
                className="h-12 md:h-11 text-[16px] md:text-[14px] bg-muted/50 border rounded-[10px]"
              />
            </PlatformModalField>

          </PlatformModalFields>
        </PlatformModalBody>

        <PlatformModalFooter>
          <PlatformModalAction
            onClick={() => createMutation.mutate()}
            disabled={!formName.trim()}
            loading={createMutation.isPending}
            loadingText="Creating…"
          >
            Add Client
          </PlatformModalAction>
          <PlatformModalCancel
            onClick={() => { setShowCreateDialog(false); resetForm(); }}
            disabled={createMutation.isPending}
          >
            Cancel
          </PlatformModalCancel>
        </PlatformModalFooter>
      </PlatformModal>
    </PlatformPageLayout>
  );
}
