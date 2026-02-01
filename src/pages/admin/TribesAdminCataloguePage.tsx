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
  AppFilterDrawer,
  AppFilterSection,
  AppFilterOption,
  AppFilterTrigger,
} from "@/components/app-ui";

/**
 * TRIBES ADMIN CATALOGUE PAGE
 * 
 * Song catalog with filter drawer pattern and responsive table/card views.
 */

type CatalogueStatus = "all" | "active" | "pending" | "inactive";
type SortOption = "title" | "date" | "artist";

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

const getStatusBadge = (status: CatalogueSong["status"]) => {
  switch (status) {
    case "active":
      return <AppTableBadge variant="success">Active</AppTableBadge>;
    case "pending":
      return <AppTableBadge variant="warning">Pending</AppTableBadge>;
    case "inactive":
      return <AppTableBadge variant="default">Inactive</AppTableBadge>;
    default:
      return <AppTableBadge variant="default">{status}</AppTableBadge>;
  }
};

const statusOptions: { value: CatalogueStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "date", label: "Date Added" },
  { value: "artist", label: "Artist" },
];

export default function TribesAdminCataloguePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  
  const statusFilter = (searchParams.get("status") as CatalogueStatus) || "all";
  const sortBy = (searchParams.get("sort") as SortOption) || "title";

  const hasActiveFilters = statusFilter !== "all" || sortBy !== "title";

  const handleStatusChange = (value: CatalogueStatus) => {
    if (value === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", value);
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (value: SortOption) => {
    if (value === "title") {
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
    ? mockCatalogueSongs
    : mockCatalogueSongs.filter(song => song.status === statusFilter);

  // Sort songs
  filteredSongs = [...filteredSongs].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case "artist":
        return a.artist.localeCompare(b.artist);
      case "title":
      default:
        return a.title.localeCompare(b.title);
    }
  });

  const handleSongClick = (songId: string) => {
    navigate(`/admin/catalogue/${songId}`);
  };

  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader
        title="Catalogue"
        backLink={{ to: "/admin", label: "Dashboard" }}
      />

      <AppSection spacing="md">
        <div className="flex items-center justify-between mb-4">
          <AppFilterTrigger
            onClick={() => setFilterOpen(true)}
            hasActiveFilters={hasActiveFilters}
          />
          <AppButton
            intent="secondary"
            size="sm"
            onClick={() => navigate("/admin/songs/submit")}
          >
            <Plus className="h-4 w-4" />
            Add Song
          </AppButton>
        </div>

        <AppResponsiveList
          items={filteredSongs}
          keyExtractor={(song) => song.id}
          emptyMessage="No songs in catalogue"
          renderCard={(song) => (
            <AppItemCard
              title={song.title}
              subtitle={song.artist}
              meta={song.songwriters.join(" / ")}
              status={getStatusBadge(song.status)}
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
                      No songs in catalogue
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
                      <AppTableCell align="center">{getStatusBadge(song.status)}</AppTableCell>
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

      <AppFilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      >
        <AppFilterSection title="Status">
          {statusOptions.map((opt) => (
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
