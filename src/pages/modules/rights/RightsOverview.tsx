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
import { useQueueStats } from "@/hooks/use-song-queue";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * RIGHTS OVERVIEW PAGE — Live dashboard with queue preview and stats.
 */
export default function RightsOverview() {
  const navigate = useNavigate();
  const { data: queueStats, isLoading: statsLoading } = useQueueStats();

  const { data: recentSongs = [] } = useQuery({
    queryKey: ["rights-recent-songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("id, title, song_number, slug, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: clientCount } = useQuery({
    queryKey: ["rights-stats", "clients"],
    queryFn: async () => {
      const { count } = await supabase.from("client_accounts").select("*", { count: "exact", head: true }).eq("status", "active");
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

  return (
    <AppPageLayout title="Overview">
      <AppStatCardGrid columns={3} className="mb-6">
        <AppStatCard label="Active Clients" value={clientCount ?? "—"} onClick={() => navigate("/rights/clients")} />
        <AppStatCard label="Songs in Queue" value={queueStats?.total ?? "—"} loading={statsLoading} onClick={() => navigate("/rights/queue")} />
        <AppStatCard label="Catalog" value={songCount ?? "—"} onClick={() => navigate("/rights/catalog")} />
      </AppStatCardGrid>

      <AppSection spacing="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">Recently added</h2>
          <button onClick={() => navigate("/rights/catalog")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all →
          </button>
        </div>
        <AppTable>
          <AppTableHeader>
            <AppTableRow>
              <AppTableHead>Title</AppTableHead>
              <AppTableHead>Song number</AppTableHead>
              <AppTableHead>Added</AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            {recentSongs.length === 0 ? (
              <AppTableEmpty colSpan={3}>
                <span className="text-muted-foreground text-sm">No songs in catalog</span>
              </AppTableEmpty>
            ) : (
              recentSongs.map((song: any) => (
                <AppTableRow key={song.id} clickable onClick={() => navigate(`/rights/catalog/${song.song_number}/${song.slug}`)}>
                  <AppTableCell className="font-medium">{song.title}</AppTableCell>
                  <AppTableCell muted>{song.song_number ?? "—"}</AppTableCell>
                  <AppTableCell muted>{format(new Date(song.created_at), "MMM d, yyyy")}</AppTableCell>
                </AppTableRow>
              ))
            )}
          </AppTableBody>
        </AppTable>
      </AppSection>
    </AppPageLayout>
  );
}
