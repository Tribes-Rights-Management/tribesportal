import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer } from "@/components/ui/page-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import { 
  AppButton, 
  AppChip, 
  AppSectionHeader,
  AppCard,
  AppCardBody,
} from "@/components/app-ui";
import { Search, Mail, ExternalLink, Check, X, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * HELP MESSAGES PAGE — HELP WORKSTATION
 * 
 * Inbox for help-related messages:
 * - Article feedback ("Was this helpful?")
 * - Contact form submissions
 * - In-app support messages
 * 
 * Features:
 * - Status management (New → Open → Waiting → Resolved → Archived)
 * - Search and filters
 * - Message detail view
 */

type MessageStatus = "new" | "open" | "waiting" | "resolved" | "archived";
type MessageType = "feedback" | "question" | "bug" | "other";

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

const STATUS_OPTIONS: { value: MessageStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "open", label: "Open" },
  { value: "waiting", label: "Waiting" },
  { value: "resolved", label: "Resolved" },
  { value: "archived", label: "Archived" },
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

  // Fetch messages
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

  // Filter messages - moved outside fetchMessages

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    // Status filter
    if (statusFilter !== "all") {
      const msgStatus = msg.status || "new";
      if (msgStatus !== statusFilter) return false;
    }
    
    // Search filter
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
      // Update local state
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

  // Stats
  const stats = {
    total: messages.length,
    new: messages.filter(m => !m.status || m.status === "new").length,
    open: messages.filter(m => m.status === "open").length,
    waiting: messages.filter(m => m.status === "waiting").length,
  };

  return (
    <PageContainer maxWidth="wide">
      <AppSectionHeader
        title="Messages"
        subtitle={`${filteredMessages.length} ${filteredMessages.length === 1 ? 'message' : 'messages'}`}
      />

      {/* Stats Row */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-sm font-medium">{stats.new}</span>
          <span className="text-xs text-muted-foreground">New</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-sm font-medium">{stats.open}</span>
          <span className="text-xs text-muted-foreground">Open</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
          <span className="text-sm font-medium">{stats.waiting}</span>
          <span className="text-xs text-muted-foreground">Waiting</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" 
            style={{ color: 'hsl(var(--muted-foreground))' }} 
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full pl-10 pr-4 text-sm rounded-lg transition-colors duration-100 focus:outline-none"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-10 px-3 text-sm rounded-lg appearance-none cursor-pointer transition-colors duration-100 focus:outline-none"
          style={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            minWidth: '150px',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <InstitutionalLoadingState message="Loading messages" />
      ) : (
        <div 
          className="rounded-lg overflow-hidden"
          style={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] text-xs font-medium uppercase tracking-wider">
                  Sender
                </TableHead>
                <TableHead className="hidden md:table-cell text-xs font-medium uppercase tracking-wider">
                  Subject
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="hidden lg:table-cell text-xs font-medium uppercase tracking-wider">
                  Received
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <Mail className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {search || statusFilter !== "all" 
                        ? "No messages match your filters" 
                        : "No messages yet"
                      }
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages.map((msg) => (
                  <TableRow 
                    key={msg.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{msg.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      <p className="truncate max-w-[300px]">
                        {msg.subject || msg.message.slice(0, 60) + (msg.message.length > 60 ? "..." : "")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <AppChip 
                        status={getStatusChipStatus(msg.status)} 
                        label={(msg.status || "new").charAt(0).toUpperCase() + (msg.status || "new").slice(1)}
                      />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {format(new Date(msg.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Message Detail Sheet */}
      <Sheet open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedMessage && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedMessage.name}</SheetTitle>
                <SheetDescription>{selectedMessage.email}</SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Status:</span>
                  <AppChip 
                    status={getStatusChipStatus(selectedMessage.status)} 
                    label={(selectedMessage.status || "new").charAt(0).toUpperCase() + (selectedMessage.status || "new").slice(1)}
                  />
                </div>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {selectedMessage.status !== "open" && (
                    <AppButton 
                      intent="secondary" 
                      size="sm"
                      onClick={() => updateStatus(selectedMessage.id, "open")}
                      disabled={updating}
                    >
                      Mark as Open
                    </AppButton>
                  )}
                  {selectedMessage.status !== "waiting" && (
                    <AppButton 
                      intent="secondary" 
                      size="sm"
                      onClick={() => updateStatus(selectedMessage.id, "waiting")}
                      disabled={updating}
                      icon={<Clock className="h-3.5 w-3.5" />}
                    >
                      Waiting
                    </AppButton>
                  )}
                  {selectedMessage.status !== "resolved" && (
                    <AppButton 
                      intent="primary" 
                      size="sm"
                      onClick={() => updateStatus(selectedMessage.id, "resolved")}
                      disabled={updating}
                      icon={<Check className="h-3.5 w-3.5" />}
                    >
                      Resolve
                    </AppButton>
                  )}
                  {selectedMessage.status !== "archived" && (
                    <AppButton 
                      intent="ghost" 
                      size="sm"
                      onClick={() => updateStatus(selectedMessage.id, "archived")}
                      disabled={updating}
                    >
                      Archive
                    </AppButton>
                  )}
                </div>
                
                {/* Message Content */}
                <AppCard>
                  <AppCardBody>
                    {selectedMessage.subject && (
                      <h4 className="font-medium mb-2">{selectedMessage.subject}</h4>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                  </AppCardBody>
                </AppCard>
                
                {/* Metadata */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Received</span>
                    <span>{format(new Date(selectedMessage.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                  {selectedMessage.responded_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolved</span>
                      <span>{format(new Date(selectedMessage.responded_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  )}
                  {selectedMessage.search_query && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Search query</span>
                      <span className="text-right">"{selectedMessage.search_query}"</span>
                    </div>
                  )}
                  {selectedMessage.referrer_url && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Referrer</span>
                      <a 
                        href={selectedMessage.referrer_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary flex items-center gap-1 hover:underline"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Reply action */}
                <AppButton 
                  intent="secondary" 
                  fullWidth
                  onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your message'}`)}
                  icon={<Mail className="h-4 w-4" />}
                >
                  Reply via Email
                </AppButton>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
