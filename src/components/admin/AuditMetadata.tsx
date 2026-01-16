import { format } from "date-fns";

interface AuditMetadataProps {
  createdAt: string;
  updatedAt: string;
  grantedBy?: string;
  grantedAt?: string;
}

/**
 * AUDIT METADATA — ALWAYS VISIBLE GOVERNANCE TRAIL
 * 
 * Design Rules:
 * - Non-optional visibility
 * - No accordions to hide info
 * - Who, when, what changed
 * - Effective status always shown
 */
export function AuditMetadata({
  createdAt,
  updatedAt,
  grantedBy,
  grantedAt,
}: AuditMetadataProps) {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM d, yyyy 'at' HH:mm");
    } catch {
      return date;
    }
  };

  return (
    <section className="mb-8">
      <h2 
        className="text-[10px] font-medium uppercase tracking-[0.08em] mb-4"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        Audit Metadata
      </h2>
      <div 
        className="rounded p-5"
        style={{ 
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)'
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p 
              className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Record Created
            </p>
            <p 
              className="text-[13px] font-mono"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {formatDate(createdAt)}
            </p>
          </div>
          <div>
            <p 
              className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Last Modified
            </p>
            <p 
              className="text-[13px] font-mono"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {formatDate(updatedAt)}
            </p>
          </div>
          {grantedBy && (
            <div>
              <p 
                className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                Granted By
              </p>
              <p 
                className="text-[13px]"
                style={{ color: 'var(--platform-text-secondary)' }}
              >
                {grantedBy}
              </p>
            </div>
          )}
          {grantedAt && (
            <div>
              <p 
                className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
                style={{ color: 'var(--platform-text-muted)' }}
              >
                Granted On
              </p>
              <p 
                className="text-[13px] font-mono"
                style={{ color: 'var(--platform-text-secondary)' }}
              >
                {formatDate(grantedAt)}
              </p>
            </div>
          )}
          <div className="col-span-2">
            <p 
              className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Effective Status
            </p>
            <p 
              className="text-[13px]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              Changes effective immediately upon confirmation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
