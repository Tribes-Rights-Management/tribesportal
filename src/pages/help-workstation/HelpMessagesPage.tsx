import { MessageAIInsights } from '@/components/help/MessageAIInsights';
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { X, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { AppButton, AppSearchInput } from "@/components/app-ui";

/**
 * HELP MESSAGES PAGE — INSTITUTIONAL DESIGN
 * 
 * Status tabs at top, right-side detail panel
 * Inline errors (not toasts)
 * All icons: strokeWidth={1.5}
 */

type MessageStatus = "new" | "open" | "waiting" | "resolved" | "archived";

interface HelpMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  subject: string | null;
  status: MessageStatus | null;
  created_at: string;
  responded_at: string | null;
  search_query: string | null;
}

const STATUS_TABS: { value: MessageStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "open", label: "Open" },
  { value: "waiting", label: "Waiting" },
  { value: "resolved", label: "Resolved" },
];

function getStatusStyle(status: MessageStatus | null): string {
  switch (status) {
    case "new": return "bg-emerald-500/20 text-emerald-400";
    case "open": return "bg-blue-500/20 text-blue-400";
    case "waiting": return "bg-amber-500/20 text-amber-400";
    case "resolved": return "bg-gray-500/20 text-gray-400";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function HelpMessagesPage() {
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "all">("all");
  const [selectedMessage, setSelectedMessage] = useState<HelpMessage | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Unable to load messages");
      setLoading(false);
      return;
    }
    
    setMessages((data || []).map(d => ({
      ...d,
      status: (d.status as MessageStatus) || null,
    })));
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(msg => {
    if (statusFilter !== "all") {
      const msgStatus = msg.status || "new";
      if (msgStatus !== statusFilter) return false;
    }
    
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const matchesName = msg.name?.toLowerCase().includes(searchLower);
      const matchesEmail = msg.email?.toLowerCase().includes(searchLower);
      const matchesSubject = msg.subject?.toLowerCase().includes(searchLower);
      const matchesMessage = msg.message?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesEmail && !matchesSubject && !matchesMessage) return false;
    }
    
    return true;
  });

  const statusCounts = {
    all: messages.length,
    new: messages.filter(m => !m.status || m.status === "new").length,
    open: messages.filter(m => m.status === "open").length,
    waiting: messages.filter(m => m.status === "waiting").length,
    resolved: messages.filter(m => m.status === "resolved").length,
  };

  const updateStatus = async (messageId: string, newStatus: MessageStatus) => {
    setUpdating(true);
    const { error: updateError } = await supabase
      .from("messages")
      .update({ 
        status: newStatus,
        responded_at: newStatus === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", messageId);

    if (updateError) {
      setError("Unable to update status");
    } else {
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, status: newStatus, responded_at: newStatus === "resolved" ? new Date().toISOString() : m.responded_at }
          : m
      ));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
    setUpdating(false);
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            HELP WORKSTATION
          </p>
          <h1 className="text-[20px] font-medium text-foreground mb-1">Messages</h1>
          <p className="text-[13px] text-muted-foreground">{messages.length} messages</p>
        </div>
      </div>

      {/* Inline Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-destructive/10 border-l-2 border-destructive rounded-r">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-foreground">{error}</p>
            <button 
              onClick={() => { setError(null); fetchMessages(); }} 
              className="text-[11px] text-destructive hover:text-destructive/80 underline mt-1 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2.5 text-[12px] border-b-2 transition-colors ${
              statusFilter === tab.value 
                ? 'text-foreground border-white' 
                : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-[11px] ${statusFilter === tab.value ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              {statusCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <AppSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search messages..."
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[25%]">Sender</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[35%]">Subject</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[15%]">Status</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-[25%]">Received</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-20">
                  <p className="text-[13px] text-muted-foreground">Loading messages...</p>
                </td>
              </tr>
            ) : filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-20">
                  <p className="text-[14px] text-muted-foreground mb-2">No messages yet</p>
                  <p className="text-[12px] text-muted-foreground">Messages from public Help Center will appear here</p>
                </td>
              </tr>
            ) : (
              filteredMessages.map(msg => (
                <tr 
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className="border-b border-border/30 row-hover"
                >
                  <td className="py-3 px-4">
                    <p className="text-[13px] text-foreground">{msg.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{msg.email}</p>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-foreground">
                    {msg.subject || msg.message.slice(0, 60) + (msg.message.length > 60 ? "..." : "")}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[11px] px-2 py-1 rounded ${getStatusStyle(msg.status)}`}>
                      {(msg.status || "new")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[12px] text-muted-foreground">
                    {format(new Date(msg.created_at), "MMM d, yyyy")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Right-side Detail Panel */}
      {selectedMessage && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedMessage(null)} />
          <div className="fixed inset-y-0 right-0 w-[500px] bg-background border-l border-border shadow-2xl z-50 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-border">
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-medium text-foreground">{selectedMessage.name}</h2>
                <p className="text-[11px] text-muted-foreground mt-1">{selectedMessage.email}</p>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-muted-foreground hover:text-foreground transition-colors ml-3">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-muted-foreground">Status:</span>
                <span className={`text-[11px] px-2 py-1 rounded ${getStatusStyle(selectedMessage.status)}`}>
                  {(selectedMessage.status || "new")}
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedMessage.status !== "open" && (
                  <AppButton intent="secondary" size="sm" onClick={() => updateStatus(selectedMessage.id, "open")} disabled={updating}>
                    Mark Open
                  </AppButton>
                )}
                {selectedMessage.status !== "waiting" && (
                  <AppButton intent="secondary" size="sm" onClick={() => updateStatus(selectedMessage.id, "waiting")} disabled={updating}>
                    Waiting
                  </AppButton>
                )}
                {selectedMessage.status !== "resolved" && (
                  <AppButton intent="primary" size="sm" onClick={() => updateStatus(selectedMessage.id, "resolved")} disabled={updating}>
                    Resolve
                  </AppButton>
                )}
                {selectedMessage.status !== "archived" && (
                  <AppButton intent="ghost" size="sm" onClick={() => updateStatus(selectedMessage.id, "archived")} disabled={updating}>
                    Archive
                  </AppButton>
                )}
              </div>
              
              {/* AI Insights */}
              <MessageAIInsights
                message={selectedMessage.message}
                senderName={selectedMessage.name}
                subject={selectedMessage.subject}
              />
              
              {/* Message Content */}
              <div className="bg-card border border-border rounded p-4">
                {selectedMessage.subject && (
                  <h4 className="text-[13px] font-medium text-foreground mb-2">{selectedMessage.subject}</h4>
                )}
                <p className="text-[13px] text-muted-foreground whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              
              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Received</span>
                  <span className="text-muted-foreground">{format(new Date(selectedMessage.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
                {selectedMessage.responded_at && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Resolved</span>
                    <span className="text-muted-foreground">{format(new Date(selectedMessage.responded_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                )}
                {selectedMessage.search_query && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Search query</span>
                    <span className="text-muted-foreground">"{selectedMessage.search_query}"</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Panel Footer */}
            <div className="px-6 py-5 border-t border-border">
              <AppButton 
                intent="secondary" 
                size="sm" 
                className="w-full"
                onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your message'}`)}
              >
                Reply via Email
              </AppButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
