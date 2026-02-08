import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { AppPageLayout, AppSection } from "@/components/app-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * SONG DETAIL PAGE — Individual song view within Rights Catalog
 *
 * Route: /rights/catalog/:songId/:songSlug?
 * Five-section composition record:
 *   1. Overview (Title, Language, Alternate Title, Duration, CCLI Song ID)
 *   2. Songwriters (metadata.writers — CRUD)
 *   3. Ownership (song_ownership table — CRUD with publisher/administrator)
 *   4. Registration & Identifiers (ISWC + CCLI Song ID — read-only reference)
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
  administrator_id: string | null;
  ownership_percentage: number;
  territory: string | null;
  notes: string | null;
  effective_from: string | null;
  effective_to: string | null;
  publisher?: { id: string; name: string };
  administrator?: { id: string; name: string } | null;
}

interface EditableOwnershipRow {
  id?: string;
  publisher_id: string;
  publisher_name: string;
  administrator_id: string;
  administrator_name: string;
  ownership_percentage: number;
  territory: string;
  _isNew?: boolean;
  _deleted?: boolean;
}

interface PublisherOption {
  id: string;
  name: string;
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

// ── Publisher Select ────────────────────────────────────────
function PublisherSelect({
  value,
  publishers,
  onChange,
  placeholder = "Select publisher…",
}: {
  value: string;
  publishers: PublisherOption[];
  onChange: (id: string, name: string) => void;
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const pub = publishers.find((p) => p.id === e.target.value);
        onChange(e.target.value, pub?.name || "");
      }}
      className="w-full text-[13px] text-foreground bg-transparent border border-border rounded px-2 py-1 h-8 focus:outline-none focus:border-primary/40 transition-colors"
    >
      <option value="">{placeholder}</option>
      {publishers.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function SongDetailPage() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<SongDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ownership, setOwnership] = useState<OwnershipRow[]>([]);
  const [publishers, setPublishers] = useState<PublisherOption[]>([]);
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

  // ── Fetch ownership rows ─────────────────────────────────
  const fetchOwnership = useCallback(async () => {
    if (!songId) return;
    try {
      const { data, error } = await supabase
        .from("song_ownership")
        .select(
          "id, song_id, publisher_id, administrator_id, ownership_percentage, territory, notes, effective_from, effective_to, publisher:publishers!song_ownership_publisher_id_fkey(id, name), administrator:publishers!song_ownership_administrator_id_fkey(id, name)"
        )
        .eq("song_id", songId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setOwnership((data || []) as unknown as OwnershipRow[]);
    } catch (err: any) {
      console.error("Failed to fetch ownership:", err);
    }
  }, [songId]);

  // ── Fetch publishers for dropdowns ───────────────────────
  const fetchPublishers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("publishers")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setPublishers(data || []);
    } catch (err: any) {
      console.error("Failed to fetch publishers:", err);
    }
  }, []);

  useEffect(() => {
    fetchSong();
    fetchOwnership();
  }, [fetchSong, fetchOwnership]);

  // Fetch publishers when entering edit mode
  useEffect(() => {
    if (editing) {
      fetchPublishers();
    }
  }, [editing, fetchPublishers]);

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
        writers: metadata.writers || [],
        ownership: ownership.map((o) => ({
          id: o.id,
          publisher_id: o.publisher_id,
          publisher_name: o.publisher?.name || "",
          administrator_id: o.administrator_id || "",
          administrator_name: o.administrator?.name || "",
          ownership_percentage: o.ownership_percentage,
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
        administrator_id: row.administrator_id || null,
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
                  <div className="flex-1">
                    <input
                      value={writer.name}
                      onChange={(e) => {
                        const updated = [...editedFields.writers];
                        updated[index] = { ...updated[index], name: e.target.value };
                        updateField("writers", updated);
                      }}
                      placeholder="Writer name"
                      className="w-full text-[14px] text-foreground bg-transparent border border-border rounded px-2 py-1 h-8 focus:outline-none focus:border-primary/40 transition-colors"
                    />
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
                <div className="flex-1">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Administrator</span>
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
                      <PublisherSelect
                        value={row.publisher_id}
                        publishers={publishers}
                        onChange={(id, name) => {
                          const updated = [...editedFields.ownership];
                          updated[index] = { ...updated[index], publisher_id: id, publisher_name: name };
                          updateField("ownership", updated);
                        }}
                        placeholder="Select publisher…"
                      />
                    </div>
                    <div className="flex-1">
                      <PublisherSelect
                        value={row.administrator_id}
                        publishers={publishers}
                        onChange={(id, name) => {
                          const updated = [...editedFields.ownership];
                          updated[index] = { ...updated[index], administrator_id: id, administrator_name: name };
                          updateField("ownership", updated);
                        }}
                        placeholder="Select administrator…"
                      />
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
                <div className="flex-1" />
                <div className="flex-1 text-right">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total</span>
                </div>
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
                    administrator_id: "",
                    administrator_name: "",
                    ownership_percentage: 0,
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
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground w-[160px] text-right">Administrator</span>
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground w-[60px] text-right">Share</span>
                  </div>
                </div>
                {/* Ownership rows */}
                <div className="divide-y divide-border">
                  {ownership.map((row) => (
                    <div key={row.id} className="flex items-center justify-between py-2.5">
                      <span className="text-[15px] text-foreground font-medium">
                        {row.publisher?.name || "Unknown Publisher"}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] text-muted-foreground w-[160px] text-right">
                          {row.administrator?.name || <span className="text-muted-foreground/50">—</span>}
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
                    <span className="w-[160px]" />
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

        {/* ─── 4. REGISTRATION & IDENTIFIERS ────────────── */}
        <SectionPanel title="Registration & Identifiers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <DetailRow label="ISWC">
              {song.iswc ? (
                <span className="font-mono">{song.iswc}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailRow>
            <DetailRow label="CCLI Song ID">
              {song.ccli_song_id ? (
                <span className="font-mono">{song.ccli_song_id}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailRow>
          </div>
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
