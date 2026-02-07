import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  AppPageLayout,
  AppButton,
  AppCard,
  AppCardBody,
  AppSection,
  AppDetailRow,
  AppDetailRowGroup,
} from "@/components/app-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { QueueStatusBadge } from "@/components/queue/QueueStatusBadge";
import { QueueStatusControl } from "@/components/queue/QueueStatusControl";
import { QueueMessageThread } from "@/components/queue/QueueMessageThread";
import { useQueueItem, useUpdateQueueStatus } from "@/hooks/use-song-queue";
import { useQueueMessages } from "@/hooks/use-queue-messages";
import { toast } from "sonner";

/**
 * RIGHTS QUEUE DETAIL PAGE — Staff view of a single queue item
 */
export default function RightsQueueDetailPage() {
  const { queueId } = useParams<{ queueId: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading, refetch } = useQueueItem(queueId);
  const { data: messages = [] } = useQueueMessages(queueId);
  const updateStatus = useUpdateQueueStatus();
  const [adminNotes, setAdminNotes] = useState("");
  const [notesEditing, setNotesEditing] = useState(false);

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

  const handleSaveNotes = () => {
    updateStatus.mutate(
      { queueId: item.id, status: item.status, notes: adminNotes },
      {
        onSuccess: () => { toast.success("Notes saved"); setNotesEditing(false); refetch(); },
        onError: (err) => toast.error(`Failed: ${err.message}`),
      }
    );
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
            <AppCard>
              <AppCardBody>
                <AppDetailRowGroup>
                  <AppDetailRow label="Title" value={title} />
                  <AppDetailRow label="Alternate Title" value={songData.alternateTitle || "—"} />
                  <AppDetailRow label="Language" value={songData.language || "—"} />
                  <AppDetailRow label="Song Type" value={songData.songType || "—"} />
                  <AppDetailRow label="Publication Year" value={songData.publicationYear || songData.creationYear || "—"} />
                  <AppDetailRow label="Copyright Status" value={songData.copyrightStatus || "—"} />
                  <AppDetailRow label="Chord Chart" value={songData.hasChordChart ? "Yes" : "No"} />
                </AppDetailRowGroup>
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
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                        <div>
                          <span className="text-[13px] font-medium">{w.name}</span>
                          <span className="text-[12px] text-muted-foreground ml-2">
                            {w.credit === "both" ? "Words & Music" : w.credit === "lyrics" ? "Words" : "Music"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                          <span>{w.split}%</span>
                          <span>{w.pro}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AppCardBody>
            </AppCard>

            {/* Lyrics */}
            {(songData.lyricsFull || songData.lyricsSections?.length > 0) && (
              <AppCard>
                <AppCardBody>
                  <h3 className="text-sm font-medium mb-3">Lyrics</h3>
                  <pre className="text-[13px] text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-[400px] overflow-y-auto">
                    {songData.lyricsFull || songData.lyricsSections?.map((s: any) => `[${s.type}]\n${s.content}`).join("\n\n")}
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
              <QueueStatusControl queueId={item.id} currentStatus={item.status} onStatusChange={() => refetch()} />
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
