import { cn } from "@/lib/utils";
import { AUDIT_LABELS } from "@/styles/tokens";

/**
 * AUDIT TRAIL DISPLAY — WHO, WHAT, WHEN
 * 
 * Rules:
 * - Comprehensive tracking for all sensitive actions
 * - Readable, chronological, immutable
 * - First-class citizen, not hidden in "advanced settings"
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
      <div className={cn("bg-white border border-[#E8E8E8] rounded-md", className)}>
        <div className="px-4 py-3 border-b border-[#E8E8E8]">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B6B6B]">
            {title}
          </h3>
        </div>
        <div className="px-4 py-4">
          <p className="text-[13px] text-[#6B6B6B]">No activity recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border border-[#E8E8E8] rounded-md", className)}>
      <div className="px-4 py-3 border-b border-[#E8E8E8]">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B6B6B]">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-[#F0F0F0]">
        {entries.map((entry) => (
          <AuditEntryRow key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function AuditEntryRow({ entry }: { entry: AuditEntry }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-baseline justify-between gap-4">
        {/* Action and actor */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[#111]">
            <span className="font-medium">{entry.action}</span>
          </p>
          <p className="text-[12px] text-[#6B6B6B] mt-0.5">
            {entry.isSystem ? (
              <span className="font-mono text-[11px]">{AUDIT_LABELS.SYSTEM}</span>
            ) : (
              entry.actor
            )}
            {entry.recordId && (
              <>
                <span className="mx-1.5">·</span>
                <span className="font-mono text-[11px]">{entry.recordId}</span>
              </>
            )}
          </p>
        </div>
        
        {/* Timestamp */}
        <span className="text-[11px] text-[#8A8A8A] shrink-0">
          {entry.timestamp}
        </span>
      </div>
      
      {/* Details if present */}
      {entry.details && (
        <p className="text-[12px] text-[#6B6B6B] mt-2 pl-0">
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
    <p className={cn("text-[12px] text-[#6B6B6B]", className)}>
      <span className="text-[#111]">{action}</span>
      <span className="mx-1.5">·</span>
      <span>{actor}</span>
      <span className="mx-1.5">·</span>
      <span className="text-[#8A8A8A]">{timestamp}</span>
    </p>
  );
}
