import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";

import {
  AppPageHeader,
  AppPageContainer,
  AppSection,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
} from "@/components/app-ui";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * TRIBES ADMIN QUEUE PAGE
 * 
 * Pending song submissions with status filtering.
 */

type QueueStatus = "all" | "pending" | "review" | "approved" | "rejected";

interface QueueSong {
  id: string;
  title: string;
  artist: string;
  submitter: string;
  submittedAt: string;
  status: "pending" | "review" | "approved" | "rejected";
}

// Mock data
const mockQueueSongs: QueueSong[] = [
  { id: "1", title: "Midnight Dreams", artist: "Luna Wave", submitter: "john@example.com", submittedAt: "2026-01-28T10:00:00Z", status: "pending" },
  { id: "2", title: "Electric Soul", artist: "The Frequency", submitter: "jane@example.com", submittedAt: "2026-01-27T14:30:00Z", status: "review" },
  { id: "3", title: "Ocean Breeze", artist: "Coastal Sounds", submitter: "mike@example.com", submittedAt: "2026-01-26T09:15:00Z", status: "pending" },
  { id: "4", title: "City Lights", artist: "Urban Echo", submitter: "sarah@example.com", submittedAt: "2026-01-25T16:00:00Z", status: "approved" },
  { id: "5", title: "Mountain High", artist: "Summit", submitter: "david@example.com", submittedAt: "2026-01-24T11:00:00Z", status: "rejected" },
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

export default function TribesAdminQueuePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter = (searchParams.get("filter") as QueueStatus) || "all";

  const handleFilterChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("filter");
    } else {
      searchParams.set("filter", value);
    }
    setSearchParams(searchParams);
  };

  const filteredSongs = currentFilter === "all"
    ? mockQueueSongs
    : mockQueueSongs.filter(song => song.status === currentFilter);

  const getCounts = () => ({
    all: mockQueueSongs.length,
    pending: mockQueueSongs.filter(s => s.status === "pending").length,
    review: mockQueueSongs.filter(s => s.status === "review").length,
    approved: mockQueueSongs.filter(s => s.status === "approved").length,
    rejected: mockQueueSongs.filter(s => s.status === "rejected").length,
  });

  const counts = getCounts();

  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader
        eyebrow="Tribes Admin"
        title="Queue"
        description="Review and process song submissions"
        backLink={{ to: "/tribes-admin", label: "Dashboard" }}
      />

      <AppSection spacing="md">
        <Tabs value={currentFilter} onValueChange={handleFilterChange} className="mb-4">
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="review">In Review ({counts.review})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
          </TabsList>
        </Tabs>

        <AppTable columns={["20%", "20%", "25%", "15%", "20%"]}>
          <AppTableHeader>
            <AppTableRow>
              <AppTableHead>Title</AppTableHead>
              <AppTableHead>Artist</AppTableHead>
              <AppTableHead>Submitter</AppTableHead>
              <AppTableHead align="center">Status</AppTableHead>
              <AppTableHead>Submitted</AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            {filteredSongs.length === 0 ? (
              <AppTableEmpty colSpan={5}>
                <span className="text-muted-foreground text-sm">
                  No {currentFilter === "all" ? "" : currentFilter + " "}submissions
                </span>
              </AppTableEmpty>
            ) : (
              filteredSongs.map(song => (
                <AppTableRow
                  key={song.id}
                  clickable
                  onClick={() => navigate(`/tribes-admin/queue/${song.id}`)}
                >
                  <AppTableCell className="font-medium">{song.title}</AppTableCell>
                  <AppTableCell muted>{song.artist}</AppTableCell>
                  <AppTableCell muted>{song.submitter}</AppTableCell>
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
    </AppPageContainer>
  );
}
