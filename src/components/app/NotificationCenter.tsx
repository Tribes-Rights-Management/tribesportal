/**
 * INSTITUTIONAL NOTIFICATION CENTER
 * 
 * A governance-aware status surface, not a messaging inbox.
 * 
 * RULES:
 * - Notifications grouped by governance category, not chronology
 * - No animations, pulses, or attention-seeking indicators
 * - Escalated items cannot be dismissed until resolved
 * - Authority-scoped visibility enforced
 * - Mobile: full-height sheet, identical behavior
 */

import { useState } from "react";
import { Bell, Check, AlertTriangle, FileText, CreditCard, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  useUserNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
  type NotificationType,
  NOTIFICATION_TYPE_LABELS,
} from "@/hooks/useNotifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { ICON_SIZE, ICON_STROKE } from "@/styles/tokens";

// ═══════════════════════════════════════════════════════════════════════════
// GOVERNANCE CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════

type GovernanceCategory = 
  | "approvals"
  | "licensing"
  | "billing"
  | "authority"
  | "security";

interface CategoryConfig {
  label: string;
  icon: typeof Bell;
  types: NotificationType[];
}

/**
 * GOVERNANCE CATEGORY MAPPING
 * 
 * Only governed, actionable, or awareness-critical events belong here.
 * 
 * INCLUDED:
 * - Approvals Required (authority changes, licensing approvals, refund approvals)
 * - Licensing Activity (requests submitted, status changes)
 * - Billing & Payments (failed payments, invoices, refunds)
 * - Authority & Access (role changes, access granted/revoked)
 * - System & Security (escalations, security events, platform incidents)
 * 
 * EXCLUDED (must never appear):
 * - Marketing messages
 * - Product announcements
 * - Tips, hints, tours
 * - "Nice to know" updates
 * - Chat-style messages
 * - Status confirmations requiring no action
 */
