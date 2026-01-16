import { cn } from "@/lib/utils";
import { BUTTON_LABELS, AUDIT_COPY } from "@/constants/institutional-copy";

/**
 * APPROVAL DIFF SCREEN — INSTITUTIONAL GOVERNANCE STANDARD
 * 
 * Every approval must be defensible after the fact.
 * The approver should know exactly what they are approving.
 * 
 * WHEN REQUIRED:
 * - Access approvals
 * - Contract changes
 * - Licensing result changes
 * - Metadata changes that affect rights, payments, or visibility
 * 
 * LAYOUT:
 * - Two-column comparison (Before | After)
 * - Fixed-width layout, no cards
 * - Scroll locked together
 * 
 * DIFF RULES:
 * - Changed fields only (unchanged hidden by default)
 * - Highlight changes with subtle background tint
 * - No green/red language
 */

export interface DiffField {
  label: string;
  before: string | null;
  after: string | null;
}

export interface ApprovalDiffMetadata {
  recordType: string;
  recordId?: string;
  submittedBy: string;
  submittedOn: string;
  organization?: string;
  reason?: string;
}

interface ApprovalDiffProps {
  metadata: ApprovalDiffMetadata;
  fields: DiffField[];
  onApprove: () => void;
  onDecline: () => void;
  onReturnForClarification?: () => void;
  processing?: boolean;
  className?: string;
}

export function ApprovalDiff({
  metadata,
  fields,
  onApprove,
  onDecline,
  onReturnForClarification,
  processing = false,
  className,
}: ApprovalDiffProps) {
  // Filter to only show changed fields
  const changedFields = fields.filter(
    (field) => field.before !== field.after
  );

  return (
    <div className={cn("w-full", className)}>
      {/* Metadata Header - Always Visible */}
      <div 
        className="px-6 py-4 mb-6"
        style={{ 
          backgroundColor: 'var(--platform-surface)',
          border: '1px solid var(--platform-border)',
          borderRadius: '6px'
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetadataField label="Record type" value={metadata.recordType} />
          {metadata.recordId && (
            <MetadataField label="Record ID" value={metadata.recordId} mono />
          )}
          <MetadataField label="Submitted by" value={metadata.submittedBy} />
          <MetadataField label="Submitted on" value={metadata.submittedOn} />
          {metadata.organization && (
            <MetadataField label="Organization" value={metadata.organization} />
          )}
        </div>
        {metadata.reason && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--platform-border)' }}>
            <p 
              className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Reason for change
            </p>
            <p 
              className="text-[14px]"
              style={{ color: 'var(--platform-text-secondary)' }}
            >
              {metadata.reason}
            </p>
          </div>
        )}
      </div>

      {/* Two-Column Diff Comparison */}
      <div 
        className="overflow-hidden"
        style={{ 
          border: '1px solid var(--platform-border)',
          borderRadius: '6px'
        }}
      >
        {/* Column Headers */}
        <div 
          className="grid grid-cols-2"
          style={{ borderBottom: '1px solid var(--platform-border)' }}
        >
          <div 
            className="px-6 py-3"
            style={{ 
              backgroundColor: 'var(--platform-surface)',
              borderRight: '1px solid var(--platform-border)'
            }}
          >
            <span 
              className="text-[11px] font-medium uppercase tracking-[0.04em]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Before
            </span>
          </div>
          <div 
            className="px-6 py-3"
            style={{ backgroundColor: 'var(--platform-surface-2)' }}
          >
            <span 
              className="text-[11px] font-medium uppercase tracking-[0.04em]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              After
            </span>
          </div>
        </div>

        {/* Diff Rows */}
        <div style={{ backgroundColor: 'var(--platform-surface)' }}>
          {changedFields.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p 
                className="text-[14px]"
                style={{ color: 'var(--platform-text-secondary)' }}
              >
                No changes detected
              </p>
            </div>
          ) : (
            changedFields.map((field, index) => (
              <DiffRow 
                key={field.label} 
                field={field} 
                isLast={index === changedFields.length - 1}
              />
            ))
          )}
        </div>
      </div>

      {/* Audit Note */}
      <p 
        className="mt-4 text-[12px]"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        {AUDIT_COPY.APPROVAL_LOGGED}
      </p>

      {/* Actions */}
      <div 
        className="flex items-center gap-3 mt-6 pt-6"
        style={{ borderTop: '1px solid var(--platform-border)' }}
      >
        <button
          onClick={onApprove}
          disabled={processing}
          className="px-5 py-2.5 text-[14px] font-medium rounded-md transition-colors"
          style={{
            backgroundColor: 'var(--platform-accent)',
            color: 'var(--platform-canvas)',
          }}
        >
          {processing ? 'Processing...' : BUTTON_LABELS.APPROVE}
        </button>
        <button
          onClick={onDecline}
          disabled={processing}
          className="px-5 py-2.5 text-[14px] font-medium rounded-md transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--platform-text-secondary)',
            border: '1px solid var(--platform-border)'
          }}
        >
          {BUTTON_LABELS.DECLINE}
        </button>
        {onReturnForClarification && (
          <button
            onClick={onReturnForClarification}
            disabled={processing}
            className="px-5 py-2.5 text-[14px] font-medium rounded-md transition-colors ml-auto"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--platform-text-muted)',
            }}
          >
            Return for clarification
          </button>
        )}
      </div>
    </div>
  );
}

