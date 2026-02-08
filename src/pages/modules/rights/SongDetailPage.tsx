import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { AppPageLayout, AppSection } from "@/components/app-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * SONG DETAIL PAGE — Individual song view within Rights Catalog
 *
 * Route: /rights/catalog/:songId/:songSlug?
 * Five-section composition record:
 *   1. Overview (Title, Language, Alternate Title, Duration)
 *   2. Songwriters (metadata.writers — CRUD)
 *   3. Ownership (song_ownership table — CRUD with typeahead publisher from `publishers` table)
 *   4. Label Copy (placeholder)
 *   5. Lyrics (metadata.lyrics)
 */

interface SongDetail {
  id: string;
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

interface OwnershipRow {
  id: string;
  song_id: string;
  publisher_id: string;
  controlled: boolean;
  ownership_percentage: number;
  territory: string | null;
  notes: string | null;
  effective_from: string | null;
  effective_to: string | null;
  publisher_name: string;
  pro: string | null;
}

interface EditableOwnershipRow {
  id?: string;
  publisher_id: string;
  publisher_name: string;
  controlled: boolean;
  ownership_percentage: number;
  pro: string | null;
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
  writers: { name: string; ipi: string; split: number }[];
  ownership: EditableOwnershipRow[];
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

// ── Detail Row (supports inline editing) ────────────────────
function DetailRow({
  label,
  children,
  editing = false,
  value = "",
  onValueChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  children?: React.ReactNode;
  editing?: boolean;
  value?: string;
  onValueChange?: (val: string) => void;
  multiline?: boolean;
  type?: "text" | "date";
}) {
  return (
    <div className="py-2.5">
      <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
        {label}
      </span>
      {editing && onValueChange ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="mt-1 w-full text-[14px] text-foreground bg-transparent border border-border rounded px-2 py-1.5 min-h-[60px] resize-y focus:outline-none focus:border-primary/40 transition-colors"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="mt-1 w-full text-[14px] text-foreground bg-transparent border border-border rounded px-2 py-1 h-8 focus:outline-none focus:border-primary/40 transition-colors"
          />
        )
      ) : (
        <div className="text-[15px] text-foreground font-medium mt-0.5">{children}</div>
      )}
    </div>
  );
}

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
      className="mt-1 w-full text-[14px] text-foreground bg-transparent border border-border rounded px-2 py-1 h-8 focus:outline-none focus:border-primary/40 transition-colors"
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
        "text-[11px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-sm",
        active
          ? "text-[hsl(var(--success))] bg-[hsl(var(--success)/0.08)]"
          : "text-muted-foreground bg-muted"
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ── Section Panel ───────────────────────────────────────────
function SectionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded border border-border bg-card">
      <div className="px-5 py-3 border-b border-border bg-muted/30">
        <h2 className="text-[12px] uppercase tracking-wider font-semibold text-muted-foreground">
          {title}
        </h2>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

