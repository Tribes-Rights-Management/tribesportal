import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardBody,
  AppDetailRow,
  AppDetailRowGroup,
  AppStatCard,
  AppStatCardGrid,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
} from "@/components/app-ui";

interface ClientOverviewTabProps {
  client: any;
}

function formatAddress(c: any): string {
  const parts = [
    c.address_line1,
    c.address_line2,
    [c.city, c.state_province].filter(Boolean).join(", "),
    c.postal_code,
    c.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join("\n") : "—";
}

export default function ClientOverviewTab({ client }: ClientOverviewTabProps) {
  const navigate = useNavigate();

  // Song count
  const { data: songCount = 0, isLoading: songLoading } = useQuery({
    queryKey: ["client-songs-count", client.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("song_interested_parties")
        .select("id, interested_parties!inner(client_account_id)", { count: "exact", head: true })
        .eq("interested_parties.client_account_id", client.id);
      if (error) return 0;
      return count || 0;
    },
  });

  // IPI count
  const { data: ipiCount = 0, isLoading: ipiLoading } = useQuery({
    queryKey: ["client-ipi-count", client.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("client_ipi_numbers")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", client.id);
      if (error) return 0;
      return count || 0;
    },
  });

  // Deals count via interested_parties → song_writers → deals
  const { data: dealCount = 0, isLoading: dealLoading } = useQuery({
    queryKey: ["client-deals-count", client.id],
    queryFn: async () => {
      // Count deals through writers linked to this client
      const { data, error } = await supabase
        .from("contract_associations")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", client.id);
      if (error) return 0;
      return data?.length || 0;
    },
  });

  // Pending queue items
  const { data: pendingCount = 0, isLoading: pendingLoading } = useQuery({
    queryKey: ["client-pending-count", client.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("song_queue")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", client.id)
        .in("status", ["submitted", "in_review"]);
      if (error) return 0;
      return count || 0;
    },
  });

  // Recent submissions
  const { data: recentSubmissions = [] } = useQuery({
    queryKey: ["client-recent-submissions", client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_queue")
        .select("id, title, status, created_at")
        .eq("client_account_id", client.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) return [];
      return data || [];
    },
  });

  const statusVariant: Record<string, "default" | "success" | "warning"> = {
    submitted: "default",
    in_review: "warning",
    approved: "success",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Details */}
      <AppCard>
        <AppCardHeader>
          <AppCardTitle>Client Information</AppCardTitle>
        </AppCardHeader>
        <AppCardBody className="p-0">
          <AppDetailRowGroup>
            <AppDetailRow label="Email" value={client.primary_email || "—"} />
            <AppDetailRow label="Address" value={formatAddress(client)} />
            <AppDetailRow
              label="Created"
              value={format(new Date(client.created_at), "MMM d, yyyy")}
            />
          </AppDetailRowGroup>
        </AppCardBody>
      </AppCard>

      {/* Right: Activity */}
      <div className="space-y-6">
        <AppStatCardGrid columns={2}>
          <AppStatCard label="Songs" value={songCount} size="sm" loading={songLoading} />
          <AppStatCard label="Pending" value={pendingCount} size="sm" loading={pendingLoading} />
          <AppStatCard label="Contracts" value={dealCount} size="sm" loading={dealLoading} />
          <AppStatCard label="IPI Numbers" value={ipiCount} size="sm" loading={ipiLoading} />
        </AppStatCardGrid>

        <AppCard>
          <AppCardHeader>
            <AppCardTitle>Recent Submissions</AppCardTitle>
          </AppCardHeader>
          <AppCardBody className="p-0">
            <AppTable>
              <AppTableHeader>
                <AppTableRow header>
                  <AppTableHead>Title</AppTableHead>
                  <AppTableHead>Status</AppTableHead>
                  <AppTableHead align="right">Submitted</AppTableHead>
                </AppTableRow>
              </AppTableHeader>
              <AppTableBody>
                {recentSubmissions.length === 0 ? (
                  <AppTableEmpty colSpan={3}>
                    <span className="text-sm text-muted-foreground">No submissions yet</span>
                  </AppTableEmpty>
                ) : (
                  recentSubmissions.map((sub: any) => (
                    <AppTableRow
                      key={sub.id}
                      clickable
                      onClick={() => navigate(`/rights/queue/${sub.id}`)}
                    >
                      <AppTableCell>{sub.title}</AppTableCell>
                      <AppTableCell>
                        <AppTableBadge variant={statusVariant[sub.status] || "default"}>
                          {sub.status?.replace("_", " ")}
                        </AppTableBadge>
                      </AppTableCell>
                      <AppTableCell align="right" muted>
                        {format(new Date(sub.created_at), "MMM d, yyyy")}
                      </AppTableCell>
                    </AppTableRow>
                  ))
                )}
              </AppTableBody>
            </AppTable>
          </AppCardBody>
        </AppCard>
      </div>
    </div>
  );
}
