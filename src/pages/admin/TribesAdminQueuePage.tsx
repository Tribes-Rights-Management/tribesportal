import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpDown, Check } from "lucide-react";
import { format } from "date-fns";

import {
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
  AppPagination,
} from "@/components/app-ui";
import { cn } from "@/lib/utils";

/**
 * TRIBES ADMIN QUEUE PAGE
 * 
 * Pending song submissions with filter drawer pattern, pagination, and responsive table/card views.
 */

const ITEMS_PER_PAGE = 50;

type QueueStatus = "all" | "pending" | "review" | "approved" | "rejected";
type SortOption = "a-z" | "newest" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "a-z": "Alphabetical (A-Z)",
  "newest": "Newest first",
  "oldest": "Oldest first",
};

interface QueueSong {
  id: string;
  title: string;
  artist: string;
  submitter: string;
  submittedAt: string;
  status: "pending" | "review" | "approved" | "rejected";
}

// Mock data - expanded for pagination demo
const mockQueueSongs: QueueSong[] = Array.from({ length: 127 }, (_, i) => ({
  id: String(i + 1),
  title: ["Midnight Dreams", "Electric Soul", "Ocean Breeze", "City Lights", "Mountain High", "Sunset Boulevard", "Starlight", "Thunder Road", "Silver Moon", "Golden Hour"][i % 10],
  artist: ["Luna Wave", "The Frequency", "Coastal Sounds", "Urban Echo", "Summit", "Horizon", "Velvet", "Chrome Hearts", "Neon Lights", "Desert Rose"][i % 10],
  submitter: ["john@example.com", "jane@example.com", "mike@example.com", "sarah@example.com", "david@example.com"][i % 5],
  submittedAt: new Date(2026, 0, 28 - (i % 30)).toISOString(),
  status: (["pending", "review", "pending", "approved", "rejected"] as const)[i % 5],
}));

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

// Sort Dropdown Component
function SortDropdown({ 
  value, 
  onChange 
}: { 
  value: SortOption; 
  onChange: (value: SortOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const options: SortOption[] = ["a-z", "newest", "oldest"];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Sort options"
      >
        <ArrowUpDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-1 z-50 bg-background border border-border rounded-lg shadow-lg overflow-hidden min-w-[160px]">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-[13px] flex items-center justify-between gap-2",
                  "hover:bg-muted/50 transition-colors",
                  value === option ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span>{sortLabels[option]}</span>
                {value === option && (
                  <Check className="h-3.5 w-3.5 text-foreground" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TribesAdminQueuePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("a-z");
  
  const statusFilter = (searchParams.get("status") as QueueStatus) || "all";

  const hasActiveFilters = statusFilter !== "all";

  const handleStatusChange = (value: QueueStatus) => {
    if (value === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", value);
    }
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    searchParams.delete("status");
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  // Filter songs
  let filteredSongs = statusFilter === "all"
    ? mockQueueSongs
    : mockQueueSongs.filter(song => song.status === statusFilter);

  // Sort songs
  filteredSongs = [...filteredSongs].sort((a, b) => {
    switch (sortBy) {
      case "a-z":
        return a.title.localeCompare(b.title);
      case "newest":
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      case "oldest":
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      default:
        return a.title.localeCompare(b.title);
    }
  });

  // Pagination
  const totalItems = filteredSongs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSongs = filteredSongs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

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

  const statusOptionsWithCounts = statusOptions.map(opt => ({
    ...opt,
    label: `${opt.label} (${counts[opt.value]})`,
  }));

  return (
    <AppPageContainer maxWidth="xl">
      {/* Header Row: Title + Filter */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="page-title">Queue</h1>
        <AppFilterTrigger
          onClick={() => setFilterOpen(true)}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <AppSection spacing="none">
        {/* Sort + Count Row */}
        <div className="flex items-center justify-end mb-3">
          <div className="flex items-center gap-2">
            <SortDropdown value={sortBy} onChange={setSortBy} />
            <span className="text-[12px] text-muted-foreground">
              {totalItems} {totalItems === 1 ? "submission" : "submissions"}
            </span>
          </div>
        </div>

        <AppResponsiveList
          items={paginatedSongs}
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
                {paginatedSongs.length === 0 ? (
                  <AppTableEmpty colSpan={5}>
                    <span className="text-muted-foreground text-sm">
                      No {statusFilter === "all" ? "" : statusFilter + " "}submissions
                    </span>
                  </AppTableEmpty>
                ) : (
                  paginatedSongs.map(song => (
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

        <AppPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
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
      </AppFilterDrawer>
    </AppPageContainer>
  );
}