// ── Publisher Typeahead (searches `publishers` table) ────────
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

  // Sync external value changes
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Query publishers table on debounced search
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

  // Click-outside to close
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
        className="w-full text-[13px] text-foreground bg-transparent border border-border rounded px-2 py-1 h-8 focus:outline-none focus:border-primary/40 transition-colors"
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded shadow-sm z-10 max-h-[280px] overflow-y-auto">
          {isAdding ? (
            /* ── Inline PRO capture form ── */
            <div className="p-3 space-y-3">
              <p className="text-[13px] text-foreground font-medium">
                Adding: &quot;{search.trim()}&quot;
              </p>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                  PRO
                </label>
                <select
                  value={newEntryPro}
                  onChange={(e) => setNewEntryPro(e.target.value)}
                  className="mt-1 w-full text-[14px] text-foreground bg-transparent border border-border rounded px-2 py-1 h-8 focus:outline-none focus:border-primary/40 transition-colors"
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
                  className="text-[12px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCreate}
                  disabled={isCreating}
                  className="text-[12px] font-medium text-primary-foreground bg-foreground rounded px-3 py-1 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isCreating ? "Adding…" : "Add Publisher"}
                </button>
              </div>
            </div>
          ) : (
            /* ── Normal search results ── */
            <>
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-3 py-2 text-[14px] text-foreground hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <span>{r.name}</span>
                  {r.pro && (
                    <span className="text-[12px] text-muted-foreground ml-auto pl-2">{r.pro}</span>
                  )}
                </button>
              ))}
              {noExactMatch && search.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="w-full text-left px-3 py-2 text-[12px] text-[var(--app-focus)] hover:bg-muted/50 cursor-pointer font-medium transition-colors"
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
const ALGOLIA_SEARCH_KEY = "00c22202043b8d20f009257782838d48";
const ALGOLIA_INDEX = "writers";

// ── Main Component ──────────────────────────────────────────
export default function SongDetailPage() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<SongDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ownership, setOwnership] = useState<OwnershipRow[]>([]);
  const [writerSearchResults, setWriterSearchResults] = useState<Record<number, any[]>>({});
  const [activeWriterSearch, setActiveWriterSearch] = useState<number | null>(null);

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

  const selectWriter = (index: number, hit: any) => {
    const updated = [...editedFields.writers];
    updated[index] = {
      ...updated[index],
      name: hit.name,
      ipi: hit.ipi_number || "",
      split: updated[index].split,
    };
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
    if (!songId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("songs")
        .select(
          "id, title, metadata, created_at, is_active, iswc, ccli_song_id, language, genre, duration_seconds, release_date, alternate_titles"
        )
        .eq("id", songId)
        .single();

      if (error) throw error;
      setSong(data as SongDetail);

      // Silently update URL to include/correct slug
      const expectedPath = `/rights/catalog/${songId}/${toSlug((data as any).title)}`;
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
  }, [songId, navigate]);

  // ── Fetch ownership rows (from publishers table) ─────────
  const fetchOwnership = useCallback(async () => {
    if (!songId) return;
    try {
      const { data, error } = await supabase
        .from("song_ownership")
        .select(`
          id, song_id, publisher_id, controlled, ownership_percentage, territory, notes, effective_from, effective_to,
          publisher:publishers!song_ownership_publisher_id_fkey(id, name, pro)
        `)
        .eq("song_id", songId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const enriched: OwnershipRow[] = ((data || []) as any[]).map((o) => ({
        id: o.id,
        song_id: o.song_id,
        publisher_id: o.publisher_id,
        controlled: o.controlled,
        ownership_percentage: o.ownership_percentage,
        territory: o.territory,
        notes: o.notes,
        effective_from: o.effective_from,
        effective_to: o.effective_to,
        publisher_name: o.publisher?.name || "Unknown",
        pro: o.publisher?.pro || null,
      }));

      setOwnership(enriched);
    } catch (err: any) {
      console.error("Failed to fetch ownership:", err);
    }
  }, [songId]);


  useEffect(() => {
    fetchSong();
    fetchOwnership();
  }, [fetchSong, fetchOwnership]);

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
        writers: (metadata.writers || []).map((w: any) => ({
          name: w.name || "",
          ipi: w.ipi || "",
          split: w.split ?? 0,
        })),
        ownership: ownership.map((o) => ({
          id: o.id,
          publisher_id: o.publisher_id,
          publisher_name: o.publisher_name,
          controlled: o.controlled ?? true,
          ownership_percentage: o.ownership_percentage,
          pro: o.pro || null,
          territory: o.territory || "",
        })),
      });
    }
  }, [editing, song, ownership]);

  const updateField = (field: keyof EditableFields, value: any) => {
    setEditedFields((prev) => ({ ...prev, [field]: value }));
  };

  // ── Save handler ─────────────────────────────────────────
  const handleSave = async () => {
    if (!songId || !song) return;

    setIsSaving(true);
    try {
      // 1. Update song record
      const currentMetadata = (song.metadata as Record<string, any>) || {};
      const updatedMetadata = {
        ...currentMetadata,
        lyrics: editedFields.lyrics || undefined,
        writers: editedFields.writers,
      };

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

      // 2. Save ownership changes
      await saveOwnershipChanges();

      toast.success("Song updated");
      setEditing(false);

      // Update slug if title changed
      if (editedFields.title !== song.title) {
        const newSlug = toSlug(editedFields.title);
        window.history.replaceState(null, "", `/rights/catalog/${songId}/${newSlug}`);
      }

      await Promise.all([fetchSong(), fetchOwnership()]);
    } catch (err: any) {
      console.error("Failed to save song:", err);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const saveOwnershipChanges = async () => {
    if (!songId) return;

    const activeRows = editedFields.ownership.filter((r) => !r._deleted);
    const deletedRows = editedFields.ownership.filter((r) => r._deleted && r.id);

    // Delete removed rows
    for (const row of deletedRows) {
      await supabase.from("song_ownership").delete().eq("id", row.id!);
    }

    // Upsert active rows
    for (const row of activeRows) {
      if (!row.publisher_id) continue; // skip rows with no publisher selected

      const payload = {
        song_id: songId,
        publisher_id: row.publisher_id,
        controlled: row.controlled,
        ownership_percentage: row.ownership_percentage,
        territory: row.territory || null,
      };

      if (row.id && !row._isNew) {
        // Update existing
        await supabase
          .from("song_ownership")
          .update(payload)
          .eq("id", row.id);
      } else {
        // Insert new
        await supabase
          .from("song_ownership")
          .insert(payload);
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
  const writers: { name?: string; ipi?: string; split?: number }[] =
    metadata.writers || [];

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const displayTitle = editing ? editedFields.title || song.title : song.title;

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
            "text-[12px] uppercase tracking-wider px-3 py-1.5 rounded transition-colors",
            "text-foreground bg-primary/10 hover:bg-primary/20",
            isSaving && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      )}
      <button
        onClick={editing ? handleCancel : () => setEditing(true)}
        className="text-[12px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
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
      <div>
        {/* ─── 1. OVERVIEW ──────────────────────────────── */}
        <SectionPanel title="Overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {editing ? (
              <DetailRow
                label="Title"
                editing
                value={editedFields.title}
                onValueChange={(v) => updateField("title", v)}
              />
            ) : (
              <DetailRow label="Title">{song.title}</DetailRow>
            )}

            {(song.language || editing) && (
              <DetailRow
                label="Language"
                editing={editing}
                value={editedFields.language}
                onValueChange={(v) => updateField("language", v)}
              >
                {song.language || "—"}
              </DetailRow>
            )}

            <DetailRow
              label="Alternate Title"
              editing={editing}
              value={editedFields.alternate_titles}
              onValueChange={(v) => updateField("alternate_titles", v)}
            >
              {song.alternate_titles && song.alternate_titles.length > 0
                ? song.alternate_titles.join(", ")
                : <span className="text-muted-foreground">—</span>}
            </DetailRow>

            {song.duration_seconds != null && (
              <DetailRow label="Duration">
                {formatDuration(song.duration_seconds)}
              </DetailRow>
            )}
          </div>
        </SectionPanel>

        {/* ─── 2. SONGWRITERS ───────────────────────────── */}
        <SectionPanel title="Songwriters">
          {editing ? (
            <div className="space-y-3">
              {/* Column headers for edit mode */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Writer</span>
                </div>
                <div className="w-[140px]">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">IPI Number</span>
                </div>
                <div className="w-[70px]">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Share %</span>
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
                      className="w-full text-[14px] text-foreground bg-transparent border border-border rounded px-2 py-1 h-8 focus:outline-none focus:border-primary/40 transition-colors"
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
                            <span className="font-medium text-[13px] text-foreground">{hit.name}</span>
                            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                              {hit.pro || "—"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-[140px]">
                    <input
                      value={writer.ipi}
                      readOnly
                      tabIndex={-1}
                      placeholder="—"
                      className="w-full text-[12px] text-muted-foreground bg-muted/40 border border-border rounded px-2 py-1 h-8 font-mono cursor-not-allowed"
                    />
                  </div>
                  <div className="w-[70px]">
                    <input
                      type="number"
                      value={writer.split}
                      onChange={(e) => {
                        const updated = [...editedFields.writers];
                        updated[index] = { ...updated[index], split: Number(e.target.value) };
                        updateField("writers", updated);
                      }}
                      placeholder="%"
                      className="w-full text-[12px] text-foreground bg-transparent border border-border rounded px-2 py-1 h-8 text-right focus:outline-none focus:border-primary/40 transition-colors"
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
                    <span className="text-[14px]">×</span>
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const updated = [...editedFields.writers, { name: "", ipi: "", split: 0 }];
                  updateField("writers", updated);
                }}
                className="text-[12px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                + Add Writer
              </button>
            </div>
          ) : (
            writers.length > 0 ? (
              <div>
                {/* Column headers */}
                <div className="flex items-center justify-between pb-2 mb-1 border-b border-border">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Writer</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground w-[120px] text-right">IPI Number</span>
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground w-[50px] text-right">Share</span>
                  </div>
                </div>
                {/* Writer rows */}
                <div className="divide-y divide-border">
                  {writers.map((writer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2.5"
                    >
                      <span className="text-[15px] text-foreground font-medium">
                        {writer.name || "Unknown"}
                      </span>
                      <div className="flex items-center gap-4">
                        {writer.ipi && (
                          <span className="text-[13px] text-muted-foreground font-mono w-[120px] text-right">
                            {writer.ipi}
                          </span>
                        )}
                        {writer.split != null && (
                          <span className="text-[13px] text-muted-foreground w-[50px] text-right">
                            {writer.split}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground/50">No songwriters added</p>
            )
          )}
        </SectionPanel>

        {/* ─── 3. OWNERSHIP ─────────────────────────────── */}
        <SectionPanel title="Ownership">
          {editing ? (
            <div className="space-y-3">
              {/* Column headers */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Publisher</span>
                </div>
                <div className="w-[100px]">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">PRO</span>
                </div>
                <div className="w-[100px]">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Controlled</span>
                </div>
                <div className="w-[70px]">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Share %</span>
                </div>
                <div className="w-[22px]" />
              </div>
              {editedFields.ownership
                .map((row, index) => ({ row, index }))
                .filter(({ row }) => !row._deleted)
                .map(({ row, index }) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <PublisherTypeahead
                        value={row.publisher_name}
                        onChange={(publisherId, name, pro) => {
                          const updated = [...editedFields.ownership];
                          updated[index] = { ...updated[index], publisher_id: publisherId, publisher_name: name, pro: pro || null };
                          updateField("ownership", updated);
                        }}
                        placeholder="Type to search publishers…"
                      />
                    </div>
                    <div className="w-[100px]">
                      <span className="text-[12px] text-muted-foreground px-2 py-1 h-8 flex items-center">
                        {row.pro || "—"}
                      </span>
                    </div>
                    <div className="w-[100px]">
                      <select
                        value={row.controlled ? "yes" : "no"}
                        onChange={(e) => {
                          const updated = [...editedFields.ownership];
                          updated[index] = { ...updated[index], controlled: e.target.value === "yes" };
                          updateField("ownership", updated);
                        }}
                        className="w-full text-[14px] text-foreground bg-transparent border border-border rounded px-2 py-1 h-8 focus:outline-none focus:border-primary/40 transition-colors"
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
                        className="w-full text-[12px] text-foreground bg-transparent border border-border rounded px-2 py-1 h-8 text-right focus:outline-none focus:border-primary/40 transition-colors"
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
                      <span className="text-[14px]">×</span>
                    </button>
                  </div>
                ))}
              {/* Total row */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="flex-1 text-right">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total</span>
                </div>
                <div className="w-[100px]" />
                <div className="w-[100px]" />
                <div className="w-[70px]">
                  <span className={cn(
                    "text-[13px] font-semibold block text-right pr-2",
                    ownershipTotal === 100 ? "text-[hsl(var(--success))]" : "text-destructive"
                  )}>
                    {ownershipTotal}%
                  </span>
                </div>
                <div className="w-[22px]" />
              </div>
              <button
                onClick={() => {
                  const updated = [...editedFields.ownership, {
                    publisher_id: "",
                    publisher_name: "",
                    controlled: true,
                    ownership_percentage: 0,
                    pro: null,
                    territory: "",
                    _isNew: true,
                  }];
                  updateField("ownership", updated);
                }}
                className="text-[12px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                + Add Ownership
              </button>
            </div>
          ) : (
            ownership.length > 0 ? (
              <div>
                {/* Column headers */}
                <div className="flex items-center justify-between pb-2 mb-1 border-b border-border">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Publisher</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground w-[80px] text-center">PRO</span>
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground w-[100px] text-center">Controlled</span>
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground w-[60px] text-right">Percentage</span>
                  </div>
                </div>
                {/* Ownership rows */}
                <div className="divide-y divide-border">
                  {ownership.map((row) => (
                    <div key={row.id} className="flex items-center justify-between py-2.5">
                      <span className="text-[15px] text-foreground font-medium">
                        {row.publisher_name || "Unknown Publisher"}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] text-muted-foreground w-[80px] text-center">
                          {row.pro || "—"}
                        </span>
                        <span className="text-[13px] text-muted-foreground w-[100px] text-center">
                          {row.controlled ? "Yes" : "No"}
                        </span>
                        <span className="text-[13px] text-muted-foreground w-[60px] text-right">
                          {row.ownership_percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Total row */}
                <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-border">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total</span>
                  <div className="flex items-center gap-4">
                    <span className="w-[80px]" />
                    <span className="w-[100px]" />
                    <span className={cn(
                      "text-[13px] font-semibold w-[60px] text-right",
                      ownershipTotal === 100 ? "text-[hsl(var(--success))]" : "text-destructive"
                    )}>
                      {ownershipTotal}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground/50">No ownership records</p>
            )
          )}
        </SectionPanel>

        {/* ─── 4. LABEL COPY (placeholder) ──────────────── */}
        <SectionPanel title="Label Copy">
          <p className="text-[13px] text-muted-foreground/50">No label copy information</p>
        </SectionPanel>

        {/* ─── 5. LYRICS ────────────────────────────────── */}
        {(metadata.lyrics || editing) && (
          <SectionPanel title="Lyrics">
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
                className="w-full text-[13px] text-foreground bg-transparent border border-border rounded px-3 py-2 min-h-[400px] resize-y focus:outline-none focus:border-primary/40 transition-colors font-sans leading-relaxed overflow-hidden"
                placeholder="Enter lyrics…"
              />
            ) : (
              <pre className="text-[14px] text-foreground/90 whitespace-pre-wrap font-sans leading-relaxed">
                {metadata.lyrics}
              </pre>
            )}
          </SectionPanel>
        )}

        {/* Bottom breathing room */}
        <div className="pb-8" />
      </div>
    </AppPageLayout>
  );
}