const CATEGORIES: Record<GovernanceCategory, CategoryConfig> = {
  approvals: {
    label: "Approvals Required",
    icon: Check,
    types: ["authority_change_proposal", "approval_timeout"],
  },
  licensing: {
    label: "Licensing Activity",
    icon: FileText,
    types: ["licensing_request"],
  },
  billing: {
    label: "Billing & Payments",
    icon: CreditCard,
    types: ["payment_failure", "refund_initiated"],
  },
  authority: {
    label: "Authority & Access",
    icon: Users,
    types: ["membership_change"],
  },
  security: {
    label: "System & Security",
    icon: Shield,
    types: ["security_event", "export_completed"],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// INSTITUTIONAL EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Empty states communicate confidence, not absence.
 * 
 * PRINCIPLES:
 * - Calm, neutral, declarative
 * - No encouragement language
 * - No "you're all caught up!" cheeriness
 * - No gamified phrasing
 * 
 * Institutional systems never celebrate the absence of work.
 * They simply state status.
 */
function InstitutionalEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <h3 
        className="text-[14px] font-medium mb-2"
        style={{ color: 'var(--tribes-text-secondary)' }}
      >
        No pending items
      </h3>
      <p 
        className="text-[12px] max-w-[240px] leading-relaxed"
        style={{ color: 'var(--tribes-text-muted)' }}
      >
        There are no approvals, escalations, or system notices requiring your attention.
      </p>
      <p 
        className="text-[10px] mt-4"
        style={{ color: 'var(--tribes-text-muted)', opacity: 0.7 }}
      >
        This view updates automatically as governed events occur.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getCategoryForType(type: NotificationType): GovernanceCategory {
  for (const [category, config] of Object.entries(CATEGORIES)) {
    if (config.types.includes(type)) {
      return category as GovernanceCategory;
    }
  }
  return "security"; // Default fallback
}

function groupNotificationsByCategory(notifications: Notification[]): Record<GovernanceCategory, Notification[]> {
  const grouped: Record<GovernanceCategory, Notification[]> = {
    approvals: [],
    licensing: [],
    billing: [],
    authority: [],
    security: [],
  };

  for (const notification of notifications) {
    const category = getCategoryForType(notification.notification_type);
    grouped[category].push(notification);
  }

  return grouped;
}

function getHighestPriority(notifications: Notification[]): string {
  const priorities = ["critical", "high", "normal", "low"];
  for (const priority of priorities) {
    if (notifications.some(n => n.priority === priority && !n.read_at)) {
      return priority;
    }
  }
  return "normal";
}

function getOldestPending(notifications: Notification[]): Date | null {
  const unread = notifications.filter(n => !n.read_at);
  if (unread.length === 0) return null;
  return new Date(unread[unread.length - 1].created_at);
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY GROUP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CategoryGroupProps {
  category: GovernanceCategory;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

function CategoryGroup({ category, notifications, onNotificationClick }: CategoryGroupProps) {
  const config = CATEGORIES[category];
  const Icon = config.icon;
  const unreadCount = notifications.filter(n => !n.read_at).length;
  const highestPriority = getHighestPriority(notifications);
  const oldestPending = getOldestPending(notifications);

  if (notifications.length === 0) return null;

  const isEscalated = highestPriority === "critical" || highestPriority === "high";

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'var(--tribes-border)' }}>
      {/* Category Header */}
      <div 
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: 'var(--tribes-text-muted)' }} />
          <span 
            className={cn(
              "text-[12px] tracking-[0.03em]",
              isEscalated && "font-medium"
            )}
            style={{ color: isEscalated ? 'var(--tribes-text)' : 'var(--tribes-text-muted)' }}
          >
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span 
              className="text-[11px] font-medium px-1.5 py-0.5 rounded"
              style={{ 
                backgroundColor: isEscalated ? 'rgba(251, 191, 36, 0.15)' : 'hsl(var(--border))',
                color: isEscalated ? 'hsl(var(--warning, 45 93% 47%))' : 'var(--tribes-text-muted)',
              }}
            >
              {unreadCount}
            </span>
          )}
          {isEscalated && (
            <span 
              className="text-[10px] font-medium"
              style={{ color: 'var(--warning, #fbbf24)' }}
            >
              Escalated
            </span>
          )}
        </div>
      </div>

      {/* Notification Items */}
      <div>
        {notifications.slice(0, 5).map((notification) => (
          <NotificationItem 
            key={notification.id} 
            notification={notification} 
            onClick={() => onNotificationClick(notification)}
          />
        ))}
        {notifications.length > 5 && (
          <div 
            className="px-4 py-2 text-[11px]"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            + {notifications.length - 5} more items
          </div>
        )}
      </div>

      {/* Category Footer */}
      {oldestPending && (
        <div 
          className="px-4 py-2 text-[10px]"
          style={{ color: 'var(--tribes-text-muted)' }}
        >
          Oldest pending: {formatDistanceToNow(oldestPending, { addSuffix: true })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const isUnread = !notification.read_at;
  const isEscalated = notification.priority === "critical" || notification.priority === "high";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 transition-colors",
        "hover:bg-white/[0.03] focus:outline-none focus-visible:bg-white/[0.03]"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        <div className="pt-1.5">
          <div 
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isUnread ? "bg-white/60" : "bg-transparent"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span 
              className={cn(
                "text-[13px] truncate",
                isUnread ? "font-medium" : "font-normal"
              )}
              style={{ color: isUnread ? 'var(--tribes-text)' : 'var(--tribes-text-secondary)' }}
            >
              {notification.title}
            </span>
            {isEscalated && (
              <AlertTriangle size={12} className="shrink-0" style={{ color: 'var(--warning, #fbbf24)' }} />
            )}
          </div>
          <p 
            className="text-[12px] mt-0.5 line-clamp-2"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            {notification.message}
          </p>
          <span 
            className="text-[10px] mt-1 block"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION PANEL CONTENT
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationPanelContentProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
  hasUnread: boolean;
}

function NotificationPanelContent({ 
  notifications, 
  onNotificationClick, 
  onMarkAllRead,
  hasUnread,
}: NotificationPanelContentProps) {
  const grouped = groupNotificationsByCategory(notifications);
  const hasNotifications = notifications.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--tribes-border)' }}
      >
        <span 
          className="text-[12px] font-medium"
          style={{ color: 'var(--tribes-text-muted)' }}
        >
          Notifications
        </span>
        {hasUnread && (
          <button
            onClick={onMarkAllRead}
            className="text-[11px] hover:underline"
            style={{ color: 'var(--tribes-text-muted)' }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      {hasNotifications ? (
        <ScrollArea className="flex-1">
          <div>
            {(Object.keys(CATEGORIES) as GovernanceCategory[]).map((category) => (
              <CategoryGroup
                key={category}
                category={category}
                notifications={grouped[category]}
                onNotificationClick={onNotificationClick}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <InstitutionalEmptyState />
      )}

      {/* Footer */}
      <div 
        className="px-4 py-2 border-t shrink-0"
        style={{ borderColor: 'var(--tribes-border)' }}
      >
        <p 
          className="text-[10px]"
          style={{ color: 'var(--tribes-text-muted)' }}
        >
          Notifications are retained for audit purposes
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION BELL BUTTON
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationBellProps {
  unreadCount: number;
  onClick?: () => void;
}

function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
  const hasUnread = unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full shrink-0",
        "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30",
        "hover:bg-white/[0.05] transition-colors"
      )}
      style={{
        height: 32,
        width: 32,
        minHeight: 32,
        minWidth: 32,
      }}
      aria-label={hasUnread ? `${unreadCount} unread notifications` : "Notifications"}
    >
      <Bell size={ICON_SIZE} strokeWidth={ICON_STROKE} style={{ color: 'var(--tribes-text-muted)' }} />
      {hasUnread && (
        <span 
          className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] font-medium px-0.5"
          style={{
            backgroundColor: 'var(--tribes-text)',
            color: 'var(--tribes-header-bg)',
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN NOTIFICATION CENTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const { data: notifications = [] } = useUserNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  // Don't render if not authenticated
  if (!user) return null;

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read_at) {
      markAsRead.mutate(notification.id);
    }

    // Navigate to governed destination if available
    if (notification.record_type && notification.record_id) {
      setOpen(false);
      // Navigate based on record type
      switch (notification.record_type) {
        case "licensing_request":
          navigate(`/licensing/requests/${notification.record_id}`);
          break;
        case "payment":
          navigate(`/portal/payments/${notification.record_id}`);
          break;
        case "user":
          navigate(`/admin/users/${notification.record_id}`);
          break;
        default:
          // Stay on current page
          break;
      }
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  // Mobile: Full-height sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <NotificationBell unreadCount={unreadCount} />
        </SheetTrigger>
        <SheetContent 
          side="bottom" 
          className="h-[85vh] p-0"
          style={{
            backgroundColor: 'var(--tribes-header-bg)',
            borderColor: 'var(--tribes-border)',
          }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <NotificationPanelContent
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
            hasUnread={unreadCount > 0}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Compact popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <NotificationBell unreadCount={unreadCount} />
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        sideOffset={8}
        className="w-[360px] max-h-[480px] p-0 overflow-hidden"
        style={{
          backgroundColor: 'var(--tribes-header-bg)',
          borderColor: 'var(--tribes-border)',
        }}
      >
        <NotificationPanelContent
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
          hasUnread={unreadCount > 0}
        />
      </PopoverContent>
    </Popover>
  );
}
