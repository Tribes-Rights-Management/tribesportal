import { useState, useEffect, useMemo } from "react";
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

  // Per-writer deal selection state
  const [writerDealMap, setWriterDealMap] = useState<Record<string, string>>({});

  // Extract writer IDs from submission data for deal filtering
  const submittedWriterIds = useMemo(() => {
    const w = item?.current_data?.writers || item?.submitted_data?.writers || [];
    return w.map((wr: any) => wr.id).filter(Boolean) as string[];
  }, [item?.current_data, item?.submitted_data]);

  // Fetch active deals filtered by submitted writers
  const { data: availableDeals } = useQuery({
    queryKey: ['deals-for-queue', submittedWriterIds],
    queryFn: async () => {
      if (submittedWriterIds.length === 0) return [];
      const { data, error } = await supabase
        .from('deals')
        .select('id, name, deal_number, territory, territory_mode, writer_id, writer_share, writers(id, name, pro, ipi_number), deal_publishers(*, publishers:publisher_id(id, name, pro, ipi_number))')
        .in('writer_id', submittedWriterIds)
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: submittedWriterIds.length > 0,
  });

  // Helper: get deals for a specific writer
  const getDealsForWriter = (writerId: string) =>
    availableDeals?.filter((d: any) => d.writer_id === writerId) || [];

  // Get the full deal object for a writer
  const getDealForWriter = (writerId: string) => {
    const dealId = writerDealMap[writerId];
    if (!dealId) return null;
    return availableDeals?.find((d: any) => d.id === dealId) || null;
  };

  // Load deal_id from queue item
  useEffect(() => {
    if (item?.deal_id && availableDeals) {
      const deal = availableDeals.find((d: any) => d.id === item.deal_id);
      if (deal) {
        setWriterDealMap(prev => ({ ...prev, [deal.writer_id]: deal.id }));
      }
    }
  }, [item?.deal_id, availableDeals]);

  const handleSelectDeal = async (writerId: string, dealId: string) => {
    if (dealId === 'none') return;
    setWriterDealMap(prev => ({ ...prev, [writerId]: dealId }));
    if (item?.id) {
      await (supabase as any)
        .from('song_queue')
        .update({ deal_id: dealId })
        .eq('id', item.id);
    }
  };

  const handleRemoveDeal = async (writerId: string) => {
    setWriterDealMap(prev => {
      const next = { ...prev };
      delete next[writerId];
      return next;
    });
    if (item?.id) {
      await (supabase as any)
        .from('song_queue')
        .update({ deal_id: null })
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

            {/* Publishing & Administration — Deal-based */}
            <AppCard>
              <AppCardBody>
                <h3 className="text-sm font-medium mb-4">Publishing & Administration</h3>
                {writers.map((writer: any, wIndex: number) => {
                  const writerDeals = writer.id ? getDealsForWriter(writer.id) : [];
                  const writerDeal = writer.id ? getDealForWriter(writer.id) : null;

                  return (
                    <div key={wIndex} className="mb-5 last:mb-0">
                      {/* Writer header */}
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{writer.name}</span>
                          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{writer.pro || "—"}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{writer.split}%</span>
                      </div>

                      {/* Deal selector or deal display */}
                      <div className="pl-4 mt-2">
                        {!writerDeal ? (
                          <div>
                            {!writer.id ? (
                              <p className="text-xs text-muted-foreground italic">Writer not linked to database record.</p>
                            ) : writerDeals.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No active deals for this writer.</p>
                            ) : (
                              <AppSelect
                                value="none"
                                onChange={(val) => handleSelectDeal(writer.id, val)}
                                options={[
                                  { value: 'none', label: 'Select a deal...' },
                                  ...writerDeals.map((deal: any) => ({
                                    value: deal.id,
                                    label: `${deal.name} — ${deal.territory || 'World'}`,
                                  })),
                                ]}
                                fullWidth
                              />
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Deal header with remove */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Deal: <span className="font-medium text-foreground">{writerDeal.name}</span>
                                {writerDeal.territory && (
                                  <span className="ml-2 text-muted-foreground">({writerDeal.territory})</span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDeal(writer.id)}
                                className="text-xs text-muted-foreground hover:text-destructive"
                              >
                                Remove
                              </button>
                            </div>
                            {/* Publishers from deal — read-only */}
                            {writerDeal.deal_publishers?.length > 0 ? (
                              writerDeal.deal_publishers.map((dp: any, dpIndex: number) => (
                                <div key={dpIndex} className="flex items-center gap-3 py-1.5 pl-4 border-l-2 border-border/50">
                                  <span className="text-sm font-medium">{dp.publisher_name || dp.publishers?.name || 'Unknown'}</span>
                                  {(dp.publishers?.pro || dp.publisher_pro) && (
                                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                      {dp.publishers?.pro || dp.publisher_pro}
                                    </span>
                                  )}
                                  <span className="text-sm ml-auto">{dp.share}%</span>
                                  {dp.tribes_administered && (
                                    <span className="text-[11px] text-muted-foreground font-medium">Tribes</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground italic pl-4">No publishers in this deal.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </AppCardBody>
            </AppCard>

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
