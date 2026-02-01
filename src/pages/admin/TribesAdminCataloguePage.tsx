import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { format } from "date-fns";

import {
  AppPageHeader,
  AppPageContainer,
  AppSection,
  AppSearchInput,
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

/**
 * TRIBES ADMIN CATALOGUE PAGE
 * 
 * Song catalog with responsive table/card views.
 */

interface CatalogueSong {
  id: string;
  title: string;
  artist: string;
  iswc: string;
  status: "active" | "pending" | "inactive";
  addedAt: string;
}

// Mock data
const mockCatalogueSongs: CatalogueSong[] = [
  { id: "1", title: "Midnight Dreams", artist: "Luna Wave", iswc: "T-123.456.789-0", status: "active", addedAt: "2026-01-15T10:00:00Z" },
  { id: "2", title: "Electric Soul", artist: "The Frequency", iswc: "T-234.567.890-1", status: "active", addedAt: "2026-01-14T14:30:00Z" },
  { id: "3", title: "Ocean Breeze", artist: "Coastal Sounds", iswc: "T-345.678.901-2", status: "pending", addedAt: "2026-01-13T09:15:00Z" },
  { id: "4", title: "City Lights", artist: "Urban Echo", iswc: "T-456.789.012-3", status: "active", addedAt: "2026-01-12T16:00:00Z" },
  { id: "5", title: "Mountain High", artist: "Summit", iswc: "T-567.890.123-4", status: "inactive", addedAt: "2026-01-11T11:00:00Z" },
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

export default function TribesAdminCataloguePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSongs = mockCatalogueSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.iswc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSongClick = (songId: string) => {
    navigate(`/admin/catalogue/${songId}`);
  };

  return (
    <AppPageContainer maxWidth="xl">
      <AppPageHeader
        title="Catalogue"
        backLink={{ to: "/admin", label: "Dashboard" }}
        action={
          <AppButton
            intent="secondary"
            size="sm"
            onClick={() => navigate("/admin/songs/submit")}
          >
            <Plus className="h-4 w-4" />
            Add Song
          </AppButton>
        }
      />

      <AppSection spacing="md">
        <div className="flex items-center gap-4 mb-4">
          <AppSearchInput
            placeholder="Search songs, artists, ISWC..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-sm"
          />
        </div>

        <AppResponsiveList
          items={filteredSongs}
          keyExtractor={(song) => song.id}
          emptyMessage={searchQuery ? "No songs match your search" : "No songs in catalogue"}
          renderCard={(song) => (
            <AppItemCard
              title={song.title}
              subtitle={song.artist}
              meta={
                <div className="flex items-center gap-2">
                  <span className="font-mono">{song.iswc}</span>
                  <span>·</span>
                  <span>{format(new Date(song.addedAt), "MMM d, yyyy")}</span>
                </div>
              }
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
    </AppPageContainer>
  );
}
