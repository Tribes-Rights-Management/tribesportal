import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { X, ChevronRight, AlertCircle, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    case "new": return "bg-[#059669]/20 text-[#34D399]";
    case "open": return "bg-[#3B82F6]/20 text-[#60A5FA]";
    case "waiting": return "bg-[#F59E0B]/20 text-[#FBBF24]";
    case "resolved": return "bg-[#6B7280]/20 text-[#9CA3AF]";
    default: return "bg-[#303030] text-[#AAAAAA]";
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
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">
          HELP WORKSTATION
        </p>
        <h1 className="text-[20px] font-medium text-white mb-1">Messages</h1>
        <p className="text-[13px] text-[#AAAAAA]">{messages.length} messages</p>
      </div>

      {/* Inline Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-[#2A1A1A] border-l-2 border-[#7F1D1D] rounded-r">
          <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-[12px] text-[#E5E5E5]">{error}</p>
            <button 
              onClick={() => { setError(null); fetchMessages(); }} 
              className="text-[11px] text-[#DC2626] hover:text-[#EF4444] underline mt-1 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#303030]">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2.5 text-[12px] border-b-2 transition-colors ${
              statusFilter === tab.value 
                ? 'text-white border-white' 
                : 'text-[#AAAAAA] hover:text-white border-transparent'
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-[11px] ${statusFilter === tab.value ? 'text-[#8F8F8F]' : 'text-[#6B6B6B]'}`}>
              {statusCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#505050]" strokeWidth={1} />
        <input
          type="search"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-7 pr-3 bg-transparent border-0 border-b border-[#303030] text-[12px] text-white placeholder:text-[#505050] focus:outline-none focus:border-[#505050]"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-[#303030] rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#303030]">
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[25%]">Sender</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[35%]">Subject</th>
              <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[15%]">Status</th>
              <th className="text-right py-3 px-4 text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium w-[25%]">Received</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-20">
                  <p className="text-[13px] text-[#6B6B6B]">Loading messages...</p>
                </td>
              </tr>
            ) : filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-20">
                  <p className="text-[14px] text-[#8F8F8F] mb-2">No messages yet</p>
                  <p className="text-[12px] text-[#6B6B6B]">Messages from public Help Center will appear here</p>
                </td>
              </tr>
            ) : (
              filteredMessages.map(msg => (
                <tr 
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className="border-b border-[#303030]/30 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <p className="text-[13px] text-white">{msg.name}</p>
                    <p className="text-[11px] text-[#8F8F8F] mt-0.5">{msg.email}</p>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-white">
                    {msg.subject || msg.message.slice(0, 60) + (msg.message.length > 60 ? "..." : "")}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[11px] px-2 py-1 rounded ${getStatusStyle(msg.status)}`}>
                      {(msg.status || "new")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[12px] text-[#8F8F8F]">
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
          <div className="fixed inset-y-0 right-0 w-[500px] bg-[#0A0A0A] border-l border-[#303030] shadow-2xl z-50 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-[#303030]">
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-medium text-white">{selectedMessage.name}</h2>
                <p className="text-[11px] text-[#8F8F8F] mt-1">{selectedMessage.email}</p>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-[#6B6B6B] hover:text-white transition-colors ml-3">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#8F8F8F]">Status:</span>
                <span className={`text-[11px] px-2 py-1 rounded ${getStatusStyle(selectedMessage.status)}`}>
                  {(selectedMessage.status || "new")}
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedMessage.status !== "open" && (
                  <Button variant="outline" size="sm" onClick={() => updateStatus(selectedMessage.id, "open")} disabled={updating}>
                    Mark Open
                  </Button>
                )}
                {selectedMessage.status !== "waiting" && (
                  <Button variant="outline" size="sm" onClick={() => updateStatus(selectedMessage.id, "waiting")} disabled={updating}>
                    Waiting
                  </Button>
                )}
                {selectedMessage.status !== "resolved" && (
                  <Button variant="default" size="sm" onClick={() => updateStatus(selectedMessage.id, "resolved")} disabled={updating}>
                    Resolve
                  </Button>
                )}
                {selectedMessage.status !== "archived" && (
                  <Button variant="ghost" size="sm" onClick={() => updateStatus(selectedMessage.id, "archived")} disabled={updating}>
                    Archive
                  </Button>
                )}
              </div>
              
              {/* Message Content */}
              <div className="bg-[#1A1A1A] border border-[#303030] rounded p-4">
                {selectedMessage.subject && (
                  <h4 className="text-[13px] font-medium text-white mb-2">{selectedMessage.subject}</h4>
                )}
                <p className="text-[13px] text-[#AAAAAA] whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              
              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#6B6B6B]">Received</span>
                  <span className="text-[#AAAAAA]">{format(new Date(selectedMessage.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
                {selectedMessage.responded_at && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#6B6B6B]">Resolved</span>
                    <span className="text-[#AAAAAA]">{format(new Date(selectedMessage.responded_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                )}
                {selectedMessage.search_query && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#6B6B6B]">Search query</span>
                    <span className="text-[#AAAAAA]">"{selectedMessage.search_query}"</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Panel Footer */}
            <div className="px-6 py-5 border-t border-[#303030]">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your message'}`)}
              >
                Reply via Email
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
