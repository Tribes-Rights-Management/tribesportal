import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import {
  AppPageLayout,
  AppSection,
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardBody,
  AppDetailRow,
  AppDetailRowGroup,
} from "@/components/app-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateLabelCopy as generateLabelCopySchema, getPublicationYear } from "@/types/song-schema";
import type { Song as SongSchema } from "@/types/song-schema";

/**
 * SONG DETAIL PAGE — Individual song view within Rights Catalog
 *
 * Route: /rights/catalog/:songNumber/:songSlug?
 * Five-section composition record:
 *   1. Overview (Title, Language, Alternate Title, Duration)
 *   2. Songwriters (song_writers junction table → writers)
 *   3. Ownership (song_ownership → publishers, tribes_entities)
 *   4. Label Copy (placeholder)
 *   5. Lyrics (metadata.lyrics)
 */

// ── Interfaces ──────────────────────────────────────────────

interface SongDetail {
  id: string;
  song_number: number;
  title: string;
  metadata: Record<string, any>;
  created_at: string;
  is_active: boolean;
  iswc: string | null;
  ccli_song_id: string | null;
  language: string | null;
  genre: string | null;
  duration_seconds: number | null;
  release_date: string | null;
  alternate_titles: string[] | null;
}

interface SongWriter {
  id?: string;
  writer_id: string | null;
  name: string;
  pro: string;
  ipi_number: string;
  share: number;
  credit: string;
}

interface SongOwnershipRow {
  id?: string;
  song_writer_id: string | null;
  publisher_id: string;
  publisher_name: string;
  pro: string | null;
  ownership_percentage: number;
  tribes_administered: boolean;
  administrator_entity_id: string | null;
  administrator_name: string | null;
  territory: string;
  _isNew?: boolean;
  _deleted?: boolean;
}

interface EditableFields {
  title: string;
  language: string;
  is_active: boolean;
  lyrics: string;
  alternate_titles: string;
  writers: SongWriter[];
  ownership: SongOwnershipRow[];
}

// ── PRO text abbreviation options ────────────────────────────
const PRO_OPTIONS = [
  "ASCAP", "BMI", "SESAC", "GMR", "SOCAN", "PRS", "APRA", "GEMA", "SACEM", "JASRAC",
];

// ── Slug helper ──────────────────────────────────────────────
function toSlug(title: string) {
  return (
    title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "untitled"
  );
}

// ── Edit-mode input styling ─────────────────────────────────
const editInputClass =
  "w-full text-sm text-foreground bg-white dark:bg-muted/30 border border-[var(--app-surface-border)] rounded-lg px-3 h-10 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-colors";

const editTextareaClass =
  "w-full text-sm text-foreground bg-white dark:bg-muted/30 border border-[var(--app-surface-border)] rounded-lg px-3 py-2 min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-colors";

// ── Status Select (edit mode only) ──────────────────────────
function StatusSelect({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (active: boolean) => void;
}) {
  return (
    <select
      value={value ? "active" : "inactive"}
      onChange={(e) => onChange(e.target.value === "active")}
      className={editInputClass}
    >
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  );
}

