import { useState } from "react";
import { format } from "date-fns";
import { Send, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppButton } from "@/components/app-ui";
import { Textarea } from "@/components/ui/textarea";
import { useQueueMessages, useSendQueueMessage, type QueueMessage } from "@/hooks/use-queue-messages";

/**
 * QUEUE MESSAGE THREAD
 * Shared threaded messaging component for queue items.
 * Used in both /rights (staff) and /admin (client) views.
 */

interface QueueMessageThreadProps {
  queueId: string;
  /** 'staff' shows internal notes toggle; 'client' does not */
  viewerRole: "staff" | "client";
}

export function QueueMessageThread({ queueId, viewerRole }: QueueMessageThreadProps) {
  const { data: messages = [], isLoading } = useQueueMessages(queueId);
  const sendMessage = useSendQueueMessage();
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage.mutate({
      queueId,
      message: newMessage.trim(),
      isInternal: viewerRole === "staff" ? isInternal : false,
      senderRole: viewerRole,
    }, {
      onSuccess: () => {
        setNewMessage("");
        setIsInternal(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground text-sm">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Thread */}
      {messages.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-sm">
          No messages yet. Start the conversation below.
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-border/50">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} viewerRole={viewerRole} />
          ))}
        </div>
      )}

      {/* Compose */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="border-0 rounded-none focus-visible:ring-0 resize-none min-h-[80px]"
        />
        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-t border-border/50">
          <div className="flex items-center gap-2">
            {viewerRole === "staff" && (
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border"
                />
                <Lock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Internal note</span>
              </label>
            )}
          </div>
          <AppButton
            size="sm"
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMessage.isPending}
            loading={sendMessage.isPending}
            icon={<Send className="h-3.5 w-3.5" />}
          >
            Send
          </AppButton>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, viewerRole }: { message: QueueMessage; viewerRole: string }) {
  const isStaff = message.sender_role === "staff";
  const isInternalNote = message.is_internal;

  return (
    <div
      className={cn(
        "py-3 px-4",
        isInternalNote && "bg-amber-500/5"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={cn(
          "text-[11px] font-medium uppercase tracking-wide",
          isStaff ? "text-foreground" : "text-muted-foreground"
        )}>
          {isStaff ? "Tribes Team" : message.sender_name}
        </span>
        {isStaff && (
          <span className="text-[11px] text-muted-foreground">
            · {message.sender_name}
          </span>
        )}
        {isInternalNote && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            <Lock className="h-2.5 w-2.5" />
            Internal
          </span>
        )}
        <span className="text-[11px] text-muted-foreground ml-auto">
          {format(new Date(message.created_at), "MMM d, yyyy h:mm a")}
        </span>
      </div>
      <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
        {message.message}
      </p>
    </div>
  );
}