function MetadataField({ 
  label, 
  value, 
  mono 
}: { 
  label: string; 
  value: string; 
  mono?: boolean;
}) {
  return (
    <div>
      <p 
        className="text-[11px] font-medium uppercase tracking-[0.04em] mb-0.5"
        style={{ color: 'var(--platform-text-muted)' }}
      >
        {label}
      </p>
      <p 
        className={cn(
          "text-[14px]",
          mono && "font-mono text-[13px]"
        )}
        style={{ color: 'var(--platform-text)' }}
      >
        {value}
      </p>
    </div>
  );
}

function DiffRow({ 
  field, 
  isLast 
}: { 
  field: DiffField; 
  isLast: boolean;
}) {
  const hasChange = field.before !== field.after;
  
  return (
    <div 
      className="grid grid-cols-2"
      style={{ borderBottom: isLast ? undefined : '1px solid var(--platform-border)' }}
    >
      {/* Before Column */}
      <div 
        className="px-6 py-4"
        style={{ borderRight: '1px solid var(--platform-border)' }}
      >
        <p 
          className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          {field.label}
        </p>
        <p 
          className="text-[14px]"
          style={{ color: 'var(--platform-text-secondary)' }}
        >
          {field.before ?? '—'}
        </p>
      </div>
      
      {/* After Column */}
      <div 
        className="px-6 py-4"
        style={{ 
          backgroundColor: hasChange ? 'rgba(255,255,255,0.02)' : undefined 
        }}
      >
        <p 
          className="text-[11px] font-medium uppercase tracking-[0.04em] mb-1"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          {field.label}
        </p>
        <p 
          className="text-[14px]"
          style={{ color: 'var(--platform-text)' }}
        >
          {field.after ?? '—'}
        </p>
      </div>
    </div>
  );
}

/**
 * APPROVAL DIFF SUMMARY — Compact inline diff for list views
 */
interface ApprovalDiffSummaryProps {
  changesCount: number;
  primaryChange?: string;
  className?: string;
}

export function ApprovalDiffSummary({ 
  changesCount, 
  primaryChange,
  className 
}: ApprovalDiffSummaryProps) {
  return (
    <span 
      className={cn("text-[13px]", className)}
      style={{ color: 'var(--platform-text-secondary)' }}
    >
      {changesCount} field{changesCount !== 1 ? 's' : ''} changed
      {primaryChange && (
        <span style={{ color: 'var(--platform-text-muted)' }}>
          {' '}— {primaryChange}
        </span>
      )}
    </span>
  );
}