// ── Status Badge ────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "text-xs font-medium px-2.5 py-1 rounded-md",
        active
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "text-muted-foreground bg-muted border border-border"
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ── Reusable copy icon button ────────────────────────────────
function CopyIconButton({ text, label = "Copy to clipboard", successMessage = "Copied to clipboard" }: { text: string; label?: string; successMessage?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
      aria-label={label}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

// ── Label Copy Display with icon copy button ────────────────
function LabelCopyDisplay({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <p className="text-sm text-foreground leading-relaxed flex-1">{text}</p>
      <CopyIconButton text={text} successMessage="Label copy copied to clipboard" />
    </div>
  );
}

function PublisherTypeahead({
  value,
  onChange,
  placeholder = "Type to search publishers…",
}: {
  value: string;
  onChange: (publisherId: string, name: string, pro: string | null) => void;
  placeholder?: string;
}) {
  const [search, setSearch] = useState(value);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ id: string; name: string; pro: string | null }[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntryPro, setNewEntryPro] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 1) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      const { data } = await supabase
        .from("publishers")
        .select("id, name, pro")
        .ilike("name", `%${debouncedSearch}%`)
        .eq("is_active", true)
        .order("name")
        .limit(10);
      setResults((data || []) as { id: string; name: string; pro: string | null }[]);
    };
    fetchResults();
  }, [debouncedSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIsAdding(false);
        setNewEntryPro("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (r: { id: string; name: string; pro: string | null }) => {
    setSearch(r.name);
    onChange(r.id, r.name, r.pro);
    setOpen(false);
    setIsAdding(false);
    setNewEntryPro("");
  };

  const handleConfirmCreate = async () => {
    if (!search.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("publishers")
        .insert({
          name: search.trim(),
          pro: newEntryPro || null,
          is_active: true,
          is_controlled: false,
        } as any)
        .select("id, name, pro")
        .single();
      if (error) throw error;
      if (data) {
        handleSelect({ id: data.id, name: data.name, pro: data.pro });
        toast.success(`Added "${data.name}" as publisher`);
      }
    } catch (err: any) {
      console.error("Failed to create publisher:", err);
      toast.error("Failed to add publisher");
    } finally {
      setIsCreating(false);
    }
  };

  const showDropdown = open && search.length >= 1;
  const noExactMatch = results.length === 0 || !results.some(
    (r) => r.name.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          setIsAdding(false);
        }}
        onFocus={() => search.length >= 1 && setOpen(true)}
        placeholder={placeholder}
        className="w-full text-sm text-foreground bg-white dark:bg-muted/30 border border-[var(--app-surface-border)] rounded-lg px-3 h-10 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition-colors"
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-[280px] overflow-y-auto">
          {isAdding ? (
            <div className="p-3 space-y-3">
              <p className="text-sm text-foreground font-medium">
                Adding: &quot;{search.trim()}&quot;
              </p>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  PRO
                </label>
                <select
                  value={newEntryPro}
                  onChange={(e) => setNewEntryPro(e.target.value)}
                  className={cn(editInputClass, "mt-1")}
                >
                  <option value="">None / Unknown</option>
                  {PRO_OPTIONS.map((pro) => (
                    <option key={pro} value={pro}>{pro}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewEntryPro("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCreate}
                  disabled={isCreating}
                  className="text-xs font-medium text-background bg-foreground rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isCreating ? "Adding…" : "Add Publisher"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <span>{r.name}</span>
                  {r.pro && (
                    <span className="text-xs text-muted-foreground ml-auto pl-2">{r.pro}</span>
                  )}
                </button>
              ))}
              {noExactMatch && search.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="w-full text-left px-3 py-2 text-xs text-primary hover:bg-muted/50 cursor-pointer font-medium transition-colors"
                >
                  + Add &quot;{search.trim()}&quot; as new publisher
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Algolia writer search constants ─────────────────────────
const ALGOLIA_APP_ID = "8WVEYVACJ3";
const ALGOLIA_SEARCH_KEY = "7f00c268627682cfec8adac8f1686033";
const ALGOLIA_INDEX = "writers";

// ── Main Component ──────────────────────────────────────────
export default function SongDetailPage() {
  const { songNumber } = useParams<{ songNumber: string }>();
  const navigate = useNavigate();
  const [songId, setSongId] = useState<string | null>(null);
  const [song, setSong] = useState<SongDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Writers from song_writers junction table
  const [songWriters, setSongWriters] = useState<SongWriter[]>([]);

  // Ownership from song_ownership table
  const [ownership, setOwnership] = useState<SongOwnershipRow[]>([]);

  // Tribes entities for auto-resolution
  const [tribesEntities, setTribesEntities] = useState<Record<string, { id: string; entity_name: string; ipi_number: string }>>({});

  // Algolia writer search state
  const [writerSearchResults, setWriterSearchResults] = useState<Record<number, any[]>>({});
  const [activeWriterSearch, setActiveWriterSearch] = useState<number | null>(null);
  const [lyricsExpanded, setLyricsExpanded] = useState(false);

  // ── Algolia writer search ─────────────────────────────────
  const searchWriters = async (query: string, index: number) => {
    if (!query.trim() || query.length < 2) {
      setWriterSearchResults(prev => ({ ...prev, [index]: [] }));
      return;
    }
    try {
      const response = await fetch(
        `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`,
        {
          method: "POST",
          headers: {
            "X-Algolia-API-Key": ALGOLIA_SEARCH_KEY,
            "X-Algolia-Application-Id": ALGOLIA_APP_ID,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, hitsPerPage: 8 }),
        }
      );
      const data = await response.json();
      setWriterSearchResults(prev => ({ ...prev, [index]: data.hits || [] }));
    } catch (error) {
      console.error("Writer search error:", error);
    }
  };

  const selectWriter = async (index: number, hit: any) => {
    const updated = [...editedFields.writers];
    updated[index] = {
      ...updated[index],
      name: hit.name,
      pro: hit.pro || "",
      ipi_number: hit.ipi_number || "",
      writer_id: null,
    };

    // Look up writer UUID from the writers table
    try {
      const { data: writerRecord } = await supabase
        .from("writers")
        .select("id")
        .eq("name", hit.name)
        .maybeSingle();

      if (writerRecord) {
        updated[index].writer_id = writerRecord.id;
      }
    } catch (err) {
      console.error("Writer lookup error:", err);
    }

    updateField("writers", updated);
    setWriterSearchResults(prev => ({ ...prev, [index]: [] }));
    setActiveWriterSearch(null);
  };

  const [editedFields, setEditedFields] = useState<EditableFields>({
    title: "",
    language: "",
    is_active: true,
    lyrics: "",
    alternate_titles: "",
    writers: [],
    ownership: [],
  });

  // ── Fetch song ───────────────────────────────────────────
  const fetchSong = useCallback(async () => {
    if (!songNumber) return;

    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("songs")
        .select(
          "id, song_number, title, metadata, created_at, is_active, iswc, ccli_song_id, language, genre, duration_seconds, release_date, alternate_titles"
        )
        .eq("song_number", parseInt(songNumber))
        .single();

      if (error) throw error;
      const songData = data as any;
      setSongId(songData.id);
      setSong(songData as SongDetail);

      const expectedPath = `/rights/catalog/${songNumber}/${toSlug(songData.title)}`;
      if (window.location.pathname !== expectedPath) {
        window.history.replaceState(null, "", expectedPath);
      }
    } catch (err: any) {
      console.error("Failed to fetch song:", err);
      toast.error("Song not found");
      navigate("/rights/catalog");
    } finally {
      setIsLoading(false);
    }
  }, [songNumber, navigate]);

  // ── Fetch writers from song_writers junction table ────────
  const fetchSongWriters = useCallback(async () => {
    if (!songId) return;
    try {
      const { data, error } = await (supabase as any)
        .from("song_writers")
        .select(`
          id,
          song_id,
          writer_id,
          share,
          credit,
          writer:writers!song_writers_writer_id_fkey(id, name, pro, ipi_number)
        `)
        .eq("song_id", songId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const enriched: SongWriter[] = ((data || []) as any[]).map((sw) => ({
        id: sw.id,
        writer_id: sw.writer_id,
        name: sw.writer?.name || "",
        pro: sw.writer?.pro || "",
        ipi_number: sw.writer?.ipi_number || "",
        share: Number(sw.share),
        credit: sw.credit || "both",
      }));
      setSongWriters(enriched);
    } catch (err: any) {
      console.error("Failed to fetch song writers:", err);
    }
  }, [songId]);

  // ── Fetch ownership rows ─────────────────────────────────
  const fetchOwnership = useCallback(async () => {
    if (!songId) return;
    try {
      const { data, error } = await (supabase as any)
        .from("song_ownership")
        .select(`
          id,
          song_writer_id,
          publisher_id,
          ownership_percentage,
          tribes_administered,
          administrator_entity_id,
          territory,
          notes,
          publisher:publishers!song_ownership_publisher_id_fkey(id, name, pro),
          administrator:tribes_entities!song_ownership_administrator_entity_id_fkey(entity_name, ipi_number)
        `)
        .eq("song_id", songId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const enriched: SongOwnershipRow[] = ((data || []) as any[]).map((o) => ({
        id: o.id,
        song_writer_id: o.song_writer_id || null,
        publisher_id: o.publisher_id,
        publisher_name: o.publisher?.name || "Unknown",
        pro: o.publisher?.pro || null,
        ownership_percentage: Number(o.ownership_percentage),
        tribes_administered: o.tribes_administered ?? false,
        administrator_entity_id: o.administrator_entity_id || null,
        administrator_name: o.administrator?.entity_name || null,
        territory: o.territory || "",
      }));

      setOwnership(enriched);
    } catch (err: any) {
      console.error("Failed to fetch ownership:", err);
    }
  }, [songId]);

  // ── Fetch Tribes entities ────────────────────────────────
  useEffect(() => {
    const fetchTribesEntities = async () => {
      const { data } = await (supabase as any)
        .from("tribes_entities")
        .select("id, pro, entity_name, ipi_number")
        .eq("is_active", true);

      const map: Record<string, any> = {};
      (data || []).forEach((e: any) => { map[e.pro] = e; });
      setTribesEntities(map);
    };
    fetchTribesEntities();
  }, []);

  useEffect(() => {
    fetchSong();
    fetchSongWriters();
    fetchOwnership();
  }, [fetchSong, fetchSongWriters, fetchOwnership]);

  // Populate edit fields when entering edit mode
  useEffect(() => {
    if (editing && song) {
      const metadata = (song.metadata as Record<string, any>) || {};
      setEditedFields({
        title: song.title || "",
        language: song.language || "",
        is_active: song.is_active,
        lyrics: metadata.lyrics || "",
        alternate_titles: song.alternate_titles?.join(", ") || "",
        writers: songWriters.map((sw) => ({
          id: sw.id,
          writer_id: sw.writer_id,
          name: sw.name,
          pro: sw.pro,
          ipi_number: sw.ipi_number,
          share: sw.share,
          credit: sw.credit,
        })),
        ownership: ownership.map((o) => ({
          id: o.id,
          song_writer_id: o.song_writer_id,
          publisher_id: o.publisher_id,
          publisher_name: o.publisher_name,
          pro: o.pro,
          ownership_percentage: o.ownership_percentage,
          tribes_administered: o.tribes_administered,
          administrator_entity_id: o.administrator_entity_id,
          administrator_name: o.administrator_name,
          territory: o.territory,
        })),
      });
    }
  }, [editing, song, songWriters, ownership]);

  const updateField = (field: keyof EditableFields, value: any) => {
    setEditedFields((prev) => ({ ...prev, [field]: value }));
  };

  // ── Tribes Administration Toggle ──────────────────────────
  const handleTribesToggle = (index: number, value: boolean) => {
    const updated = [...editedFields.ownership];
    const row = updated[index];

    if (value && row.pro) {
      const entity = tribesEntities[row.pro];
      updated[index] = {
        ...row,
        tribes_administered: true,
        administrator_entity_id: entity?.id || null,
        administrator_name: entity?.entity_name || "No Tribes entity for this PRO",
      };
    } else {
      updated[index] = {
        ...row,
        tribes_administered: false,
        administrator_entity_id: null,
        administrator_name: null,
      };
    }
    updateField("ownership", updated);
  };

  // ── Save handler ─────────────────────────────────────────
  const handleSave = async () => {
    if (!songId || !song) return;

    // Validate writer share total
    const writerTotal = editedFields.writers.reduce((sum, w) => sum + (w.share || 0), 0);
    if (editedFields.writers.length > 0 && writerTotal !== 100) {
      toast.error(`Writer shares must total exactly 100.00% (currently ${writerTotal.toFixed(2)}%)`);
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update song record (NO writers in metadata anymore)
      const currentMetadata = (song.metadata as Record<string, any>) || {};
      const updatedMetadata: Record<string, any> = {
        ...currentMetadata,
        lyrics: editedFields.lyrics || undefined,
      };
      // Remove legacy writers from metadata
      delete updatedMetadata.writers;

      const { error: songError } = await supabase
        .from("songs")
        .update({
          title: editedFields.title,
          language: editedFields.language || null,
          is_active: editedFields.is_active,
          alternate_titles: editedFields.alternate_titles
            ? editedFields.alternate_titles.split(",").map((t: string) => t.trim()).filter(Boolean)
            : null,
          metadata: updatedMetadata as any,
        })
        .eq("id", songId);

      if (songError) throw songError;

      // 2. Save writers to song_writers table
      await saveSongWriters();

      // 3. Save ownership changes
      await saveOwnershipChanges();

      toast.success("Song updated");
      setEditing(false);

      if (editedFields.title !== song.title) {
        const newSlug = toSlug(editedFields.title);
        window.history.replaceState(null, "", `/rights/catalog/${songNumber}/${newSlug}`);
      }

      await Promise.all([fetchSong(), fetchSongWriters(), fetchOwnership()]);
    } catch (err: any) {
      console.error("Failed to save song:", err);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const saveSongWriters = async () => {
    if (!songId) return;

    // Delete existing song_writers for this song
    await (supabase as any).from("song_writers").delete().eq("song_id", songId);

    // Insert updated writer records
    const writerRecords = editedFields.writers
      .filter((w) => w.writer_id && w.name.trim())
      .map((w) => ({
        song_id: songId,
        writer_id: w.writer_id!,
        share: w.share,
        credit: w.credit || "both",
      }));

    if (writerRecords.length > 0) {
      const { error } = await (supabase as any)
        .from("song_writers")
        .insert(writerRecords);

      if (error) {
        console.error("Error saving writers:", error);
        toast.error("Failed to save writers");
        throw error;
      }
    }
  };

  const saveOwnershipChanges = async () => {
    if (!songId) return;

    // Delete existing ownership for this song
    await (supabase as any).from("song_ownership").delete().eq("song_id", songId);

    // Get the just-inserted song_writers to map song_writer_id
    const { data: currentSongWriters } = await (supabase as any)
      .from("song_writers")
      .select("id, writer_id")
      .eq("song_id", songId);

    const ownershipRecords = editedFields.ownership
      .filter((o) => o.publisher_id && !o._deleted)
      .map((o) => ({
        song_id: songId,
        song_writer_id: o.song_writer_id || null,
        publisher_id: o.publisher_id,
        ownership_percentage: o.ownership_percentage,
        tribes_administered: o.tribes_administered,
        administrator_entity_id: o.tribes_administered ? o.administrator_entity_id : null,
        territory: o.territory || null,
      }));

    if (ownershipRecords.length > 0) {
      const { error } = await (supabase as any)
        .from("song_ownership")
        .insert(ownershipRecords);

      if (error) {
        console.error("Error saving ownership:", error);
        toast.error("Failed to save ownership");
        throw error;
      }
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  // ── Loading state ─────────────────────────────────────────
  if (isLoading) {
    return (
      <AppPageLayout
        title="Loading…"
        backLink={{ to: "/rights/catalog", label: "Catalog" }}
      >
        <AppSection spacing="md">
          <p className="text-sm text-muted-foreground">Loading song details…</p>
        </AppSection>
      </AppPageLayout>
    );
  }

  // ── Not found state ───────────────────────────────────────
  if (!song) {
    return (
      <AppPageLayout
        title="Not Found"
        backLink={{ to: "/rights/catalog", label: "Catalog" }}
      >
        <AppSection spacing="md">
          <p className="text-sm text-muted-foreground">
            This song could not be found.
          </p>
        </AppSection>
      </AppPageLayout>
    );
  }

  const metadata = (song.metadata as Record<string, any>) || {};

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const displayTitle = editing ? editedFields.title || song.title : song.title;

  // Writer share total
  const writerTotal = editing
    ? editedFields.writers.reduce((sum, w) => sum + (w.share || 0), 0)
    : songWriters.reduce((sum, w) => sum + w.share, 0);

  // Ownership total
  const ownershipTotal = editing
    ? editedFields.ownership.filter((r) => !r._deleted).reduce((sum, r) => sum + (r.ownership_percentage || 0), 0)
    : ownership.reduce((sum, r) => sum + r.ownership_percentage, 0);

  // ── Action slot: status badge + edit/save buttons ─────────
  const actionSlot = (
    <div className="flex items-center gap-3">
      {!editing && <StatusBadge active={song.is_active} />}
      {editing && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "text-sm font-medium px-4 py-2 rounded-lg bg-foreground text-background hover:opacity-90 shadow-sm transition-all",
            isSaving && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      )}
      <button
        onClick={editing ? handleCancel : () => setEditing(true)}
        className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--app-surface-border)] text-foreground bg-white hover:bg-muted/50 shadow-sm transition-all"
      >
        {editing ? "Cancel" : "Edit"}
      </button>
    </div>
  );

  return (
    <AppPageLayout
      title={displayTitle}
      backLink={{ to: "/rights/catalog", label: "Catalog" }}
      action={actionSlot}
    >
      <div className="max-w-4xl">
        {/* ─── 1. OVERVIEW ──────────────────────────────── */}
        <AppCard className="mt-5">
          <AppCardHeader>
            <AppCardTitle>Overview</AppCardTitle>
          </AppCardHeader>
          {editing ? (
            <AppCardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
                  <input
                    type="text"
                    value={editedFields.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className={editInputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Language</label>
                  <input
                    type="text"
                    value={editedFields.language}
                    onChange={(e) => updateField("language", e.target.value)}
                    className={editInputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Alternate Title</label>
                  <input
                    type="text"
                    value={editedFields.alternate_titles}
                    onChange={(e) => updateField("alternate_titles", e.target.value)}
                    className={editInputClass}
                  />
                </div>
                {song.duration_seconds != null && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Duration</label>
                    <div className="text-sm font-medium text-foreground h-10 flex items-center">
                      {formatDuration(song.duration_seconds)}
                    </div>
                  </div>
                )}
              </div>
            </AppCardBody>
          ) : (
            <AppCardBody className="p-0">
              <AppDetailRowGroup>
                <AppDetailRow label="Title" value={song.title} />
                <AppDetailRow label="Language" value={song.language || "—"} />
                <AppDetailRow
                  label="Alternate Title"
                  value={
                    song.alternate_titles && song.alternate_titles.length > 0
                      ? song.alternate_titles.join(", ")
                      : "—"
                  }
                />
                {song.duration_seconds != null && (
                  <AppDetailRow label="Duration" value={formatDuration(song.duration_seconds)} />
                )}
              </AppDetailRowGroup>
            </AppCardBody>
          )}
        </AppCard>

        {/* ─── 2. SONGWRITERS (from song_writers table) ──── */}
        <AppCard className="mt-5">
          <AppCardHeader>
            <AppCardTitle>Songwriters</AppCardTitle>
          </AppCardHeader>
          <AppCardBody className={editing ? undefined : "p-0"}>
            {editing ? (
              <div>
                {/* ── Desktop edit layout ── */}
                <div className="hidden md:block space-y-3">
                  {/* Column headers */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <span className="text-xs font-medium text-muted-foreground">Writer</span>
                    </div>
                    <div className="w-[140px]">
                      <span className="text-xs font-medium text-muted-foreground">IPI Number</span>
                    </div>
                    <div className="w-[70px]">
                      <span className="text-xs font-medium text-muted-foreground">Share %</span>
                    </div>
                    <div className="w-[22px]" />
                  </div>
                  {editedFields.writers.map((writer, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          value={writer.name}
                          onChange={(e) => {
                            const updated = [...editedFields.writers];
                            updated[index] = { ...updated[index], name: e.target.value };
                            updateField("writers", updated);
                            searchWriters(e.target.value, index);
                            setActiveWriterSearch(index);
                          }}
                          onFocus={() => setActiveWriterSearch(index)}
                          onBlur={() => setTimeout(() => setActiveWriterSearch(null), 200)}
                          placeholder="Type to search writers..."
                          className={editInputClass}
                        />
                        {activeWriterSearch === index && writerSearchResults[index]?.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {writerSearchResults[index].map((hit: any) => (
                              <button
                                key={hit.objectID}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectWriter(index, hit)}
                                className="w-full px-3 py-2 text-left hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors flex items-center justify-between gap-3"
                              >
                                <span className="font-medium text-sm text-foreground">{hit.name}</span>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                                  {hit.pro || "—"}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-[140px]">
                        <input
                          value={writer.ipi_number}
                          readOnly
                          tabIndex={-1}
                          placeholder="—"
                          className="w-full text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 h-10 font-mono cursor-not-allowed"
                        />
                      </div>
                      <div className="w-[70px]">
                        <input
                          type="number"
                          value={writer.share}
                          onChange={(e) => {
                            const updated = [...editedFields.writers];
                            updated[index] = { ...updated[index], share: Number(e.target.value) };
                            updateField("writers", updated);
                          }}
                          placeholder="%"
                          className={cn(editInputClass, "text-right")}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = editedFields.writers.filter((_, i) => i !== index);
                          updateField("writers", updated);
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Remove writer"
                      >
                        <span className="text-sm">×</span>
                      </button>
                    </div>
                  ))}
                  {/* Writer total */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="flex-1" />
                    <div className="w-[140px]" />
                    <div className="w-[70px]">
                      <span className={cn(
                        "text-sm font-semibold block text-right pr-2",
                        writerTotal === 100 ? "text-emerald-600" : "text-red-600"
                      )}>
                        {writerTotal.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-[22px]" />
                  </div>
                </div>

                {/* ── Mobile edit layout ── */}
                <div className="md:hidden space-y-4">
                  {editedFields.writers.map((writer, index) => (
                    <div key={index} className="border border-[var(--app-surface-border)] rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Writer {index + 1}</span>
                        <button
                          onClick={() => {
                            const updated = editedFields.writers.filter((_, i) => i !== index);
                            updateField("writers", updated);
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <span className="text-sm">×</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          value={writer.name}
                          onChange={(e) => {
                            const updated = [...editedFields.writers];
                            updated[index] = { ...updated[index], name: e.target.value };
                            updateField("writers", updated);
                            searchWriters(e.target.value, index);
                            setActiveWriterSearch(index);
                          }}
                          onFocus={() => setActiveWriterSearch(index)}
                          onBlur={() => setTimeout(() => setActiveWriterSearch(null), 200)}
                          placeholder="Writer name"
                          className={editInputClass}
                        />
                        {activeWriterSearch === index && writerSearchResults[index]?.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {writerSearchResults[index].map((hit: any) => (
                              <button
                                key={hit.objectID}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectWriter(index, hit)}
                                className="w-full px-3 py-2 text-left hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors flex items-center justify-between gap-3"
                              >
                                <span className="font-medium text-sm text-foreground">{hit.name}</span>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                                  {hit.pro || "—"}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">IPI Number</label>
                          <input
                            value={writer.ipi_number}
                            readOnly
                            tabIndex={-1}
                            placeholder="—"
                            className="w-full text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 h-10 font-mono cursor-not-allowed"
                          />
                        </div>
                        <div className="w-24">
                          <label className="text-xs text-muted-foreground mb-1 block">Share %</label>
                          <input
                            type="number"
                            value={writer.share}
                            onChange={(e) => {
                              const updated = [...editedFields.writers];
                              updated[index] = { ...updated[index], share: Number(e.target.value) };
                              updateField("writers", updated);
                            }}
                            placeholder="%"
                            className={cn(editInputClass, "text-right")}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Mobile total */}
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-xs font-medium text-muted-foreground">Total</span>
                    <span className={cn(
                      "text-sm font-semibold tabular-nums",
                      writerTotal === 100 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {writerTotal.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const updated = [...editedFields.writers, {
                      id: undefined,
                      writer_id: null,
                      name: "",
                      pro: "",
                      ipi_number: "",
                      share: 0,
                      credit: "both",
                    }];
                    updateField("writers", updated);
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-3"
                >
                  + Add Writer
                </button>
              </div>
            ) : (
              songWriters.length > 0 ? (
                <>
                  {/* Desktop: table layout */}
                  <div className="hidden md:block">
                    {/* Column headers */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                      <span className="text-xs font-medium text-muted-foreground">Writer</span>
                      <div className="flex items-center gap-6">
                        <span className="text-xs font-medium text-muted-foreground w-[120px] text-right">IPI Number</span>
                        <span className="text-xs font-medium text-muted-foreground w-[50px] text-right">Share</span>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {songWriters.map((sw, index) => (
                        <div key={sw.id || index} className="flex items-center justify-between px-4 py-3">
                          <span className="text-sm font-medium text-foreground">{sw.name || "Unknown"}</span>
                          <div className="flex items-center gap-6">
                            {sw.ipi_number ? (
                              <span className="text-sm text-muted-foreground font-mono tabular-nums w-[120px] text-right">{sw.ipi_number}</span>
                            ) : (
                              <span className="w-[120px]" />
                            )}
                            <span className="text-sm text-muted-foreground tabular-nums w-[50px] text-right">{sw.share}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                      <span className="text-xs font-medium text-muted-foreground">Total</span>
                      <span className={cn("text-sm font-semibold tabular-nums w-[50px] text-right", writerTotal === 100 ? "text-emerald-600" : "text-red-600")}>{writerTotal.toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Mobile: stacked card layout */}
                  <div className="md:hidden">
                    <div className="divide-y divide-border">
                      {songWriters.map((sw, index) => (
                        <div key={sw.id || index} className="px-4 py-3.5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 mr-3">
                              <span className="text-[15px] font-semibold text-foreground">{sw.name || "Unknown"}</span>
                              {sw.ipi_number && (
                                <div className="mt-0.5 text-xs text-muted-foreground font-mono">{sw.ipi_number}</div>
                              )}
                            </div>
                            <span className="text-[20px] font-bold tabular-nums text-foreground shrink-0">{sw.share}%</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between px-4 py-3.5 bg-muted/50">
                        <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Total</span>
                        <span className={cn("text-[15px] font-bold tabular-nums", writerTotal === 100 ? "text-emerald-600" : "text-red-600")}>{writerTotal.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-4 py-6">
                  <p className="text-sm text-muted-foreground">No songwriters added</p>
                </div>
              )
            )}
          </AppCardBody>
        </AppCard>

        {/* ─── 3. OWNERSHIP ─────────────────────────────── */}
        <AppCard className="mt-5">
          <AppCardHeader>
            <AppCardTitle>Ownership</AppCardTitle>
          </AppCardHeader>
          <AppCardBody className={editing ? undefined : "p-0"}>
            {editing ? (
              <div>
                {/* ── Desktop edit layout ── */}
                <div className="hidden md:block space-y-3">
                  {/* Column headers */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <span className="text-xs font-medium text-muted-foreground">Publisher</span>
                    </div>
                    <div className="w-[80px]">
                      <span className="text-xs font-medium text-muted-foreground">PRO</span>
                    </div>
                    <div className="w-[120px]">
                      <span className="text-xs font-medium text-muted-foreground">Administered</span>
                    </div>
                    <div className="w-[70px]">
                      <span className="text-xs font-medium text-muted-foreground">Share %</span>
                    </div>
                    <div className="w-[22px]" />
                  </div>
                  {editedFields.ownership
                    .map((row, index) => ({ row, index }))
                    .filter(({ row }) => !row._deleted)
                    .map(({ row, index }) => (
                      <div key={index}>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <PublisherTypeahead
                              value={row.publisher_name}
                              onChange={(publisherId, name, pro) => {
                                const updated = [...editedFields.ownership];
                                updated[index] = {
                                  ...updated[index],
                                  publisher_id: publisherId,
                                  publisher_name: name,
                                  pro: pro || null,
                                  ...(updated[index].tribes_administered && pro ? {
                                    administrator_entity_id: tribesEntities[pro]?.id || null,
                                    administrator_name: tribesEntities[pro]?.entity_name || "No Tribes entity for this PRO",
                                  } : {}),
                                };
                                updateField("ownership", updated);
                              }}
                              placeholder="Type to search publishers…"
                            />
                          </div>
                          <div className="w-[80px]">
                            <span className="text-xs text-muted-foreground px-2 h-10 flex items-center">
                              {row.pro || "—"}
                            </span>
                          </div>
                          <div className="w-[120px]">
                            <select
                              value={row.tribes_administered ? "yes" : "no"}
                              onChange={(e) => handleTribesToggle(index, e.target.value === "yes")}
                              className={editInputClass}
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                          <div className="w-[70px]">
                            <input
                              type="number"
                              value={row.ownership_percentage}
                              onChange={(e) => {
                                const updated = [...editedFields.ownership];
                                updated[index] = { ...updated[index], ownership_percentage: Number(e.target.value) };
                                updateField("ownership", updated);
                              }}
                              placeholder="%"
                              className={cn(editInputClass, "text-right")}
                            />
                          </div>
                          <button
                            onClick={() => {
                              const updated = [...editedFields.ownership];
                              if (row.id && !row._isNew) {
                                updated[index] = { ...updated[index], _deleted: true };
                              } else {
                                updated.splice(index, 1);
                              }
                              updateField("ownership", updated);
                            }}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            title="Remove ownership"
                          >
                            <span className="text-sm">×</span>
                          </button>
                        </div>
                        {row.tribes_administered && (
                          <div className="ml-0 mt-1 mb-1 pl-2 border-l-2 border-border">
                            <span className="text-xs font-medium text-muted-foreground mr-2">Administrator:</span>
                            <span className="text-xs text-foreground">{row.administrator_name || "—"}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  {/* Total row */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="flex-1 text-right">
                      <span className="text-xs font-medium text-muted-foreground">Total</span>
                    </div>
                    <div className="w-[80px]" />
                    <div className="w-[120px]" />
                    <div className="w-[70px]">
                      <span className={cn(
                        "text-sm font-semibold block text-right pr-2",
                        ownershipTotal === 100 ? "text-emerald-600" : "text-red-600"
                      )}>
                        {ownershipTotal}%
                      </span>
                    </div>
                    <div className="w-[22px]" />
                  </div>
                </div>

                {/* ── Mobile edit layout ── */}
                <div className="md:hidden space-y-4">
                  {editedFields.ownership
                    .map((row, index) => ({ row, index }))
                    .filter(({ row }) => !row._deleted)
                    .map(({ row, index }) => (
                      <div key={index} className="border border-[var(--app-surface-border)] rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Publisher {index + 1}</span>
                          <button
                            onClick={() => {
                              const updated = [...editedFields.ownership];
                              if (row.id && !row._isNew) {
                                updated[index] = { ...updated[index], _deleted: true };
                              } else {
                                updated.splice(index, 1);
                              }
                              updateField("ownership", updated);
                            }}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <span className="text-sm">×</span>
                          </button>
                        </div>
                        <PublisherTypeahead
                          value={row.publisher_name}
                          onChange={(publisherId, name, pro) => {
                            const updated = [...editedFields.ownership];
                            updated[index] = {
                              ...updated[index],
                              publisher_id: publisherId,
                              publisher_name: name,
                              pro: pro || null,
                              ...(updated[index].tribes_administered && pro ? {
                                administrator_entity_id: tribesEntities[pro]?.id || null,
                                administrator_name: tribesEntities[pro]?.entity_name || "No Tribes entity for this PRO",
                              } : {}),
                            };
                            updateField("ownership", updated);
                          }}
                          placeholder="Type to search publishers…"
                        />
                        <div className="flex gap-3">
                          <div className="w-20">
                            <label className="text-xs text-muted-foreground mb-1 block">PRO</label>
                            <span className="text-sm text-muted-foreground h-10 flex items-center">{row.pro || "—"}</span>
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block">Administered</label>
                            <select
                              value={row.tribes_administered ? "yes" : "no"}
                              onChange={(e) => handleTribesToggle(index, e.target.value === "yes")}
                              className={editInputClass}
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                          <div className="w-24">
                            <label className="text-xs text-muted-foreground mb-1 block">Share %</label>
                            <input
                              type="number"
                              value={row.ownership_percentage}
                              onChange={(e) => {
                                const updated = [...editedFields.ownership];
                                updated[index] = { ...updated[index], ownership_percentage: Number(e.target.value) };
                                updateField("ownership", updated);
                              }}
                              placeholder="%"
                              className={cn(editInputClass, "text-right")}
                            />
                          </div>
                        </div>
                        {row.tribes_administered && (
                          <div className="text-xs text-muted-foreground">
                            Administrator: <span className="text-foreground">{row.administrator_name || "—"}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  {/* Mobile total */}
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-xs font-medium text-muted-foreground">Total</span>
                    <span className={cn(
                      "text-sm font-semibold tabular-nums",
                      ownershipTotal === 100 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {ownershipTotal}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const updated = [...editedFields.ownership, {
                      publisher_id: "",
                      publisher_name: "",
                      pro: null,
                      ownership_percentage: 0,
                      tribes_administered: false,
                      administrator_entity_id: null,
                      administrator_name: null,
                      song_writer_id: null,
                      territory: "",
                      _isNew: true,
                    }];
                    updateField("ownership", updated);
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-3"
                >
                  + Add Ownership
                </button>
              </div>
            ) : (
              ownership.length > 0 ? (
                <>
                  {/* Desktop: table layout */}
                  <div className="hidden md:block">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                      <span className="text-xs font-medium text-muted-foreground">Publisher</span>
                      <div className="flex items-center gap-6">
                        <span className="text-xs font-medium text-muted-foreground w-[80px] text-center">PRO</span>
                        <span className="text-xs font-medium text-muted-foreground w-[100px] text-center">Administered</span>
                        <span className="text-xs font-medium text-muted-foreground w-[60px] text-right">Share</span>
                        <span className="text-xs font-medium text-muted-foreground w-[140px] text-right">Administrator</span>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {ownership.map((row) => (
                        <div key={row.id} className="flex items-center justify-between px-4 py-3">
                          <span className="text-sm font-medium text-foreground">{row.publisher_name || "Unknown Publisher"}</span>
                          <div className="flex items-center gap-6">
                            <span className="text-sm text-muted-foreground w-[80px] text-center">{row.pro || "—"}</span>
                            <span className="w-[100px] text-center">
                              {row.tribes_administered ? (
                                <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Administered</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </span>
                            <span className="text-sm text-muted-foreground tabular-nums w-[60px] text-right">{row.ownership_percentage}%</span>
                            <span className="text-sm text-muted-foreground w-[140px] text-right">{row.tribes_administered ? row.administrator_name || "—" : "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                      <span className="text-xs font-medium text-muted-foreground">Total</span>
                      <div className="flex items-center gap-6">
                        <span className="w-[80px]" />
                        <span className="w-[100px]" />
                        <span className={cn("text-sm font-semibold tabular-nums w-[60px] text-right", ownershipTotal === 100 ? "text-emerald-600" : "text-red-600")}>{ownershipTotal}%</span>
                        <span className="w-[140px]" />
                      </div>
                    </div>
                  </div>

                  {/* Mobile: stacked card layout */}
                  <div className="md:hidden">
                    <div className="divide-y divide-border">
                      {ownership.map((row, index) => (
                        <div key={row.id} className="px-4 py-3.5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 mr-3">
                              <span className="text-[15px] font-semibold text-foreground block">{row.publisher_name || "Unknown Publisher"}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">{row.pro || "—"}</span>
                                <span className="text-muted-foreground/30">·</span>
                                <span className="text-xs text-muted-foreground">{row.tribes_administered ? "Administered" : "Not administered"}</span>
                              </div>
                            </div>
                            <span className="text-[20px] font-bold tabular-nums text-foreground shrink-0">{row.ownership_percentage}%</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between px-4 py-3.5 bg-muted/50">
                        <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Total</span>
                        <span className={cn("text-[15px] font-bold tabular-nums", ownershipTotal === 100 ? "text-emerald-600" : "text-red-600")}>{ownershipTotal}%</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-4 py-6">
                  <p className="text-sm text-muted-foreground">No ownership records</p>
                </div>
              )
            )}
          </AppCardBody>
        </AppCard>

        {/* ─── 4. LABEL COPY ──────────────────────────── */}
        <AppCard className="mt-5">
          <AppCardHeader>
            <AppCardTitle>Controlled Label Copy</AppCardTitle>
          </AppCardHeader>
          <AppCardBody>
            {(() => {
              const year = song.metadata?.publication_year ?? null;
              const tribesPublishers = ownership
                .filter((o) => o.tribes_administered && o.publisher_name)
                .reduce((acc, o) => {
                  if (!acc.some(p => p.name === o.publisher_name)) {
                    acc.push({ name: o.publisher_name!, pro: o.pro || null });
                  }
                  return acc;
                }, [] as Array<{ name: string; pro: string | null }>);
              const labelCopy = tribesPublishers.length > 0
                ? generateLabelCopySchema(year, tribesPublishers)
                : null;
              return labelCopy ? (
                <LabelCopyDisplay text={labelCopy} />
              ) : (
                <p className="text-sm text-muted-foreground">No Tribes-administered publishers on this song.</p>
              );
            })()}
          </AppCardBody>
        </AppCard>

        {/* ─── 5. LYRICS ────────────────────────────────── */}
        {(metadata.lyrics || editing) && (
          <AppCard className="mt-5">
            <AppCardHeader>
              <div className="flex items-center justify-between w-full">
                <AppCardTitle>Lyrics</AppCardTitle>
                {metadata.lyrics && !editing && (
                  <CopyIconButton text={metadata.lyrics} successMessage="Lyrics copied to clipboard" label="Copy lyrics" />
                )}
              </div>
            </AppCardHeader>
            <AppCardBody>
              {editing ? (
                <textarea
                  ref={(el) => {
                    if (el) {
                      el.style.height = 'auto';
                      el.style.height = el.scrollHeight + 'px';
                    }
                  }}
                  value={editedFields.lyrics}
                  onChange={(e) => {
                    updateField("lyrics", e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  className={cn(editTextareaClass, "min-h-[400px] font-sans leading-relaxed overflow-hidden")}
                  placeholder="Enter lyrics…"
                />
              ) : (
                <>
                  {/* Desktop: full lyrics */}
                  <pre className="hidden md:block text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed py-1 px-1">
                    {metadata.lyrics}
                  </pre>
                  {/* Mobile: collapsible lyrics */}
                  <div className="md:hidden">
                    <div className={cn("relative", !lyricsExpanded && "max-h-[120px] overflow-hidden")}>
                      <pre className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap font-sans">{metadata.lyrics}</pre>
                      {!lyricsExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--app-surface-bg)] to-transparent" />
                      )}
                    </div>
                    <button
                      onClick={() => setLyricsExpanded(!lyricsExpanded)}
                      className="mt-2 text-sm font-medium text-primary"
                    >
                      {lyricsExpanded ? "Show less" : "Show all lyrics"}
                    </button>
                  </div>
                </>
              )}
            </AppCardBody>
          </AppCard>
        )}
      </div>
    </AppPageLayout>
  );
}
