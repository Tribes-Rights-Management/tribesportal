import { useState } from "react";
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
  AppResponsiveList,
  AppItemCard,
  AppFilterDrawer,
  AppFilterSection,
  AppFilterOption,
  AppFilterTrigger,
} from "@/components/app-ui";

/**
 * TRIBES ADMIN QUEUE PAGE
 * 
 * Pending song submissions with filter drawer pattern and responsive table/card views.
 */

type QueueStatus = "all" | "pending" | "review" | "approved" | "rejected";
type SortOption = "date" | "title" | "submitter";

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

const statusOptions: { value: QueueStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "date", label: "Date Submitted" },
  { value: "title", label: "Title" },
  { value: "submitter", label: "Submitter" },
];

export default function TribesAdminQueuePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  
  const statusFilter = (searchParams.get("status") as QueueStatus) || "all";
  const sortBy = (searchParams.get("sort") as SortOption) || "date";

  const hasActiveFilters = statusFilter !== "all" || sortBy !== "date";

  const handleStatusChange = (value: QueueStatus) => {
    if (value === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", value);
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (value: SortOption) => {
    if (value === "date") {
      searchParams.delete("sort");
    } else {
      searchParams.set("sort", value);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    searchParams.delete("status");
    searchParams.delete("sort");
    setSearchParams(searchParams);
  };

  // Filter songs
  let filteredSongs = statusFilter === "all"
    ? mockQueueSongs
    : mockQueueSongs.filter(song => song.status === statusFilter);

  // Sort songs
  filteredSongs = [...filteredSongs].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "submitter":
        return a.submitter.localeCompare(b.submitter);
      case "date":
      default:
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    }
  });

  const getCounts = () => ({
    all: mockQueueSongs.length,
    pending: mockQueueSongs.filter(s => s.status === "pending").length,
    review: mockQueueSongs.filter(s => s.status === "review").length,
    approved: mockQueueSongs.filter(s => s.status === "approved").length,
    rejected: mockQueueSongs.filter(s => s.status === "rejected").length,
  });

  const counts = getCounts();

  const handleSongClick = (songId: string) => {
    navigate(`/admin/queue/${songId}`);
  };

  // Status options with counts
  const statusOptionsWithCounts = statusOptions.map(opt => ({
    ...opt,
    label: `${opt.label} (${counts[opt.value]})`,
  }));

  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader
        title="Queue"
        backLink={{ to: "/admin", label: "Dashboard" }}
      />

      <AppSection spacing="md">
        <div className="flex items-center justify-between mb-4">
          <AppFilterTrigger
            onClick={() => setFilterOpen(true)}
            hasActiveFilters={hasActiveFilters}
          />
          <div /> {/* Spacer - no action button on Queue */}
        </div>

        <AppResponsiveList
          items={filteredSongs}
          keyExtractor={(song) => song.id}
          emptyMessage={`No ${statusFilter === "all" ? "" : statusFilter + " "}submissions`}
          renderCard={(song) => (
            <AppItemCard
              title={song.title}
              subtitle={song.artist}
              meta={
                <div className="flex flex-col gap-0.5">
                  <span className="truncate">{song.submitter}</span>
                  <span>{format(new Date(song.submittedAt), "MMM d, yyyy")}</span>
                </div>
              }
              status={getStatusBadge(song.status)}
              onClick={() => handleSongClick(song.id)}
            />
          )}
          renderTable={() => (
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
                      No {statusFilter === "all" ? "" : statusFilter + " "}submissions
                    </span>
                  </AppTableEmpty>
                ) : (
                  filteredSongs.map(song => (
                    <AppTableRow
                      key={song.id}
                      clickable
                      onClick={() => handleSongClick(song.id)}
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
          )}
        />
      </AppSection>

      <AppFilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      >
        <AppFilterSection title="Status">
          {statusOptionsWithCounts.map((opt) => (
            <AppFilterOption
              key={opt.value}
              label={opt.label}
              selected={statusFilter === opt.value}
              onClick={() => handleStatusChange(opt.value)}
            />
          ))}
        </AppFilterSection>

        <AppFilterSection title="Sort By">
          {sortOptions.map((opt) => (
            <AppFilterOption
              key={opt.value}
              label={opt.label}
              selected={sortBy === opt.value}
              onClick={() => handleSortChange(opt.value)}
            />
          ))}
        </AppFilterSection>
      </AppFilterDrawer>
    </AppPageContainer>
  );
}
