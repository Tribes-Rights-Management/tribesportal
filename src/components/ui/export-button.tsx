import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { EXPORT_LABELS } from "@/styles/tokens";

/**
 * EXPORT BUTTON — CHAIN OF CUSTODY
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
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-2 h-9 px-3 rounded-md",
        "text-[13px] font-medium",
        "bg-white border border-[#E5E5E5]",
        "text-[#111] hover:bg-[#F5F5F5]",
        "disabled:text-[#8A8A8A] disabled:bg-[#FAFAFA] disabled:cursor-not-allowed",
        "transition-colors duration-[180ms]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
        className
      )}
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
    <div className={cn("text-[12px] text-[#6B6B6B] space-y-1", className)}>
      <p className="text-[13px] text-[#111] font-medium">
        {EXPORT_LABELS.EXPORT_GENERATED}
      </p>
      <p className="font-mono text-[11px]">{fileName}</p>
      <div className="flex items-baseline gap-3 mt-1">
        <span>
          <span className="text-[#8A8A8A]">{EXPORT_LABELS.GENERATED_AT}</span>{" "}
          {generatedAt}
        </span>
        {generatedBy && (
          <span>
            <span className="text-[#8A8A8A]">{EXPORT_LABELS.GENERATED_BY}</span>{" "}
            {generatedBy}
          </span>
        )}
      </div>
      {exportId && (
        <p className="font-mono text-[10px] text-[#8A8A8A]">
          {EXPORT_LABELS.EXPORT_ID}: {exportId}
        </p>
      )}
    </div>
  );
}

/**
 * REPORT GENERATION BUTTON — For reports/summaries
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
        "bg-[#111] text-white hover:bg-[#1a1a1a]",
        "disabled:bg-[#E5E5E5] disabled:text-[#8A8A8A] disabled:cursor-not-allowed",
        "transition-colors duration-[180ms]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2",
        className
      )}
    >
      {loading ? EXPORT_LABELS.PREPARING_EXPORT : label}
    </button>
  );
}
