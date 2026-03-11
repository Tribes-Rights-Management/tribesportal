import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Music } from "lucide-react";
import {
  PlatformPageLayout,
  PlatformStatCard,
  PlatformStatCardGrid,
  PlatformSection,
  PlatformSectionGrid,
  PlatformListCard,
  PlatformListRow,
  PlatformListAction,
  PlatformEmptyState,
  PlatformTable,
  PlatformTableHeader,
  PlatformTableBody,
  PlatformTableRow,
  PlatformTableHead,
  PlatformTableCell,
  PlatformTableEmpty,
} from "@/components/platform-ui";
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
    <PlatformPageLayout title="Dashboard">
      <PlatformSection spacing="md">
        <PlatformStatCardGrid columns={4}>
          <PlatformStatCard label="My Submissions" value={queueItems.length} loading={isLoading} />
          <PlatformStatCard label="Pending" value={activeQueue.length} loading={isLoading} />
          <PlatformStatCard label="Approved" value={queueItems.filter(i => i.status === "approved").length} loading={isLoading} />
          <PlatformStatCard label="Needs Update" value={queueItems.filter(i => i.status === "needs_revision").length} loading={isLoading} />
        </PlatformStatCardGrid>
      </PlatformSection>

      <PlatformSection spacing="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">Songs in Queue</h2>
        </div>
        <PlatformTable>
          <PlatformTableHeader>
            <PlatformTableRow>
              <PlatformTableHead>Title</PlatformTableHead>
              <PlatformTableHead>Songwriters</PlatformTableHead>
              <PlatformTableHead align="center">Status</PlatformTableHead>
              <PlatformTableHead>Submitted</PlatformTableHead>
            </PlatformTableRow>
          </PlatformTableHeader>
          <PlatformTableBody>
            {topQueue.length === 0 ? (
              <PlatformTableEmpty colSpan={4}>
                <span className="text-muted-foreground text-sm">No songs in queue</span>
              </PlatformTableEmpty>
            ) : (
              topQueue.map(item => (
                <PlatformTableRow key={item.id} clickable onClick={() => navigate(`/admin/queue/${item.submission_number || item.id}`)}>
                  <PlatformTableCell className="font-medium">{getSongTitle(item)}</PlatformTableCell>
                  <PlatformTableCell muted>{getWriters(item)}</PlatformTableCell>
                  <PlatformTableCell align="center"><QueueStatusBadge status={item.status} clientFacing /></PlatformTableCell>
                  <PlatformTableCell muted>{format(new Date(item.submitted_at), "MMM d, yyyy")}</PlatformTableCell>
                </PlatformTableRow>
              ))
            )}
          </PlatformTableBody>
        </PlatformTable>
      </PlatformSection>

      <PlatformSectionGrid columns={2}>
        <PlatformListCard title="Quick Actions" className="h-full">
          <PlatformListRow title="Submit New Song" subtitle="Add a song to the catalog" onClick={() => navigate("/rights/songs/submit")} />
          <PlatformListRow title="View Catalog" subtitle="Browse your registered songs" onClick={() => navigate("/admin/catalog")} />
          <PlatformListRow title="Manage Documents" subtitle="Contracts and agreements" onClick={() => navigate("/admin/documents")} />
        </PlatformListCard>
      </PlatformSectionGrid>
    </PlatformPageLayout>
  );
}