import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { X, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AppChip } from "@/components/app-ui";

/**
 * HELP MESSAGES PAGE — INSTITUTIONAL DESIGN
 * 
 * Inbox for help-related messages:
 * - NO decorative icons (envelope, etc.)
 * - Text-only empty states
 * - Right-slide panel for details
 * - Sharp corners (rounded-md)
 * - Dense layout
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
  referrer_url: string | null;
}

const STATUS_TABS: { value: MessageStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "open", label: "Open" },
  { value: "waiting", label: "Waiting" },
  { value: "resolved", label: "Resolved" },
];

function getStatusChipStatus(status: MessageStatus | null): "pending" | "running" | "pass" | "warning" | "fail" {
  switch (status) {
    case "new": return "pending";
    case "open": return "running";
    case "waiting": return "warning";
    case "resolved": return "pass";
    case "archived": return "fail";
    default: return "pending";
  }
}

export default function HelpMessagesPage() {
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "all">("all");
  const [selectedMessage, setSelectedMessage] = useState<HelpMessage | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
      toast({ 
        title: "Unable to load messages",
        description: "Please try again.",
        variant: "destructive" 
      });
    } else {
      setMessages((data || []).map(d => ({
        ...d,
        status: (d.status as MessageStatus) || null,
      })));
    }
    setLoading(false);
  };

  // Filter messages
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
      if (!matchesName && !matchesEmail && !matchesSubject && !matchesMessage) {
        return false;
      }
    }
    
    return true;
  });

  // Status counts
  const statusCounts = {
    all: messages.length,
    new: messages.filter(m => !m.status || m.status === "new").length,
    open: messages.filter(m => m.status === "open").length,
    waiting: messages.filter(m => m.status === "waiting").length,
    resolved: messages.filter(m => m.status === "resolved").length,
  };

  // Update message status
  const updateStatus = async (messageId: string, newStatus: MessageStatus) => {
    setUpdating(true);
    const { error } = await supabase
      .from("messages")
      .update({ 
        status: newStatus,
        responded_at: newStatus === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", messageId);

    if (error) {
      toast({ 
        title: "Unable to update status",
        description: "Please try again.", 
        variant: "destructive" 
      });
    } else {
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, status: newStatus, responded_at: newStatus === "resolved" ? new Date().toISOString() : m.responded_at }
          : m
      ));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast({ title: "Status updated" });
    }
    setUpdating(false);
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-5">
        <p 
          className="text-[10px] uppercase tracking-wider font-medium mb-1"
          style={{ color: '#6B6B6B' }}
        >
          Help Workstation
        </p>
        <h1 
          className="text-[20px] font-medium leading-tight"
          style={{ color: 'var(--platform-text)' }}
        >
          Messages
        </h1>
        <p 
          className="text-[13px] mt-1"
          style={{ color: '#AAAAAA' }}
        >
          {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
        </p>
      </div>

      {/* Status Tabs */}
      <div 
        className="flex gap-0 mb-5"
        style={{ borderBottom: '1px solid #303030' }}
      >
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className="px-4 py-2.5 text-[13px] transition-colors"
            style={{
              color: statusFilter === tab.value ? 'white' : '#AAAAAA',
              borderBottom: statusFilter === tab.value ? '2px solid white' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
            <span 
              className="ml-2 text-[11px]"
              style={{ color: statusFilter === tab.value ? '#8F8F8F' : '#6B6B6B' }}
            >
              {statusCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Search - No icon */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full max-w-sm px-3 text-[13px] rounded-md transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030',
            color: 'white',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#505050'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#303030'}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center">
          <p className="text-[13px]" style={{ color: '#6B6B6B' }}>Loading messages...</p>
        </div>
      ) : (
        <div 
          className="rounded-md overflow-hidden"
          style={{ 
            backgroundColor: '#1A1A1A',
            border: '1px solid #303030'
          }}
        >
          {/* Table Header */}
          <div 
            className="grid grid-cols-12 gap-4 px-4 py-3 text-[11px] uppercase tracking-wider font-medium"
            style={{ 
              color: '#6B6B6B',
              borderBottom: '1px solid #303030',
            }}
          >
            <div className="col-span-3">Sender</div>
            <div className="col-span-4 hidden md:block">Subject</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 hidden lg:block">Received</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Table Body */}
          {filteredMessages.length === 0 ? (
            <div className="py-16 text-center">
              <p 
                className="text-[13px]"
                style={{ color: '#8F8F8F' }}
              >
                {search || statusFilter !== "all" 
                  ? "No messages match your filters" 
                  : "No messages yet"
                }
              </p>
              <p 
                className="text-[12px] mt-1"
                style={{ color: '#6B6B6B' }}
              >
                Messages from public Help Center will appear here
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => (
              <div 
                key={msg.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center cursor-pointer transition-colors"
                style={{ 
                  borderBottom: index < filteredMessages.length - 1 ? '1px solid #303030' : 'none',
                }}
                onClick={() => setSelectedMessage(msg)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="col-span-3">
                  <p className="text-[13px] font-medium truncate" style={{ color: 'white' }}>
                    {msg.name}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: '#8F8F8F' }}>
                    {msg.email}
                  </p>
                </div>
                <div className="col-span-4 hidden md:block">
                  <p className="text-[13px] truncate" style={{ color: '#AAAAAA' }}>
                    {msg.subject || msg.message.slice(0, 60) + (msg.message.length > 60 ? "..." : "")}
                  </p>
                </div>
                <div className="col-span-2">
                  <AppChip 
                    status={getStatusChipStatus(msg.status)} 
                    label={(msg.status || "new").charAt(0).toUpperCase() + (msg.status || "new").slice(1)}
                  />
                </div>
                <div className="col-span-2 hidden lg:block">
                  <span className="text-[12px]" style={{ color: '#8F8F8F' }}>
                    {format(new Date(msg.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} style={{ color: '#6B6B6B' }} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Message count footer */}
      {!loading && filteredMessages.length > 0 && (
        <p 
          className="mt-4 text-[12px]"
          style={{ color: '#6B6B6B' }}
        >
          {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Right-side Detail Panel */}
      {selectedMessage && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
            onClick={() => setSelectedMessage(null)}
          />
          
          {/* Panel */}
          <div 
            className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col"
            style={{ 
              backgroundColor: '#0A0A0A',
              borderLeft: '1px solid #303030',
            }}
          >
            {/* Header */}
            <div 
              className="flex items-start justify-between p-5"
              style={{ borderBottom: '1px solid #303030' }}
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-medium" style={{ color: 'white' }}>
                  {selectedMessage.name}
                </h2>
                <p className="text-[12px] mt-0.5" style={{ color: '#8F8F8F' }}>
                  {selectedMessage.email}
                </p>
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded hover:bg-white/[0.05] transition-colors ml-3"
                style={{ color: '#AAAAAA' }}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-[12px]" style={{ color: '#8F8F8F' }}>Status:</span>
                <AppChip 
                  status={getStatusChipStatus(selectedMessage.status)} 
                  label={(selectedMessage.status || "new").charAt(0).toUpperCase() + (selectedMessage.status || "new").slice(1)}
                />
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedMessage.status !== "open" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateStatus(selectedMessage.id, "open")}
                    disabled={updating}
                  >
                    Mark Open
                  </Button>
                )}
                {selectedMessage.status !== "waiting" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateStatus(selectedMessage.id, "waiting")}
                    disabled={updating}
                  >
                    Waiting
                  </Button>
                )}
                {selectedMessage.status !== "resolved" && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => updateStatus(selectedMessage.id, "resolved")}
                    disabled={updating}
                  >
                    Resolve
                  </Button>
                )}
                {selectedMessage.status !== "archived" && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => updateStatus(selectedMessage.id, "archived")}
                    disabled={updating}
                  >
                    Archive
                  </Button>
                )}
              </div>
              
              {/* Message Content */}
              <div 
                className="rounded-md p-4"
                style={{ 
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #303030'
                }}
              >
                {selectedMessage.subject && (
                  <h4 className="text-[13px] font-medium mb-2" style={{ color: 'white' }}>
                    {selectedMessage.subject}
                  </h4>
                )}
                <p className="text-[13px] whitespace-pre-wrap" style={{ color: '#AAAAAA' }}>
                  {selectedMessage.message}
                </p>
              </div>
              
              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span style={{ color: '#6B6B6B' }}>Received</span>
                  <span style={{ color: '#AAAAAA' }}>
                    {format(new Date(selectedMessage.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                {selectedMessage.responded_at && (
                  <div className="flex justify-between text-[12px]">
                    <span style={{ color: '#6B6B6B' }}>Resolved</span>
                    <span style={{ color: '#AAAAAA' }}>
                      {format(new Date(selectedMessage.responded_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                )}
                {selectedMessage.search_query && (
                  <div className="flex justify-between text-[12px]">
                    <span style={{ color: '#6B6B6B' }}>Search query</span>
                    <span style={{ color: '#AAAAAA' }}>"{selectedMessage.search_query}"</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div 
              className="p-5"
              style={{ borderTop: '1px solid #303030' }}
            >
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
