import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * CORRELATION CHAIN VIEW — PHASE 10 CROSS-WORKSPACE TRACING
 * 
 * Displays a chronological sequence of events linked by correlation ID.
 * Read-only for auditors, full visibility for platform admins.
 * 
 * Uses formal verbs only: Submitted, Approved, Executed, Granted, Exported
 */

export interface ChainEvent {
  event_type: string;
  event_id: string;
  event_timestamp: string;
  actor: string;
  action: string;
  record_type: string;
  record_id: string | null;
  tenant_id: string | null;
  details: Record<string, any> | null;
}

interface CorrelationChainViewProps {
  correlationId: string;
  events: ChainEvent[];
  loading?: boolean;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  licensing_request: 'Licensing Request',
  licensing_agreement: 'Licensing Agreement',
  audit_event: 'System Event',
  access_event: 'Access Event',
};

const RECORD_TYPE_LABELS: Record<string, string> = {
  licensing_request: 'Request',
  licensing_agreement: 'Agreement',
  disclosure_export: 'Export',
  user_profile: 'User',
  tenant_membership: 'Membership',
  system: 'System',
};

export function CorrelationChainView({ 
  correlationId, 
  events, 
  loading 
}: CorrelationChainViewProps) {
  if (loading) {
    return (
      <div 
        className="py-12 text-center"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        Loading correlation chain
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div 
        className="py-12 text-center"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        No events found for this correlation ID
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Chain Header */}
      <div 
        className="mb-6 px-4 py-3 rounded-md"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--platform-border)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p 
              className="text-[12px] uppercase tracking-wide mb-1"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Correlation ID
            </p>
            <code 
              className="text-[14px] font-mono font-medium"
              style={{ color: 'var(--platform-text)' }}
            >
              {correlationId}
            </code>
          </div>
          <div className="text-right">
            <p 
              className="text-[12px] uppercase tracking-wide mb-1"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Events
            </p>
            <span 
              className="text-[14px] font-medium"
              style={{ color: 'var(--platform-text)' }}
            >
              {events.length}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div 
          className="absolute left-[19px] top-0 bottom-0 w-px"
          style={{ backgroundColor: 'var(--platform-border)' }}
        />

        {events.map((event, index) => (
          <ChainEventRow 
            key={event.event_id} 
            event={event} 
            isFirst={index === 0}
            isLast={index === events.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

interface ChainEventRowProps {
  event: ChainEvent;
  isFirst: boolean;
  isLast: boolean;
}

function ChainEventRow({ event, isFirst, isLast }: ChainEventRowProps) {
  const formattedDate = new Date(event.event_timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline dot */}
      <div 
        className={cn(
          "relative z-10 w-[10px] h-[10px] rounded-full mt-1.5 ml-[14px]",
          isFirst ? "bg-white" : "bg-[var(--platform-text-muted)]"
        )}
        style={{ 
          border: '2px solid var(--platform-border)',
          backgroundColor: isFirst ? 'white' : undefined
        }}
      />

      {/* Event content */}
      <div 
        className="flex-1 px-4 py-3 rounded-md"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--platform-border)'
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <span 
              className="text-[14px] font-medium"
              style={{ color: 'var(--platform-text)' }}
            >
              {event.action}
            </span>
            <span 
              className="text-[13px] ml-2"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              {RECORD_TYPE_LABELS[event.record_type] || event.record_type}
            </span>
          </div>
          <span 
            className="text-[12px] font-mono"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            {formattedDate}
          </span>
        </div>

        {/* Actor */}
        <div className="mb-2">
          <span 
            className="text-[12px] uppercase tracking-wide mr-2"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Actor
          </span>
          <span 
            className="text-[13px]"
            style={{ color: 'var(--platform-text)' }}
          >
            {event.actor}
          </span>
        </div>

        {/* Details */}
        {event.details && Object.keys(event.details).length > 0 && (
          <div 
            className="mt-3 pt-3"
            style={{ borderTop: '1px solid var(--platform-border)' }}
          >
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(event.details)
                .filter(([_, value]) => value !== null && value !== undefined)
                .map(([key, value]) => (
                  <div key={key}>
                    <span 
                      className="text-[11px] uppercase tracking-wide block"
                      style={{ color: 'var(--platform-text-muted)' }}
                    >
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span 
                      className="text-[13px]"
                      style={{ color: 'var(--platform-text)' }}
                    >
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Record ID */}
        {event.record_id && (
          <div className="mt-2">
            <span 
              className="text-[11px] font-mono"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              {event.record_id}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact chain summary for inline display
 */
interface ChainSummaryProps {
  correlationId: string;
  eventCount: number;
  onClick?: () => void;
}

export function ChainSummary({ correlationId, eventCount, onClick }: ChainSummaryProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-2 py-1 rounded text-left hover:bg-white/[0.04] transition-colors"
      style={{ border: '1px solid var(--platform-border)' }}
    >
      <code 
        className="text-[11px] font-mono"
        style={{ color: 'var(--platform-text)' }}
      >
        {correlationId}
      </code>
      <span 
        className="text-[11px]"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        {eventCount} event{eventCount !== 1 ? 's' : ''}
      </span>
    </button>
  );
}
