import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { EXPORT_LABELS } from "@/styles/tokens";

/**
 * EXPORT BUTTON — CHAIN OF CUSTODY (INSTITUTIONAL DARK THEME)
 * 
 * Rules:
 * - Exports include record IDs
 * - Include generation timestamp
 * - Identify exporting account
 * - No celebration, no download animations
 * - Exports must feel admissible and verifiable
 * - Dark theme to match platform canvas
 */

interface ExportButtonProps {
  label?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ExportButton({
  label = EXPORT_LABELS.EXPORT_RECORD,
  onClick,
  loading = false,
  disabled = false,
  className,
}: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-2 h-9 px-3 rounded-md",
        "text-[13px] font-medium",
        "border transition-colors duration-[150ms]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/10",
        className
      )}
      style={{
        backgroundColor: 'var(--platform-surface-2)',
        borderColor: 'var(--platform-border)',
        color: disabled || loading ? 'var(--platform-text-muted)' : 'var(--platform-text)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = 'var(--platform-surface-3)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--platform-surface-2)';
      }}
    >
      <Download className="h-4 w-4" strokeWidth={1.5} />
      {loading ? EXPORT_LABELS.PREPARING_EXPORT : label}
    </button>
  );
}

/**
 * EXPORT CONFIRMATION — File available message
 * 
 * No celebration, just factual confirmation
 * Dark theme styling
 */
interface ExportConfirmationProps {
  fileName: string;
  generatedAt: string;
  generatedBy?: string;
  exportId?: string;
  className?: string;
}

export function ExportConfirmation({
  fileName,
  generatedAt,
  generatedBy,
  exportId,
  className,
}: ExportConfirmationProps) {
  return (
    <div 
      className={cn("text-[12px] space-y-1", className)}
      style={{ color: 'var(--platform-text-muted)' }}
    >
      <p 
        className="text-[13px] font-medium"
        style={{ color: 'var(--platform-text)' }}
      >
        {EXPORT_LABELS.EXPORT_GENERATED}
      </p>
      <p 
        className="font-mono text-[11px]"
        style={{ color: 'var(--platform-text-secondary)' }}
      >
        {fileName}
      </p>
      <div className="flex items-baseline gap-3 mt-1">
        <span>
          <span style={{ color: 'var(--platform-text-muted)' }}>{EXPORT_LABELS.GENERATED_AT}</span>{" "}
          <span style={{ color: 'var(--platform-text-secondary)' }}>{generatedAt}</span>
        </span>
        {generatedBy && (
          <span>
            <span style={{ color: 'var(--platform-text-muted)' }}>{EXPORT_LABELS.GENERATED_BY}</span>{" "}
            <span style={{ color: 'var(--platform-text-secondary)' }}>{generatedBy}</span>
          </span>
        )}
      </div>
      {exportId && (
        <p 
          className="font-mono text-[10px]"
          style={{ color: 'var(--platform-text-muted)' }}
        >
          {EXPORT_LABELS.EXPORT_ID}: {exportId}
        </p>
      )}
    </div>
  );
}

/**
 * REPORT GENERATION BUTTON — For reports/summaries
 * Primary action styling, dark theme
 */
interface GenerateReportButtonProps {
  label?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function GenerateReportButton({
  label = EXPORT_LABELS.GENERATE_REPORT,
  onClick,
  loading = false,
  disabled = false,
  className,
}: GenerateReportButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md",
        "text-[13px] font-medium",
        "transition-colors duration-[150ms]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2",
        className
      )}
      style={{
        backgroundColor: disabled || loading ? 'var(--platform-surface-2)' : 'var(--platform-text)',
        color: disabled || loading ? 'var(--platform-text-muted)' : 'var(--platform-canvas)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.opacity = '0.9';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = disabled || loading ? '0.6' : '1';
      }}
    >
      {loading ? EXPORT_LABELS.PREPARING_EXPORT : label}
    </button>
  );
}

/**
 * PDF DOCUMENT HEADER — For exported PDFs
 * Institutional standard header structure
 */
export interface PDFHeaderData {
  documentTitle: string;
  generatedDate: string;
  pageNumber?: number;
  totalPages?: number;
}

/**
 * PDF DOCUMENT FOOTER — For exported PDFs
 * Chain of custody footer
 */
export interface PDFFooterData {
  pageNumber: number;
  totalPages: number;
  generatedBy?: string;
}

/**
 * CSV EXPORT CONFIG — Column naming standards
 */
export const CSV_EXPORT_STANDARDS = {
  // Column naming: Title Case, no symbols
  formatColumnName: (name: string): string => {
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },
  // File naming: lowercase, dashes, timestamp
  formatFileName: (prefix: string, extension: 'csv' | 'pdf' = 'csv'): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${extension}`;
  },
} as const;
