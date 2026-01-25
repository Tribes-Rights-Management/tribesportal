import { cn } from "@/lib/utils";
import { Download, Loader2 } from "lucide-react";
import { EXPORT_LABELS } from "@/styles/tokens";
import { AppButton } from "@/components/app-ui";

/**
 * EXPORT BUTTON — CHAIN OF CUSTODY (UNIFIED MERCURY STYLE)
 * 
 * Rules:
 * - Exports include record IDs
 * - Include generation timestamp
 * - Identify exporting account
 * - No celebration, no download animations
 * - Exports must feel admissible and verifiable
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
    <AppButton
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      intent="secondary"
      size="sm"
      icon={<Download />}
      className={className}
    >
      {loading ? EXPORT_LABELS.PREPARING_EXPORT : label}
    </AppButton>
  );
}

/**
 * EXPORT CONFIRMATION — File available message
 * 
 * No celebration, just factual confirmation
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
    <div className={cn("text-[12px] space-y-1 text-muted-foreground", className)}>
      <p className="text-[13px] font-medium text-foreground">
        {EXPORT_LABELS.EXPORT_GENERATED}
      </p>
      <p className="font-mono text-[11px] text-muted-foreground">
        {fileName}
      </p>
      <div className="flex items-baseline gap-3 mt-1">
        <span>
          <span className="text-muted-foreground">{EXPORT_LABELS.GENERATED_AT}</span>{" "}
          <span className="text-muted-foreground">{generatedAt}</span>
        </span>
        {generatedBy && (
          <span>
            <span className="text-muted-foreground">{EXPORT_LABELS.GENERATED_BY}</span>{" "}
            <span className="text-muted-foreground">{generatedBy}</span>
          </span>
        )}
      </div>
      {exportId && (
        <p className="font-mono text-[10px] text-muted-foreground">
          {EXPORT_LABELS.EXPORT_ID}: {exportId}
        </p>
      )}
    </div>
  );
}

/**
 * REPORT GENERATION BUTTON — For reports/summaries
 * Primary action styling
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
    <AppButton
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      loadingText={EXPORT_LABELS.PREPARING_EXPORT}
      intent="primary"
      size="md"
      className={className}
    >
      {label}
    </AppButton>
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
