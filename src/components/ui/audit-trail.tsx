import { cn } from "@/lib/utils";
import { AUDIT_LABELS } from "@/styles/tokens";

/**
 * AUDIT TRAIL DISPLAY — WHO, WHAT, WHEN (DARK CANVAS)
 * 
 * Rules:
 * - Comprehensive tracking for all sensitive actions
 * - Readable, chronological, immutable
 * - First-class citizen, not hidden in "advanced settings"
 * - Dark theme consistent with platform canvas
 */

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  recordId?: string;
  recordType?: string;
  details?: string;
  isSystem?: boolean;
}

interface AuditTrailProps {
  entries: AuditEntry[];
  title?: string;
  className?: string;
}

/**
 * Displays audit trail entries in chronological order
 */
export function AuditTrail({
  entries,
  title = AUDIT_LABELS.AUDIT_TRAIL,
  className,
}: AuditTrailProps) {
  if (entries.length === 0) {
    return (
      <div 
        className={cn("rounded overflow-hidden", className)}
        style={{ 
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)'
        }}
      >
        <div 
          className="px-4 py-3"
          style={{ borderBottom: '1px solid var(--platform-border)' }}
        >
          <h3 
            className="text-[10px] font-medium uppercase tracking-[0.04em]"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            {title}
          </h3>
        </div>
        <div className="px-4 py-6 text-center">
          <p 
            className="text-[14px] font-medium"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            No activity recorded
          </p>
          <p 
            className="text-[13px] mt-1"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Events will appear once actions are performed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("rounded overflow-hidden", className)}
      style={{ 
        backgroundColor: 'var(--platform-surface)',
        border: '1px solid var(--platform-border)'
      }}
    >
      <div 
        className="px-4 py-3"
        style={{ borderBottom: '1px solid var(--platform-border)' }}
      >
        <h3 
          className="text-[10px] font-medium uppercase tracking-[0.04em]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          {title}
        </h3>
      </div>
      <div>
        {entries.map((entry, index) => (
          <AuditEntryRow key={entry.id} entry={entry} isLast={index === entries.length - 1} />
        ))}
      </div>
    </div>
  );
}

function AuditEntryRow({ entry, isLast }: { entry: AuditEntry; isLast?: boolean }) {
  return (
    <div 
      className="px-4 py-3"
      style={{ borderBottom: isLast ? undefined : '1px solid var(--platform-border)' }}
    >
      <div className="flex items-baseline justify-between gap-4">
        {/* Action and actor */}
        <div className="flex-1 min-w-0">
          <p 
            className="text-[13px]"
            style={{ color: 'var(--platform-text)' }}
          >
            <span className="font-medium">{entry.action}</span>
          </p>
          <p 
            className="text-[12px] mt-0.5"
            style={{ color: 'var(--platform-text-secondary)' }}
          >
            {entry.isSystem ? (
              <span className="font-mono text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
                {AUDIT_LABELS.SYSTEM}
              </span>
            ) : (
              entry.actor
            )}
            {entry.recordId && (
              <>
                <span className="mx-1.5">·</span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--platform-text-muted)' }}>
                  {entry.recordId}
                </span>
              </>
            )}
          </p>
        </div>
        
        {/* Timestamp */}
        <span 
          className="text-[11px] shrink-0"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          {entry.timestamp}
        </span>
      </div>
      
      {/* Details if present */}
      {entry.details && (
        <p 
          className="text-[12px] mt-2 pl-0"
          style={{ color: 'var(--platform-text-secondary)' }}
        >
          {entry.details}
        </p>
      )}
    </div>
  );
}

/**
 * COMPACT AUDIT LINE — For inline display
 */
interface AuditLineProps {
  action: string;
  actor: string;
  timestamp: string;
  className?: string;
}

export function AuditLine({ action, actor, timestamp, className }: AuditLineProps) {
  return (
    <p className={cn("text-[12px]", className)} style={{ color: 'var(--platform-text-secondary)' }}>
      <span style={{ color: 'var(--platform-text)' }}>{action}</span>
      <span className="mx-1.5">·</span>
      <span>{actor}</span>
      <span className="mx-1.5">·</span>
      <span style={{ color: 'var(--platform-text-muted)' }}>{timestamp}</span>
    </p>
  );
}
