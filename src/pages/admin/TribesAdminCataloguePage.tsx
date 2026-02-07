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
  AppResponsiveList,
  AppItemCard,
  AppPagination,
} from "@/components/app-ui";
import { cn } from "@/lib/utils";

/**
 * ADMIN CATALOGUE PAGE — CLIENT-FACING VIEW
 * 
 * Read-only catalogue view for clients.
 * Shows songs associated with the client's account.
 * No multi-select, no delete functionality.
 */

const ITEMS_PER_PAGE = 50;

type CatalogueStatus = "all" | "active" | "pending" | "inactive";
type SortOption = "a-z" | "newest" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "a-z": "Alphabetical (A-Z)",
  "newest": "Newest first",
  "oldest": "Oldest first",
};

interface CatalogueSong {
  id: string;
  title: string;
  artist: string;
  iswc: string;
  songwriters: string[];
  status: "active" | "pending" | "inactive";
  addedAt: string;
}

// Mock data - will be replaced with client-specific data
const mockCatalogueSongs: CatalogueSong[] = Array.from({ length: 47 }, (_, i) => ({
  id: String(i + 1),
  title: ["Midnight Dreams", "Electric Soul", "Ocean Breeze", "City Lights", "Mountain High", "Sunset Boulevard", "Starlight", "Thunder Road", "Silver Moon", "Golden Hour"][i % 10],
  artist: ["Luna Wave", "The Frequency", "Coastal Sounds", "Urban Echo", "Summit", "Horizon", "Velvet", "Chrome Hearts", "Neon Lights", "Desert Rose"][i % 10],
  iswc: `T-${String(100 + i).padStart(3, '0')}.${String(400 + i).padStart(3, '0')}.${String(700 + i).padStart(3, '0')}-${i % 10}`,
  songwriters: [
    ["John Smith", "Jane Doe"],
    ["Sarah Williams", "David Chen"],
    ["Emily Rodriguez", "James Wilson"],
    ["Michael Brown"],
    ["Lisa Anderson", "Tom Harris"],
  ][i % 5],
  status: (["active", "active", "active", "pending", "inactive"] as const)[i % 5],
  addedAt: new Date(2026, 0, 28 - (i % 30)).toISOString(),
}));

const getStatusText = (status: CatalogueSong["status"]) => {
  switch (status) {
    case "active":
      return <span className="text-[11px] font-medium text-[hsl(var(--success))]">Active</span>;
    case "pending":
      return <span className="text-[11px] font-medium text-[hsl(var(--warning))]">Pending</span>;
    case "inactive":
      return <span className="text-[11px] font-medium text-muted-foreground">Inactive</span>;
    default:
      return <span className="text-[11px] font-medium text-muted-foreground">{status}</span>;
  }
};

const statusFilters: { value: CatalogueStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
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
  const containerRef = useState<HTMLDivElement | null>(null);

  const options: SortOption[] = ["a-z", "newest", "oldest"];

  return (
    <div className="relative" ref={(el) => containerRef[1](el)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Sort options"
      >
        <ArrowUpDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          {/* Dropdown */}
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

export default function TribesAdminCataloguePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("a-z");
  
  const statusFilter = (searchParams.get("status") as CatalogueStatus) || "all";

  const handleStatusChange = (value: CatalogueStatus) => {
    if (value === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", value);
    }
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  // Filter by status
  let filteredSongs = statusFilter === "all"
    ? mockCatalogueSongs
    : mockCatalogueSongs.filter(song => song.status === statusFilter);

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredSongs = filteredSongs.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.songwriters.some(w => w.toLowerCase().includes(query))
    );
  }

  // Sort songs
  filteredSongs = [...filteredSongs].sort((a, b) => {
    switch (sortBy) {
      case "a-z":
        return a.title.localeCompare(b.title);
      case "newest":
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case "oldest":
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      default:
        return a.title.localeCompare(b.title);
    }
  });

  // Pagination
  const totalItems = filteredSongs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSongs = filteredSongs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 if current page exceeds total pages
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const handleSongClick = (songId: string) => {
    navigate(`/admin/catalogue/${songId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <AppPageContainer maxWidth="xl">
      {/* Header Row: Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="page-title">My Catalogue</h1>
      </div>

      <AppSection spacing="none">
        {/* Search Input - subtle bottom border */}
        <div className="relative mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title or songwriter..."
            className={cn(
              "w-full h-9 px-0",
              "text-base sm:text-[13px]",
              "bg-transparent border-b border-border/60",
              "placeholder:text-muted-foreground/40",
              "focus:outline-none focus:border-foreground/30",
              "transition-colors"
            )}
          />
        </div>

        {/* Filter Chips Row with Sort + Count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleStatusChange(filter.value)}
                className={cn(
                  "text-[12px] transition-colors pb-0.5",
                  statusFilter === filter.value
                    ? "font-semibold text-foreground border-b border-foreground"
                    : "font-normal text-muted-foreground hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <SortDropdown value={sortBy} onChange={setSortBy} />
            <span className="text-[12px] text-muted-foreground">
              {totalItems} {totalItems === 1 ? "song" : "songs"}
            </span>
          </div>
        </div>

        <AppResponsiveList
          items={paginatedSongs}
          keyExtractor={(song) => song.id}
          emptyMessage={searchQuery ? "No songs match your search" : "No songs in your catalogue"}
          className="[&_.md\\:hidden]:space-y-2"
          renderCard={(song) => (
            <AppItemCard
              title={song.title}
              subtitle={song.songwriters.join(" / ")}
              meta={format(new Date(song.addedAt), "MMM d, yyyy")}
              status={getStatusText(song.status)}
              onClick={() => handleSongClick(song.id)}
            />
          )}
          renderTable={() => (
            <AppTable columns={["35%", "30%", "15%", "20%"]}>
              <AppTableHeader>
                <AppTableRow>
                  <AppTableHead>Title</AppTableHead>
                  <AppTableHead>Songwriters</AppTableHead>
                  <AppTableHead align="center">Status</AppTableHead>
                  <AppTableHead>Added</AppTableHead>
                </AppTableRow>
              </AppTableHeader>
              <AppTableBody>
                {paginatedSongs.length === 0 ? (
                  <AppTableEmpty colSpan={4}>
                    <span className="text-muted-foreground text-sm">
                      {searchQuery ? "No songs match your search" : "No songs in your catalogue"}
                    </span>
                  </AppTableEmpty>
                ) : (
                  paginatedSongs.map((song) => (
                    <AppTableRow
                      key={song.id}
                      clickable
                      onClick={() => handleSongClick(song.id)}
                    >
                      <AppTableCell className="font-medium">{song.title}</AppTableCell>
                      <AppTableCell muted>{song.songwriters.join(" / ")}</AppTableCell>
                      <AppTableCell align="center">{getStatusText(song.status)}</AppTableCell>
                      <AppTableCell muted>
                        {format(new Date(song.addedAt), "MMM d, yyyy")}
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
    </AppPageContainer>
  );
}
