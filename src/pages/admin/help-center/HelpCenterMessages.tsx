import { useState, useEffect } from "react";
import { Search, Mail, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppButton } from "@/components/app-ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string | null;
  search_query: string | null;
  created_at: string | null;
  responded_at: string | null;
  response_body: string | null;
}

type StatusFilter = "all" | "new" | "responded" | "closed";

export default function HelpCenterMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [responseText, setResponseText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [search, statusFilter]);

  async function fetchMessages() {
    setLoading(true);

    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  }

  function openMessage(message: Message) {
    setSelectedMessage(message);
    setResponseText(message.response_body ?? "");
  }

  async function handleSendResponse() {
    if (!selectedMessage || !responseText.trim()) return;

    setSending(true);

    const { error } = await supabase
      .from("messages")
      .update({
        response_body: responseText,
        responded_at: new Date().toISOString(),
        status: "responded",
      })
      .eq("id", selectedMessage.id);

    if (error) {
      toast.error("Failed to send response");
    } else {
      toast.success("Response sent");
      setSelectedMessage(null);
      fetchMessages();
    }

    setSending(false);
  }

  async function handleStatusChange(status: "responded" | "closed") {
    if (!selectedMessage) return;

    const { error } = await supabase
      .from("messages")
      .update({ status })
      .eq("id", selectedMessage.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Marked as ${status}`);
      setSelectedMessage(null);
      fetchMessages();
    }
  }

  function getStatusColor(status: string | null): string {
    switch (status) {
      case "new":
        return "rgba(59, 130, 246, 0.15)";
      case "responded":
        return "rgba(34, 197, 94, 0.1)";
      case "closed":
        return "rgba(255, 255, 255, 0.05)";
      default:
        return "rgba(59, 130, 246, 0.15)";
    }
  }

  function getStatusTextColor(status: string | null): string {
    switch (status) {
      case "new":
        return "rgb(59, 130, 246)";
      case "responded":
        return "rgb(34, 197, 94)";
      case "closed":
        return "var(--platform-text-muted)";
      default:
        return "rgb(59, 130, 246)";
    }
  }

  return (
    <div
      className="min-h-full py-12 md:py-16 px-4 md:px-6"
      style={{ backgroundColor: "var(--platform-canvas)" }}
    >
      <div
        className="max-w-[960px] mx-auto rounded-lg"
        style={{
          backgroundColor: "var(--platform-surface)",
          border: "1px solid var(--platform-border)",
        }}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-[22px] md:text-[26px] font-medium tracking-[-0.01em]"
              style={{ color: "var(--platform-text)" }}
            >
              Messages
            </h1>
            <p
              className="text-[13px] mt-1"
              style={{ color: "var(--platform-text-muted)" }}
            >
              Support messages from help center visitors
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Tabs
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              className="w-full md:w-auto"
            >
              <TabsList
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--platform-border)",
                }}
              >
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="responded">Responded</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--platform-text-muted)" }}
              />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "var(--platform-border)",
                  color: "var(--platform-text)",
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="text-left text-[11px] uppercase tracking-wide"
                  style={{
                    color: "var(--platform-text-muted)",
                    borderBottom: "1px solid var(--platform-border)",
                  }}
                >
                  <th className="pb-3 pr-4">From</th>
                  <th className="pb-3 pr-4 hidden md:table-cell">Subject</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4 hidden md:table-cell">Date</th>
                  <th className="pb-3 w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-[13px]"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-[13px]"
                      style={{ color: "var(--platform-text-muted)" }}
                    >
                      No messages
                    </td>
                  </tr>
                ) : (
                  messages.map((msg, i) => (
                    <tr
                      key={msg.id}
                      className="group cursor-pointer"
                      onClick={() => openMessage(msg)}
                      style={{
                        backgroundColor:
                          i % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent",
                        borderBottom: "1px solid var(--platform-border)",
                      }}
                    >
                      <td className="py-3 pr-4">
                        <div>
                          <span
                            className="text-[13px] font-medium block"
                            style={{ color: "var(--platform-text)" }}
                          >
                            {msg.name}
                          </span>
                          <span
                            className="text-[12px] block truncate max-w-[200px]"
                            style={{ color: "var(--platform-text-muted)" }}
                          >
                            {msg.email}
                          </span>
                        </div>
                      </td>
                      <td
                        className="py-3 pr-4 hidden md:table-cell text-[13px] truncate max-w-[200px]"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        {msg.subject || "(No subject)"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium capitalize"
                          style={{
                            backgroundColor: getStatusColor(msg.status),
                            color: getStatusTextColor(msg.status),
                          }}
                        >
                          {msg.status || "new"}
                        </span>
                      </td>
                      <td
                        className="py-3 pr-4 hidden md:table-cell text-[13px] tabular-nums"
                        style={{ color: "var(--platform-text-muted)" }}
                      >
                        {msg.created_at
                          ? format(new Date(msg.created_at), "MMM d, yyyy")
                          : "—"}
                      </td>
                      <td className="py-3">
                        <button
                          className="p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
                          style={{ color: "var(--platform-text-muted)" }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent
          className="max-w-[600px]"
          style={{
            backgroundColor: "var(--platform-surface)",
            border: "1px solid var(--platform-border)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--platform-text)" }}>
              Message from {selectedMessage?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 py-4">
              {/* Metadata */}
              <div
                className="grid grid-cols-2 gap-4 p-3 rounded"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--platform-border)",
                }}
              >
                <div>
                  <span
                    className="text-[11px] uppercase tracking-wide block mb-1"
                    style={{ color: "var(--platform-text-muted)" }}
                  >
                    Email
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-[13px] flex items-center gap-1"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    <Mail className="h-3 w-3" />
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <span
                    className="text-[11px] uppercase tracking-wide block mb-1"
                    style={{ color: "var(--platform-text-muted)" }}
                  >
                    Date
                  </span>
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--platform-text)" }}
                  >
                    {selectedMessage.created_at
                      ? format(
                          new Date(selectedMessage.created_at),
                          "MMM d, yyyy 'at' h:mm a"
                        )
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Search query context */}
              {selectedMessage.search_query && (
                <div
                  className="p-3 rounded"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--platform-border)",
                  }}
                >
                  <span
                    className="text-[11px] uppercase tracking-wide block mb-1"
                    style={{ color: "var(--platform-text-muted)" }}
                  >
                    Search Query Context
                  </span>
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--platform-text)" }}
                  >
                    "{selectedMessage.search_query}"
                  </span>
                </div>
              )}

              {/* Subject */}
              {selectedMessage.subject && (
                <div>
                  <span
                    className="text-[11px] uppercase tracking-wide block mb-1"
                    style={{ color: "var(--platform-text-muted)" }}
                  >
                    Subject
                  </span>
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: "var(--platform-text)" }}
                  >
                    {selectedMessage.subject}
                  </span>
                </div>
              )}

              {/* Message body */}
              <div>
                <span
                  className="text-[11px] uppercase tracking-wide block mb-2"
                  style={{ color: "var(--platform-text-muted)" }}
                >
                  Message
                </span>
                <div
                  className="p-4 rounded text-[13px] whitespace-pre-wrap"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--platform-border)",
                    color: "var(--platform-text)",
                  }}
                >
                  {selectedMessage.message}
                </div>
              </div>

              {/* Response */}
              <div>
                <span
                  className="text-[11px] uppercase tracking-wide block mb-2"
                  style={{ color: "var(--platform-text-muted)" }}
                >
                  Response
                </span>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response..."
                  rows={4}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    borderColor: "var(--platform-border)",
                    color: "var(--platform-text)",
                  }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <AppButton
                intent="secondary"
                size="sm"
                onClick={() => handleStatusChange("closed")}
                disabled={sending}
              >
                Mark Closed
              </AppButton>
            </div>
            <AppButton
              intent="primary"
              onClick={handleSendResponse}
              disabled={sending || !responseText.trim()}
            >
              {sending ? "Sending..." : "Send Response"}
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
