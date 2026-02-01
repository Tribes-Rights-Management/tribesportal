import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { format } from "date-fns";

import {
  AppPageHeader,
  AppPageContainer,
  AppSection,
  AppButton,
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
} from "@/components/app-ui";
import { cn } from "@/lib/utils";

/**
 * TRIBES ADMIN CATALOGUE PAGE
 * 
 * Song catalog with search, filter chips, and responsive table/card views.
 */

type CatalogueStatus = "all" | "active" | "pending" | "inactive";

interface CatalogueSong {
  id: string;
  title: string;
  artist: string;
  iswc: string;
  songwriters: string[];
  status: "active" | "pending" | "inactive";
  addedAt: string;
}

// Mock data
const mockCatalogueSongs: CatalogueSong[] = [
  { id: "1", title: "Midnight Dreams", artist: "Luna Wave", iswc: "T-123.456.789-0", songwriters: ["John Smith", "Jane Doe", "Mike Johnson"], status: "active", addedAt: "2026-01-15T10:00:00Z" },
  { id: "2", title: "Electric Soul", artist: "The Frequency", iswc: "T-234.567.890-1", songwriters: ["Sarah Williams", "David Chen"], status: "active", addedAt: "2026-01-14T14:30:00Z" },
  { id: "3", title: "Ocean Breeze", artist: "Coastal Sounds", iswc: "T-345.678.901-2", songwriters: ["Emily Rodriguez", "James Wilson", "Anna Lee", "Robert Taylor"], status: "pending", addedAt: "2026-01-13T09:15:00Z" },
  { id: "4", title: "City Lights", artist: "Urban Echo", iswc: "T-456.789.012-3", songwriters: ["Michael Brown"], status: "active", addedAt: "2026-01-12T16:00:00Z" },
  { id: "5", title: "Mountain High", artist: "Summit", iswc: "T-567.890.123-4", songwriters: ["Lisa Anderson", "Tom Harris", "Rachel Green", "Chris Martin", "Jennifer Lopez"], status: "inactive", addedAt: "2026-01-11T11:00:00Z" },
];

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

export default function TribesAdminCataloguePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  const statusFilter = (searchParams.get("status") as CatalogueStatus) || "all";

  const handleStatusChange = (value: CatalogueStatus) => {
    if (value === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", value);
    }
    setSearchParams(searchParams);
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

  const handleSongClick = (songId: string) => {
    navigate(`/admin/catalogue/${songId}`);
  };

  return (
    <AppPageContainer maxWidth="xl">
      {/* Header Row: Title + Action */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold tracking-tight">Catalogue</h1>
        <AppButton
          intent="secondary"
          size="sm"
          onClick={() => navigate("/admin/songs/submit")}
        >
          <Plus className="h-4 w-4" />
          Add Song
        </AppButton>
      </div>

      <AppSection spacing="none">
        {/* Search Input - subtle bottom border */}
        <div className="relative mb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, writer, or lyric..."
            className={cn(
              "w-full h-9 px-0",
              "text-base sm:text-[13px]", // 16px on mobile to prevent Safari zoom
              "bg-transparent border-b border-border/60",
              "placeholder:text-muted-foreground/40",
              "focus:outline-none focus:border-foreground/30",
              "transition-colors"
            )}
          />
        </div>

        {/* Filter Chips Row - minimal text styling */}
        <div className="flex items-center gap-3 mb-3">
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

        <AppResponsiveList
          items={filteredSongs}
          keyExtractor={(song) => song.id}
          emptyMessage={searchQuery ? "No songs match your search" : "No songs in catalogue"}
          className="[&_.md\\:hidden]:space-y-2"
          renderCard={(song) => (
            <AppItemCard
              title={song.title}
              subtitle={song.artist}
              meta={song.songwriters.join(" / ")}
              status={getStatusText(song.status)}
              onClick={() => handleSongClick(song.id)}
            />
          )}
          renderTable={() => (
            <AppTable columns={["25%", "20%", "20%", "15%", "20%"]}>
              <AppTableHeader>
                <AppTableRow>
                  <AppTableHead>Title</AppTableHead>
                  <AppTableHead>Artist</AppTableHead>
                  <AppTableHead>ISWC</AppTableHead>
                  <AppTableHead align="center">Status</AppTableHead>
                  <AppTableHead>Added</AppTableHead>
                </AppTableRow>
              </AppTableHeader>
              <AppTableBody>
                {filteredSongs.length === 0 ? (
                  <AppTableEmpty colSpan={5}>
                    <span className="text-muted-foreground text-sm">
                      {searchQuery ? "No songs match your search" : "No songs in catalogue"}
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
                      <AppTableCell muted mono>{song.iswc}</AppTableCell>
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
      </AppSection>
    </AppPageContainer>
  );
}
