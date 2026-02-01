import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music } from "lucide-react";
import { format } from "date-fns";

import {
  AppPageHeader,
  AppPageContainer,
  AppStatCard,
  AppStatCardGrid,
  AppListCard,
  AppListRow,
  AppListAction,
  AppEmptyState,
  AppAlert,
  AppSection,
  AppSectionGrid,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
} from "@/components/app-ui";

/**
 * TRIBES ADMIN DASHBOARD — UNIFIED DESIGN SYSTEM
 * 
 * Song catalog management overview with metrics, alerts, queue, and recent activity.
 */

interface DismissibleAlert {
  id: string;
  message: string;
  variant: "info" | "warning" | "error";
}

interface QueueSong {
  id: string;
  title: string;
  artist: string;
  submittedAt: string;
  status: "pending" | "review" | "approved" | "rejected";
}

interface RecentSong {
  id: string;
  title: string;
  artist: string;
  addedAt: string;
}

// Mock data - replace with actual hooks
const mockAlerts: DismissibleAlert[] = [
  { id: "1", message: "3 contracts expire within 30 days", variant: "warning" },
  { id: "2", message: "5 songs awaiting initial review", variant: "info" },
];

const mockQueueSongs: QueueSong[] = [
  { id: "1", title: "Midnight Dreams", artist: "Luna Wave", submittedAt: "2026-01-28T10:00:00Z", status: "pending" },
  { id: "2", title: "Electric Soul", artist: "The Frequency", submittedAt: "2026-01-27T14:30:00Z", status: "review" },
  { id: "3", title: "Ocean Breeze", artist: "Coastal Sounds", submittedAt: "2026-01-26T09:15:00Z", status: "pending" },
];

const mockRecentSongs: RecentSong[] = [
  { id: "1", title: "City Lights", artist: "Urban Echo", addedAt: "2026-01-30T16:00:00Z" },
  { id: "2", title: "Mountain High", artist: "Summit", addedAt: "2026-01-29T11:00:00Z" },
  { id: "3", title: "Desert Wind", artist: "Nomad", addedAt: "2026-01-28T08:00:00Z" },
];

const getStatusBadge = (status: QueueSong["status"]) => {
  switch (status) {
    case "pending":
      return <AppTableBadge variant="default">Pending</AppTableBadge>;
    case "review":
      return <AppTableBadge variant="warning">In Review</AppTableBadge>;
    case "approved":
      return <AppTableBadge variant="success">Approved</AppTableBadge>;
    case "rejected":
      return <AppTableBadge variant="error">Rejected</AppTableBadge>;
    default:
      return <AppTableBadge variant="default">{status}</AppTableBadge>;
  }
};

export default function TribesAdminDashboard() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<DismissibleAlert[]>(mockAlerts);
  const [loading] = useState(false);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Mock stats
  const stats = {
    totalSongs: 247,
    inQueue: 12,
    needsAttention: 3,
    pendingContracts: 8,
  };

  return (
    <AppPageContainer maxWidth="xl">
      {/* Page Header */}
      <AppPageHeader
        title="Dashboard"
      />

      {/* Dismissible Alerts */}
      {alerts.length > 0 && (
        <AppSection spacing="md">
          <div className="space-y-2">
            {alerts.map(alert => (
              <AppAlert
                key={alert.id}
                variant={alert.variant}
                message={alert.message}
                onDismiss={() => dismissAlert(alert.id)}
              />
            ))}
          </div>
        </AppSection>
      )}

      {/* Stats Cards */}
      <AppSection spacing="md">
        <AppStatCardGrid columns={4}>
          <AppStatCard
            label="Total Songs"
            value={stats.totalSongs}
            loading={loading}
            onClick={() => navigate("/admin/catalogue")}
          />
          <AppStatCard
            label="In Queue"
            value={stats.inQueue}
            subtitle="Awaiting review"
            loading={loading}
            onClick={() => navigate("/admin/queue")}
          />
          <AppStatCard
            label="Needs Attention"
            value={stats.needsAttention}
            loading={loading}
            onClick={() => navigate("/admin/queue?filter=attention")}
          />
          <AppStatCard
            label="Pending Contracts"
            value={stats.pendingContracts}
            loading={loading}
            onClick={() => navigate("/admin/documents?type=pending")}
          />
        </AppStatCardGrid>
      </AppSection>

      {/* Songs in Queue Table */}
      <AppSection spacing="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">Songs in Queue</h2>
          <button
            onClick={() => navigate("/admin/queue")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </button>
        </div>
        <AppTable columns="name-meta-status-date">
          <AppTableHeader>
            <AppTableRow>
              <AppTableHead>Title</AppTableHead>
              <AppTableHead>Artist</AppTableHead>
              <AppTableHead align="center">Status</AppTableHead>
              <AppTableHead>Submitted</AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            {mockQueueSongs.length === 0 ? (
              <AppTableEmpty colSpan={4}>
                <span className="text-muted-foreground text-sm">No songs in queue</span>
              </AppTableEmpty>
            ) : (
              mockQueueSongs.map(song => (
                <AppTableRow
                  key={song.id}
                  clickable
                  onClick={() => navigate(`/admin/queue/${song.id}`)}
                >
                  <AppTableCell className="font-medium">{song.title}</AppTableCell>
                  <AppTableCell muted>{song.artist}</AppTableCell>
                  <AppTableCell align="center">{getStatusBadge(song.status)}</AppTableCell>
                  <AppTableCell muted>
                    {format(new Date(song.submittedAt), "MMM d, yyyy")}
                  </AppTableCell>
                </AppTableRow>
              ))
            )}
          </AppTableBody>
        </AppTable>
      </AppSection>

      {/* Recently Added */}
      <AppSectionGrid columns={2}>
        <AppListCard
          title="Recently Added"
          className="h-full"
          action={
            <AppListAction onClick={() => navigate("/admin/catalogue")}>
              View all
            </AppListAction>
          }
        >
          {mockRecentSongs.length === 0 ? (
            <AppEmptyState
              customIcon={<Music className="h-5 w-5" />}
              message="No songs added yet"
              size="sm"
            />
          ) : (
            mockRecentSongs.map(song => (
              <AppListRow
                key={song.id}
                title={song.title}
                subtitle={song.artist}
                onClick={() => navigate(`/admin/catalogue/${song.id}`)}
              />
            ))
          )}
        </AppListCard>

        <AppListCard
          title="Quick Actions"
          className="h-full"
        >
          <AppListRow
            title="Submit New Song"
            subtitle="Add a song to the catalog"
            onClick={() => navigate("/admin/songs/submit")}
          />
          <AppListRow
            title="Review Queue"
            subtitle="Process pending submissions"
            onClick={() => navigate("/admin/queue")}
          />
          <AppListRow
            title="Manage Documents"
            subtitle="Contracts and agreements"
            onClick={() => navigate("/admin/documents")}
          />
        </AppListCard>
      </AppSectionGrid>
    </AppPageContainer>
  );
}
