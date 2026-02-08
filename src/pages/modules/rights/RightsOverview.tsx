import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  AppPageLayout,
  AppStatCard,
  AppStatCardGrid,
  AppSection,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
} from "@/components/app-ui";
import { QueueStatusBadge } from "@/components/queue/QueueStatusBadge";
import { useQueueStats, useStaffQueue } from "@/hooks/use-song-queue";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * RIGHTS OVERVIEW PAGE — Live dashboard with queue preview and stats.
 */
export default function RightsOverview() {
  const navigate = useNavigate();
  const { data: queueStats, isLoading: statsLoading } = useQueueStats();
  const { data: recentQueue = [] } = useStaffQueue();

  const { data: clientCount } = useQuery({
    queryKey: ["rights-stats", "clients"],
    queryFn: async () => {
      const { count } = await supabase.from("client_accounts").select("*", { count: "exact", head: true }).eq("status", "active");
      return count || 0;
    },
  });

  const { data: contractCount } = useQuery({
    queryKey: ["rights-stats", "contracts"],
    queryFn: async () => {
      const { count } = await supabase.from("contracts").select("*", { count: "exact", head: true }).eq("status", "active");
      return count || 0;
    },
  });

  const { data: songCount } = useQuery({
    queryKey: ["rights-stats", "songs"],
    queryFn: async () => {
      const { count } = await supabase.from("songs").select("*", { count: "exact", head: true }).eq("is_active", true);
      return count || 0;
    },
  });

  const topQueue = recentQueue.slice(0, 5);
  const getSongTitle = (item: any) => item.current_data?.title || item.submitted_data?.title || "Untitled";

  return (
    <AppPageLayout title="Overview">
      <AppStatCardGrid columns={4} className="mb-6">
        <AppStatCard label="Active Clients" value={clientCount ?? "—"} onClick={() => navigate("/rights/clients")} />
        <AppStatCard label="Active Contracts" value={contractCount ?? "—"} onClick={() => navigate("/rights/contracts")} />
        <AppStatCard label="Songs in Queue" value={queueStats?.total ?? "—"} loading={statsLoading} onClick={() => navigate("/rights/queue")} />
        <AppStatCard label="Catalog" value={songCount ?? "—"} onClick={() => navigate("/rights/catalog")} />
      </AppStatCardGrid>

      {/* Queue preview table */}
      <AppSection spacing="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">Songs in Queue</h2>
          <button onClick={() => navigate("/rights/queue")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all →
          </button>
        </div>
        <AppTable>
          <AppTableHeader>
            <AppTableRow>
              <AppTableHead>Title</AppTableHead>
              <AppTableHead>Client</AppTableHead>
              <AppTableHead align="center">Status</AppTableHead>
              <AppTableHead>Submitted</AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            {topQueue.length === 0 ? (
              <AppTableEmpty colSpan={4}>
                <span className="text-muted-foreground text-sm">No songs in queue</span>
              </AppTableEmpty>
            ) : (
              topQueue.map(item => (
                <AppTableRow key={item.id} clickable onClick={() => navigate(`/rights/queue/${item.id}`)}>
                  <AppTableCell className="font-medium">{getSongTitle(item)}</AppTableCell>
                  <AppTableCell muted>{item.client_name}</AppTableCell>
                  <AppTableCell align="center"><QueueStatusBadge status={item.status} /></AppTableCell>
                  <AppTableCell muted>{format(new Date(item.submitted_at), "MMM d, yyyy")}</AppTableCell>
                </AppTableRow>
              ))
            )}
          </AppTableBody>
        </AppTable>
      </AppSection>
    </AppPageLayout>
  );
}
