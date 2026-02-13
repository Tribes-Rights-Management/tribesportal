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

  const { data: recentSongs = [] } = useQuery({
    queryKey: ["rights-recent-songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select(`
          id, title, song_number, created_at, updated_at,
          song_writers (
            id,
            writers ( name )
          ),
          song_ownership (
            ownership_percentage,
            tribes_administered
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data || []).map((song: any) => ({
        ...song,
        songwriters: (song.song_writers || [])
          .map((sw: any) => sw.writers?.name)
          .filter(Boolean),
        control: (song.song_ownership || [])
          .filter((o: any) => o.tribes_administered)
          .reduce((sum: number, o: any) => sum + (o.ownership_percentage || 0), 0),
      }));
    },
  });

  return (
    <AppPageLayout title="Overview">
      <AppStatCardGrid columns={3} className="mb-6">
        <AppStatCard label="Active Clients" value={clientCount ?? "—"} onClick={() => navigate("/rights/clients")} />
        
        <AppStatCard label="Songs in Queue" value={queueStats?.total ?? "—"} loading={statsLoading} onClick={() => navigate("/rights/queue")} />
        <AppStatCard label="Catalog" value={songCount ?? "—"} onClick={() => navigate("/rights/catalog")} />
      </AppStatCardGrid>

      {/* Recently added songs */}
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
              <AppTableHead>ID</AppTableHead>
              <AppTableHead>Title</AppTableHead>
              <AppTableHead>Songwriters</AppTableHead>
              <AppTableHead align="right">Control</AppTableHead>
              <AppTableHead>Last updated</AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            {recentSongs.length === 0 ? (
              <AppTableEmpty colSpan={5}>
                <span className="text-muted-foreground text-sm">No songs in catalog</span>
              </AppTableEmpty>
            ) : (
              recentSongs.map((song: any) => (
                <AppTableRow key={song.id} clickable onClick={() => navigate(`/rights/catalog/${song.song_number}`)}>
                  <AppTableCell muted>{song.song_number}</AppTableCell>
                  <AppTableCell className="font-medium">{song.title}</AppTableCell>
                  <AppTableCell muted>{song.songwriters.join(" / ") || "—"}</AppTableCell>
                  <AppTableCell align="right" muted>{song.control > 0 ? `${song.control}%` : "—"}</AppTableCell>
                  <AppTableCell muted>{format(new Date(song.updated_at), "MMM d, yyyy")}</AppTableCell>
                </AppTableRow>
              ))
            )}
          </AppTableBody>
        </AppTable>
      </AppSection>
    </AppPageLayout>
  );
}
