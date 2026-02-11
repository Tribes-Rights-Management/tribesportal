import { useState, useEffect } from "react";
import { generateLabelCopyFromQueueData } from "@/utils/generateLabelCopy";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  AppPageLayout,
  AppButton,
  AppCard,
  AppCardBody,
  AppSection,
  AppDetailRow,
  AppDetailRowGroup,
  AppSelect,
} from "@/components/app-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { QueueStatusBadge } from "@/components/queue/QueueStatusBadge";
import { QueueStatusControl } from "@/components/queue/QueueStatusControl";
import { QueueMessageThread } from "@/components/queue/QueueMessageThread";
import { useQueueItem, useUpdateQueueStatus } from "@/hooks/use-song-queue";
import { useQueueMessages } from "@/hooks/use-queue-messages";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const capitalize = (val: string | undefined | null) =>
  val ? val.charAt(0).toUpperCase() + val.slice(1) : "—";

/* ── Inline Publisher Search ─────────────────────────────────── */
function AddPublisherInline({ onAdd }: { onAdd: (pub: any) => void }) {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [share, setShare] = useState("");
  const [tribesAdmin, setTribesAdmin] = useState(true);

  const searchPublishers = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    const { data } = await supabase
      .from("publishers")
      .select("id, name, pro")
      .ilike("name", `%${q}%`)
      .limit(5);
    setResults(data || []);
  };

  const selectPublisher = (pub: any) => {
    onAdd({
      publisher_id: pub.id,
      name: pub.name,
      pro: pub.pro,
      share: parseFloat(share) || 0,
      tribes_administered: tribesAdmin,
    });
    setQuery(""); setResults([]); setShare(""); setSearching(false);
  };

  if (!searching) {
    return (
      <button className="text-[12px] text-primary hover:underline" onClick={() => setSearching(true)}>
        + Add Publisher
      </button>
    );
  }

  return (
    <div className="space-y-2 p-3 border border-border rounded-md bg-background">
      <input
        className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
        placeholder="Search publishers..."
        value={query}
        onChange={(e) => searchPublishers(e.target.value)}
        autoFocus
      />
      {results.length > 0 && (
        <div className="border border-border rounded-md overflow-hidden">
          {results.map((r) => (
            <button
              key={r.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between"
              onClick={() => selectPublisher(r)}
            >
              <span>{r.name}</span>
              <span className="text-muted-foreground text-xs">{r.pro}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <div className="w-[100px]">
          <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Share %</label>
          <input
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
            type="number"
            value={share}
            onChange={(e) => setShare(e.target.value)}
            placeholder="50"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Administrator</label>
          <AppSelect
            value={tribesAdmin ? "tribes" : "other"}
            onChange={(val) => setTribesAdmin(val === "tribes")}
            options={[
              { value: "tribes", label: "Tribes" },
              { value: "other", label: "Other" },
            ]}
            className="min-w-[120px]"
          />
        </div>
      </div>
      <button className="text-[12px] text-muted-foreground hover:underline" onClick={() => setSearching(false)}>Cancel</button>
    </div>
  );
}

/**
 * RIGHTS QUEUE DETAIL PAGE — Staff view of a single queue item
 */
export default function RightsQueueDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading, refetch } = useQueueItem(submissionId);
  const { data: messages = [] } = useQueueMessages(item?.id);
  const updateStatus = useUpdateQueueStatus();
  const [adminNotes, setAdminNotes] = useState("");
  const [notesEditing, setNotesEditing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  // Publisher editing state
  const [isEditingPublishers, setIsEditingPublishers] = useState(false);
  const [editableWriters, setEditableWriters] = useState<any[]>([]);

  // Fetch all active deals
  const { data: deals } = useQuery({
    queryKey: ['deals-for-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, name, deal_number, territory, territory_mode, writer_id, writer_share, writers(id, name, pro, ipi_number), deal_publishers(*, publishers:publisher_id(id, name, pro, ipi_number))')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const selectedDeal = deals?.find((d: any) => d.id === selectedDealId) || null;

  // Load deal_id from queue item
  useEffect(() => {
    if (item?.deal_id) {
      setSelectedDealId(item.deal_id);
    }
  }, [item?.deal_id]);

  const handleDealSelect = async (dealId: string | null) => {
    setSelectedDealId(dealId);
    if (item?.id) {
      await (supabase as any)
        .from('song_queue')
        .update({ deal_id: dealId })
        .eq('id', item.id);
    }
  };

  if (isLoading) {
    return (
      <AppPageLayout title="Loading..." backLink={{ to: "/rights/queue", label: "Back to Queue" }}>
        <div className="py-12 text-center text-muted-foreground text-sm">Loading...</div>
      </AppPageLayout>
    );
  }

  if (!item) {
    return (
      <AppPageLayout title="Not Found" backLink={{ to: "/rights/queue", label: "Back to Queue" }}>
        <div className="py-12 text-center text-muted-foreground text-sm">Queue item not found.</div>
      </AppPageLayout>
    );
  }

  const songData = item.current_data || item.submitted_data || {};
  const writers = songData.writers || [];
  const title = songData.title || "Untitled";

  const startEditing = () => {
    setEditData({ ...songData });
    setIsEditing(true);
  };

  const saveEdits = async () => {
    setIsSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("song_queue")
        .update({
          current_data: editData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;
      toast.success("Changes saved");
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = () => {
    updateStatus.mutate(
      { queueId: item.id, status: item.status, notes: adminNotes },
      {
        onSuccess: () => { toast.success("Notes saved"); setNotesEditing(false); refetch(); },
        onError: (err) => toast.error(`Failed: ${err.message}`),
      }
    );
  };

  const editField = (key: string, label: string) => (
    <div key={key}>
      <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
      <input
        className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
        value={editData?.[key] || ""}
        onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
      />
    </div>
  );

  // Publisher handlers
  const handlePublisherChange = (wIndex: number, pIndex: number, field: string, value: any) => {
    setEditableWriters(prev => {
      const updated = [...prev];
      updated[wIndex] = { ...updated[wIndex], publishers: [...updated[wIndex].publishers] };
      updated[wIndex].publishers[pIndex] = { ...updated[wIndex].publishers[pIndex], [field]: value };
      return updated;
    });
  };

  const handleAddPublisher = (wIndex: number, pub: any) => {
    setEditableWriters(prev => {
      const updated = [...prev];
      updated[wIndex] = {
        ...updated[wIndex],
        publishers: [...(updated[wIndex].publishers || []), pub],
      };
      return updated;
    });
  };

  const handleRemovePublisher = (wIndex: number, pIndex: number) => {
    setEditableWriters(prev => {
      const updated = [...prev];
      updated[wIndex] = {
        ...updated[wIndex],
        publishers: updated[wIndex].publishers.filter((_: any, i: number) => i !== pIndex),
      };
      return updated;
    });
  };

  const handleSavePublishers = async () => {
    for (const writer of editableWriters) {
      const total = (writer.publishers || []).reduce((sum: number, p: any) => sum + (p.share || 0), 0);
      if (writer.publishers?.length > 0 && total !== writer.split) {
        toast.error(`Publisher shares for ${writer.name} must equal ${writer.split}%`);
        return;
      }
    }

    const currentData = { ...songData };
    currentData.writers = currentData.writers.map((w: any, i: number) => ({
      ...w,
      publishers: editableWriters[i]?.publishers || [],
    }));

    const { error } = await (supabase as any)
      .from("song_queue")
      .update({ current_data: currentData, updated_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) {
      toast.error("Failed to save publishers");
      return;
    }

    toast.success("Publishers saved");
    setIsEditingPublishers(false);
    refetch();
  };

  const startEditingPublishers = () => {
    const w = songData?.writers || [];
    setEditableWriters(w.map((wr: any) => ({
      ...wr,
      publishers: wr.publishers ? [...wr.publishers.map((p: any) => ({ ...p }))] : [],
    })));
    setIsEditingPublishers(true);
  };

  return (
    <AppPageLayout
      title={title}
      backLink={{ to: "/rights/queue", label: "Back to Queue" }}
      action={<QueueStatusBadge status={item.status} />}
    >
      <p className="text-[13px] text-muted-foreground -mt-2 mb-6">
        Submitted by {item.client_name} · {format(new Date(item.submitted_at), "MMM d, yyyy")}
      </p>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Song Details</TabsTrigger>
          <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="space-y-4">
            {/* Song Details Card */}
            <AppCard>
              <AppCardBody>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Song Details</h3>
                  {!isEditing ? (
                    <AppButton size="sm" variant="ghost" onClick={startEditing}>Edit</AppButton>
                  ) : (
                    <div className="flex gap-2">
                      <AppButton size="sm" onClick={saveEdits} loading={isSaving}>Save</AppButton>
                      <AppButton size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</AppButton>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    {editField("title", "Title")}
                    {editField("language", "Language")}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Song Type</label>
                      <AppSelect
                        value={editData?.song_type || ""}
                        onChange={(val) => setEditData({ ...editData, song_type: val })}
                        options={[
                          { value: "original", label: "Original" },
                          { value: "instrumental", label: "Instrumental" },
                          { value: "public_domain", label: "Public Domain" },
                          { value: "original_adaptation", label: "Original Adaptation" },
                          { value: "derivative", label: "Derivative Work" },
                          { value: "medley_mashup", label: "Medley/Mashup" },
                        ]}
                        fullWidth
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Release Status</label>
                      <AppSelect
                        value={editData?.release_status || ""}
                        onChange={(val) => setEditData({ ...editData, release_status: val })}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                        fullWidth
                      />
                    </div>
                    {editField("publication_year", "Publication Year")}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Copyright Status</label>
                      <AppSelect
                        value={editData?.copyright_status || ""}
                        onChange={(val) => setEditData({ ...editData, copyright_status: val })}
                        options={[
                          { value: "registered", label: "Registered" },
                          { value: "pending", label: "Pending" },
                          { value: "unknown", label: "Unknown" },
                          { value: "unregistered", label: "Unregistered" },
                        ]}
                        fullWidth
                      />
                    </div>
                  </div>
                ) : (
                  <AppDetailRowGroup>
                    <AppDetailRow label="Title" value={title} />
                    <AppDetailRow label="Alternate Title" value={
                      songData.alternate_titles?.length > 0 ? songData.alternate_titles.join(", ") : "—"
                    } />
                    <AppDetailRow label="Language" value={songData.language || "—"} />
                    <AppDetailRow label="Song Type" value={capitalize(songData.song_type)} />
                    <AppDetailRow label="Release Status" value={capitalize(songData.release_status)} />
                    <AppDetailRow label="Publication Year" value={songData.publication_year || songData.creation_year || "—"} />
                    <AppDetailRow label="Copyright Status" value={capitalize(songData.copyright_status)} />
                    <AppDetailRow label="Chord Chart" value={
                      songData.chord_chart_path ? (
                        <button
                          className="text-sm text-primary hover:underline cursor-pointer"
                          onClick={async () => {
                            const { data } = await supabase.storage
                              .from("song-documents")
                              .createSignedUrl(songData.chord_chart_path, 60);
                            if (data?.signedUrl) {
                              window.open(data.signedUrl, "_blank");
                            }
                          }}
                        >
                          {songData.chord_chart_file || "Download"}
                        </button>
                      ) : songData.has_chord_chart ? "Yes (not uploaded)" : "No"
                    } />
                  </AppDetailRowGroup>
                )}
              </AppCardBody>
            </AppCard>

            {/* Writers */}
            <AppCard>
              <AppCardBody>
                <h3 className="text-sm font-medium mb-3">Songwriters</h3>
                {writers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No writers listed.</p>
                ) : (
                  <div className="space-y-2">
                    {writers.map((w: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div>
                          <span className="text-[13px] font-medium">{w.name}</span>
                          <span className="text-[12px] text-muted-foreground ml-2">
                            {w.credit === "both" ? "Writer & Composer" : w.credit === "writer" ? "Writer" : "Composer"}
                          </span>
                          {w.pro && (
                            <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-2">{w.pro}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                          <span>{w.split}%</span>
                          <span>{w.tribes_administered ? "Tribes" : "Other"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AppCardBody>
            </AppCard>

            {/* Publishing & Administration */}
            {!isEditingPublishers ? (
              <AppCard>
                <AppCardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Publishing & Administration</h3>
                    <button onClick={startEditingPublishers} className="text-xs text-primary hover:underline">Edit</button>
                  </div>
                  {writers.map((writer: any, wIndex: number) => (
                    <div key={wIndex} className="mb-5 last:mb-0">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{writer.name}</span>
                          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{writer.pro || "—"}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{writer.split}%</span>
                      </div>
                      {writer.publishers && writer.publishers.length > 0 ? (
                        <div className="pl-4 space-y-1.5">
                          {writer.publishers.map((pub: any, pIndex: number) => (
                            <div key={pIndex} className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{pub.name}</span>
                                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{pub.pro || "—"}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm">{pub.share}%</span>
                                {pub.tribes_administered && (
                                  <span className="text-[11px] text-muted-foreground font-medium">Tribes</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {writer.publishers.length > 1 && (
                            <div className="flex justify-end pt-1 border-t border-border/30">
                              <span className={`text-[11px] ${
                                writer.publishers.reduce((sum: number, p: any) => sum + (p.share || 0), 0) === writer.split
                                  ? 'text-muted-foreground'
                                  : 'text-destructive font-medium'
                              }`}>
                                Total: {writer.publishers.reduce((sum: number, p: any) => sum + (p.share || 0), 0)}% of {writer.split}%
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="pl-4">
                          <p className="text-sm text-muted-foreground italic">No publishers assigned</p>
                        </div>
                      )}
                    </div>
                  ))}
                </AppCardBody>
              </AppCard>
            ) : (
              <AppCard>
                <AppCardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Publishing & Administration</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={handleSavePublishers} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90">Save</button>
                      <button onClick={() => setIsEditingPublishers(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                    </div>
                  </div>
                  {editableWriters.map((writer: any, wIndex: number) => (
                    <div key={wIndex} className="mb-6 last:mb-0">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{writer.name}</span>
                          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{writer.pro || "—"}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{writer.split}%</span>
                      </div>
                      <div className="pl-4 space-y-3">
                        {(writer.publishers || []).map((pub: any, pIndex: number) => (
                          <div key={pIndex} className="flex items-center justify-between py-1.5 bg-muted/30 rounded px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{pub.name}</span>
                              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{pub.pro || "—"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                              <span>{pub.share}%</span>
                              <span>{pub.tribes_administered ? "Tribes" : "Other"}</span>
                              <button
                                className="text-destructive hover:text-destructive/80 text-xs"
                                onClick={() => handleRemovePublisher(wIndex, pIndex)}
                              >×</button>
                            </div>
                          </div>
                        ))}
                        <AddPublisherInline onAdd={(pub) => handleAddPublisher(wIndex, pub)} />
                        {(writer.publishers || []).length > 0 && (() => {
                          const total = (writer.publishers || []).reduce((sum: number, p: any) => sum + (p.share || 0), 0);
                          const match = total === writer.split;
                          return (
                            <div className={`text-[11px] text-right ${match ? 'text-muted-foreground' : 'text-destructive font-medium'}`}>
                              Publisher total: {total}% {!match && `(must equal ${writer.split}%)`}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </AppCardBody>
              </AppCard>
            )}

            {/* Controlled Label Copy — auto-generated preview */}
            {(() => {
              const labelCopy = generateLabelCopyFromQueueData(songData);
              return (
                <AppCard>
                  <AppCardBody>
                    <h3 className="text-sm font-medium mb-3">Controlled Label Copy</h3>
                    {labelCopy ? (
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-[13px] text-foreground leading-relaxed">{labelCopy}</p>
                        <AppButton
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(labelCopy);
                            toast.success("Label copy copied to clipboard");
                          }}
                        >
                          Copy
                        </AppButton>
                      </div>
                    ) : (
                      <p className="text-[12px] text-muted-foreground italic">
                        Add Tribes-administered publishers to auto-generate label copy.
                      </p>
                    )}
                  </AppCardBody>
                </AppCard>
              );
            })()}

            {/* Lyrics */}
            {(songData.lyrics || songData.lyrics_sections?.length > 0) && (
              <AppCard>
                <AppCardBody>
                  <h3 className="text-sm font-medium mb-3">Lyrics</h3>
                  <pre className="text-[13px] text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-[400px] overflow-y-auto">
                    {songData.lyrics_sections?.length > 0
                      ? songData.lyrics_sections.map((s: any) => `[${s.type?.toUpperCase()}]\n${s.content}`).join("\n\n")
                      : songData.lyrics
                    }
                  </pre>
                </AppCardBody>
              </AppCard>
            )}

            {/* Admin Notes */}
            <AppCard>
              <AppCardBody>
                <h3 className="text-sm font-medium mb-2">Admin Notes (internal only)</h3>
                {notesEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Internal notes..."
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <AppButton size="sm" onClick={handleSaveNotes} loading={updateStatus.isPending}>Save</AppButton>
                      <AppButton size="sm" variant="ghost" onClick={() => setNotesEditing(false)}>Cancel</AppButton>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[13px] text-muted-foreground whitespace-pre-wrap">
                      {item.admin_notes || "No notes yet."}
                    </p>
                    <AppButton size="sm" variant="ghost" className="mt-2" onClick={() => { setAdminNotes(item.admin_notes || ""); setNotesEditing(true); }}>
                      Edit Notes
                    </AppButton>
                  </div>
                )}
              </AppCardBody>
            </AppCard>

            {/* Deal Association */}
            <div className="rounded-lg border border-border bg-card p-4">
              <label className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground block mb-2">
                Associated Deal
              </label>
              <AppSelect
                value={selectedDealId || ''}
                onChange={(val) => handleDealSelect(val || null)}
                options={[
                  { value: '', label: 'No deal selected' },
                  ...(deals || []).map((deal: any) => ({
                    value: deal.id,
                    label: `${deal.name} — ${deal.writers?.name || 'Unknown'} (${deal.territory || 'World'})`,
                  })),
                ]}
                fullWidth
              />
              {selectedDeal && (
                <div className="mt-3 p-3 rounded-md bg-muted/30 border border-border/50 space-y-1">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Writer:</span>{' '}
                    <span className="font-medium">{selectedDeal.writers?.name}</span>
                    {selectedDeal.writers?.pro && (
                      <span className="text-muted-foreground"> ({selectedDeal.writers.pro})</span>
                    )}
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Territory:</span>{' '}
                    <span className="font-medium">{selectedDeal.territory || 'World'}</span>
                  </div>
                  {selectedDeal.deal_publishers?.length > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Publishers:</span>{' '}
                      <span className="font-medium">
                        {selectedDeal.deal_publishers.map((dp: any) => dp.publisher_name || dp.publishers?.name).filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Controls */}
            <AppSection spacing="md">
              <QueueStatusControl queueId={item.id} currentStatus={item.status} songData={songData} onStatusChange={() => refetch()} />
            </AppSection>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <AppCard>
            <AppCardBody>
              <QueueMessageThread queueId={item.id} viewerRole="staff" />
            </AppCardBody>
          </AppCard>
        </TabsContent>

        <TabsContent value="history">
          <AppCard>
            <AppCardBody>
              <div className="space-y-3 text-[13px]">
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{format(new Date(item.submitted_at), "MMM d, yyyy h:mm a")}</span>
                </div>
                {item.revision_requested_at && (
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Revision Requested</span>
                    <span>{format(new Date(item.revision_requested_at), "MMM d, yyyy h:mm a")}</span>
                  </div>
                )}
                {item.reviewed_at && (
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Reviewed</span>
                    <span>{format(new Date(item.reviewed_at), "MMM d, yyyy h:mm a")}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{format(new Date(item.updated_at), "MMM d, yyyy h:mm a")}</span>
                </div>
              </div>
            </AppCardBody>
          </AppCard>
        </TabsContent>
      </Tabs>
    </AppPageLayout>
  );
}
