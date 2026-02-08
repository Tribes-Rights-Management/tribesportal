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
 * Shows all metadata, writers, status, and related information for a single song.
 * Back arrow returns to /rights/catalog.
 * The slug is optional — if missing or mismatched, it's silently corrected via replaceState.
 *
 * Visual: Cardless institutional layout with border-top section separators,
 * two-column metadata grid on desktop, and left-border lyrics accent.
 */

interface SongDetail {
  id: string;
  title: string;
  metadata: Record<string, any>;
  created_at: string;
  is_active: boolean;
  iswc: string | null;
  language: string | null;
  genre: string | null;
  duration_seconds: number | null;
  release_date: string | null;
  alternate_titles: string[] | null;
}

interface EditableFields {
  title: string;
  language: string;
  is_active: boolean;
  lyrics: string;
  alternate_titles: string;
  writers: { name: string; ipi: string; split: number }[];
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

// ── Main Component ──────────────────────────────────────────
export default function SongDetailPage() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<SongDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedFields, setEditedFields] = useState<EditableFields>({
    title: "",
    language: "",
    is_active: true,
    lyrics: "",
    alternate_titles: "",
    writers: [],
  });

  const fetchSong = useCallback(async () => {
    if (!songId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("songs")
        .select(
          "id, title, metadata, created_at, is_active, iswc, language, genre, duration_seconds, release_date, alternate_titles"
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

  useEffect(() => {
    fetchSong();
  }, [fetchSong]);

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
      });
    }
  }, [editing, song]);

  const updateField = (field: keyof EditableFields, value: any) => {
    setEditedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!songId || !song) return;

    setIsSaving(true);
    try {
      const currentMetadata = (song.metadata as Record<string, any>) || {};
      const updatedMetadata = {
        ...currentMetadata,
        lyrics: editedFields.lyrics || undefined,
        writers: editedFields.writers,
      };

      const { error } = await supabase
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

      if (error) throw error;

      toast.success("Song updated");
      setEditing(false);

      // Update slug if title changed
      if (editedFields.title !== song.title) {
        const newSlug = toSlug(editedFields.title);
        window.history.replaceState(null, "", `/rights/catalog/${songId}/${newSlug}`);
      }

      await fetchSong();
    } catch (err: any) {
      console.error("Failed to save song:", err);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
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
        {/* ── Overview — two-column metadata grid ────────── */}
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

        {/* ── Songwriters ────────────────────────────────── */}
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

        {/* ── Lyrics ─────────────────────────────────────── */}
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
