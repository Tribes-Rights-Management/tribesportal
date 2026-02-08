import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Music } from "lucide-react";
import {
  AppPageLayout,
  AppStatCard,
  AppStatCardGrid,
  AppSection,
  AppSectionGrid,
  AppListCard,
  AppListRow,
  AppListAction,
  AppEmptyState,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
} from "@/components/app-ui";
import { QueueStatusBadge } from "@/components/queue/QueueStatusBadge";
import { useClientQueue } from "@/hooks/use-song-queue";

/**
 * TRIBES ADMIN DASHBOARD — Client-facing portal with real queue data.
 */
export default function TribesAdminDashboard() {
  const navigate = useNavigate();
  const { data: queueItems = [], isLoading } = useClientQueue();

  const activeQueue = queueItems.filter(i => i.status !== "approved" && i.status !== "rejected");
  const topQueue = activeQueue.slice(0, 5);

  const getSongTitle = (item: any) => item.current_data?.title || item.submitted_data?.title || "Untitled";
  const getWriters = (item: any) => {
    const writers = item.current_data?.writers || item.submitted_data?.writers || [];
    return writers.map((w: any) => w.name).join(", ") || "—";
  };

  return (
    <AppPageLayout title="Dashboard">
      <AppSection spacing="md">
        <AppStatCardGrid columns={4}>
          <AppStatCard label="My Submissions" value={queueItems.length} loading={isLoading} />
          <AppStatCard label="Pending" value={activeQueue.length} loading={isLoading} />
          <AppStatCard label="Approved" value={queueItems.filter(i => i.status === "approved").length} loading={isLoading} />
          <AppStatCard label="Needs Update" value={queueItems.filter(i => i.status === "needs_revision").length} loading={isLoading} />
        </AppStatCardGrid>
      </AppSection>

      <AppSection spacing="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">Songs in Queue</h2>
        </div>
        <AppTable>
          <AppTableHeader>
            <AppTableRow>
              <AppTableHead>Title</AppTableHead>
              <AppTableHead>Songwriters</AppTableHead>
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
                <AppTableRow key={item.id} clickable onClick={() => navigate(`/admin/queue/${item.id}`)}>
                  <AppTableCell className="font-medium">{getSongTitle(item)}</AppTableCell>
                  <AppTableCell muted>{getWriters(item)}</AppTableCell>
                  <AppTableCell align="center"><QueueStatusBadge status={item.status} clientFacing /></AppTableCell>
                  <AppTableCell muted>{format(new Date(item.submitted_at), "MMM d, yyyy")}</AppTableCell>
                </AppTableRow>
              ))
            )}
          </AppTableBody>
        </AppTable>
      </AppSection>

      <AppSectionGrid columns={2}>
        <AppListCard title="Quick Actions" className="h-full">
          <AppListRow title="Submit New Song" subtitle="Add a song to the catalog" onClick={() => navigate("/rights/songs/submit")} />
          <AppListRow title="View Catalog" subtitle="Browse your registered songs" onClick={() => navigate("/admin/catalog")} />
          <AppListRow title="Manage Documents" subtitle="Contracts and agreements" onClick={() => navigate("/admin/documents")} />
        </AppListCard>
      </AppSectionGrid>
    </AppPageLayout>
  );
}
