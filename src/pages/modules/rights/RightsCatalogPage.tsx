import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, ArrowUpDown, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import {
  AppPageLayout,
  AppSection,
  AppButton,
  AppListToolbar,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

/**
 * RIGHTS CATALOG PAGE — STAFF MANAGEMENT VIEW
 * 
 * Master catalog for Tribes staff with full CRUD operations.
 * Includes multi-select, bulk delete, and all management features.
 */

const ITEMS_PER_PAGE = 50;

type CatalogStatus = "all" | "active" | "pending" | "inactive";
type SortOption = "a-z" | "newest" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "a-z": "Alphabetical (A-Z)",
  "newest": "Newest first",
  "oldest": "Oldest first",
};

interface CatalogSong {
  id: string;
  song_number: number | null;
  title: string;
  songwriters: string[];
  control: number;
  updatedAt: string;
  status: "active" | "pending" | "inactive";
  addedAt: string;
}

const getStatusText = (status: CatalogSong["status"]) => {
  switch (status) {
    case "active":
      return <span className="text-[12px] font-medium text-[#6B7280]">Active</span>;
    case "pending":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
    case "inactive":
      return <span className="text-[12px] font-medium text-[#9CA3AF]">Inactive</span>;
    default:
      return <span className="text-[12px] font-medium text-[#9CA3AF]">{status}</span>;
  }
};

const statusFilters: { value: CatalogStatus; label: string }[] = [
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

export default function RightsCatalogPage() {
  const navigate = useNavigate();
  const { isPlatformAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("a-z");
  
  // Data state
  const [songs, setSongs] = useState<CatalogSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Selection state
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  
  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const statusFilter = (searchParams.get("status") as CatalogStatus) || "all";

  // Fetch songs from database
  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("songs")
        .select(`
          id,
          song_number,
          title,
          metadata,
          created_at,
          updated_at,
          is_active,
          song_writers (
            id,
            share,
            writers (
              id,
              name
            )
          ),
          song_ownership (
            ownership_percentage,
            tribes_administered
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match CatalogSong interface
      const transformedSongs: CatalogSong[] = (data || []).map((song: any) => {
        const songwriters = (song.song_writers || [])
          .map((sw: any) => sw.writers?.name)
          .filter(Boolean);
        
        const control = (song.song_ownership || [])
          .filter((o: any) => o.tribes_administered)
          .reduce((sum: number, o: any) => sum + (o.ownership_percentage || 0), 0);
        
        return {
          id: song.id,
          song_number: song.song_number,
          title: song.title,
          songwriters,
          control,
          updatedAt: song.updated_at || song.created_at,
          status: "active" as const,
          addedAt: song.created_at,
        };
      });
      
      setSongs(transformedSongs);
    } catch (err: any) {
      console.error("Failed to fetch songs:", err);
      toast.error("Failed to load catalog");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleStatusChange = (value: CatalogStatus) => {
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
    ? songs
    : songs.filter(song => song.status === statusFilter);

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredSongs = filteredSongs.filter(song =>
      song.title.toLowerCase().includes(query) ||
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

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  // Clear selection when filters change
  useEffect(() => {
    setSelectedSongs(new Set());
    setLastSelectedIndex(null);
  }, [statusFilter, searchQuery, currentPage, sortBy]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedSongs(new Set(paginatedSongs.map(s => s.id)));
      }
      if (e.key === 'Escape') {
        setSelectedSongs(new Set());
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSongs.size > 0 && isPlatformAdmin) {
        setShowDeleteDialog(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginatedSongs, selectedSongs, isPlatformAdmin]);

  const handleRowSelect = (songId: string, index: number, event: React.MouseEvent) => {
    const newSelection = new Set(selectedSongs);
    
    if (event.metaKey || event.ctrlKey) {
      if (newSelection.has(songId)) {
        newSelection.delete(songId);
      } else {
        newSelection.add(songId);
      }
    } else if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      for (let i = start; i <= end; i++) {
        newSelection.add(paginatedSongs[i].id);
      }
    } else {
      newSelection.clear();
      newSelection.add(songId);
    }
    
    setSelectedSongs(newSelection);
    setLastSelectedIndex(index);
  };

  const toSlug = (title: string) =>
    title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled';

  const handleSongClick = (songNumber: number, title?: string) => {
    navigate(`/rights/catalog/${songNumber}/${toSlug(title || '')}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteSongs = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("songs")
        .update({ is_active: false })
        .in("id", Array.from(selectedSongs));
      
      if (error) throw error;
      
      toast.success(`${selectedSongs.size} ${selectedSongs.size === 1 ? 'song' : 'songs'} deleted`);
      setSelectedSongs(new Set());
      setShowDeleteDialog(false);
      fetchSongs();
    } catch (error) {
      toast.error('Failed to delete songs');
    } finally {
      setIsDeleting(false);
    }
  };

  const allSelected = paginatedSongs.length > 0 && paginatedSongs.every(s => selectedSongs.has(s.id));
  const someSelected = paginatedSongs.some(s => selectedSongs.has(s.id)) && !allSelected;

  return (
    <AppPageLayout title="Catalog">

      <AppListToolbar
        placeholder="Search by title, writer, or lyric..."
        searchValue={searchQuery}
        onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
        count={`${totalItems} ${totalItems === 1 ? "song" : "songs"}`}
        action={
          <AppButton
            intent="primary"
            size="sm"
            onClick={() => navigate("/rights/songs/submit")}
          >
            <Plus className="h-4 w-4" />
            Add Song
          </AppButton>
        }
      />

      <AppSection spacing="none">
        {/* Sort control */}
        <div className="flex items-center justify-end mb-3">
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        <AppResponsiveList
          items={paginatedSongs}
          keyExtractor={(song) => song.id}
          emptyMessage={searchQuery ? "No songs match your search" : "No songs in catalog"}
          className="[&_.md\\:hidden]:space-y-2"
          renderCard={(song) => (
            <AppItemCard
              title={song.title}
              subtitle={song.songwriters.join(" / ")}
              meta={format(new Date(song.updatedAt), "MMM d, yyyy")}
              onClick={() => handleSongClick(song.song_number, song.title)}
            />
          )}
          renderTable={() => (
            <AppTable columns={["40px", "10%", "25%", "25%", "15%", "25%"]}>
              <AppTableHeader>
                <AppTableRow>
                  <AppTableHead>
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSongs(new Set(paginatedSongs.map(s => s.id)));
                        } else {
                          setSelectedSongs(new Set());
                        }
                      }}
                      aria-label="Select all songs"
                    />
                  </AppTableHead>
                  <AppTableHead>ID</AppTableHead>
                  <AppTableHead>Title</AppTableHead>
                  <AppTableHead>Songwriters</AppTableHead>
                  <AppTableHead align="right">Control</AppTableHead>
                  <AppTableHead>Last updated</AppTableHead>
                </AppTableRow>
              </AppTableHeader>
              <AppTableBody>
                {paginatedSongs.length === 0 ? (
                  <AppTableEmpty colSpan={6}>
                    <span className="text-muted-foreground text-sm">
                      {searchQuery ? "No songs match your search" : "No songs in catalog"}
                    </span>
                  </AppTableEmpty>
                ) : (
                  paginatedSongs.map((song, index) => (
                    <AppTableRow
                      key={song.id}
                      clickable
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey) {
                          handleRowSelect(song.id, index, e);
                        } else {
                          handleSongClick(song.song_number, song.title);
                        }
                      }}
                      className={cn(selectedSongs.has(song.id) && "bg-muted/50")}
                    >
                      <AppTableCell>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedSongs.has(song.id)}
                            onCheckedChange={() => {
                              const newSelection = new Set(selectedSongs);
                              if (newSelection.has(song.id)) {
                                newSelection.delete(song.id);
                              } else {
                                newSelection.add(song.id);
                              }
                              setSelectedSongs(newSelection);
                              setLastSelectedIndex(index);
                            }}
                            aria-label={`Select ${song.title}`}
                          />
                        </div>
                      </AppTableCell>
                      <AppTableCell muted>{song.song_number}</AppTableCell>
                      <AppTableCell className="font-medium">{song.title}</AppTableCell>
                      <AppTableCell muted>{song.songwriters.join(" / ") || "—"}</AppTableCell>
                      <AppTableCell align="right" muted>{song.control > 0 ? `${song.control}%` : "—"}</AppTableCell>
                      <AppTableCell muted>
                        {format(new Date(song.updatedAt), "MMM d, yyyy")}
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

        {/* Floating Action Bar - Admin Only */}
        {selectedSongs.size > 0 && isPlatformAdmin && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-4 px-4 py-2.5 rounded-lg bg-background border border-border shadow-lg">
              <span className="text-[13px] text-muted-foreground">
                {selectedSongs.size} {selectedSongs.size === 1 ? 'song' : 'songs'} selected
              </span>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="text-[13px] text-muted-foreground hover:text-destructive transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </AppSection>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedSongs.size} {selectedSongs.size === 1 ? 'song' : 'songs'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected songs from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSongs}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppPageLayout>
  );
}
