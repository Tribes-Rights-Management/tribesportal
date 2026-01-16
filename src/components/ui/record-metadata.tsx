import { cn } from "@/lib/utils";
import { RECORD_LABELS, TRUST_LABELS, DISCLAIMERS } from "@/styles/tokens";

/**
 * RECORD METADATA DISPLAY — DATA IMMUTABILITY
 * 
 * Rules:
 * - Display record ID and version prominently
 * - Show "Effective as of" dates
 * - Prevent silent overwrites
 * - The system must behave like a registry, not a spreadsheet
 */

interface RecordMetadataProps {
  recordId: string;
  version?: number;
  effectiveDate?: string;
  createdAt?: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;
  className?: string;
}

/**
 * Displays canonical record metadata with version info
 */
export function RecordMetadata({
  recordId,
  version,
  effectiveDate,
  createdAt,
  createdBy,
  modifiedAt,
  modifiedBy,
  className,
}: RecordMetadataProps) {
  return (
    <div className={cn("text-[12px] text-[#6B6B6B] space-y-1", className)}>
      {/* Record ID - always prominent */}
      <div className="flex items-baseline gap-2">
        <span className="text-[#8A8A8A]">{RECORD_LABELS.RECORD_ID}</span>
        <span className="font-mono text-[11px] text-[#111]">{recordId}</span>
      </div>
      
      {/* Version - if applicable */}
      {version !== undefined && (
        <div className="flex items-baseline gap-2">
          <span className="text-[#8A8A8A]">{RECORD_LABELS.CURRENT_VERSION}</span>
          <span className="text-[#111]">v{version}</span>
        </div>
      )}
      
      {/* Effective date */}
      {effectiveDate && (
        <div className="flex items-baseline gap-2">
          <span className="text-[#8A8A8A]">{RECORD_LABELS.EFFECTIVE_AS_OF}</span>
          <span className="text-[#111]">{effectiveDate}</span>
        </div>
      )}
      
      {/* Created */}
      {createdAt && (
        <div className="flex items-baseline gap-2">
          <span className="text-[#8A8A8A]">{RECORD_LABELS.CREATED_AT}</span>
          <span>{createdAt}</span>
          {createdBy && <span>by {createdBy}</span>}
        </div>
      )}
      
      {/* Modified */}
      {modifiedAt && (
        <div className="flex items-baseline gap-2">
          <span className="text-[#8A8A8A]">{RECORD_LABELS.LAST_MODIFIED}</span>
          <span>{modifiedAt}</span>
          {modifiedBy && <span>by {modifiedBy}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * TRUST SIGNAL INDICATOR — QUIET, STRUCTURAL
 * 
 * Rules:
 * - Subtle, noticed subconsciously
 * - No badges or trophies
 * - Restrained typographic indicators
 */

type TrustLevel = "verified" | "official" | "pending" | "unverified";

interface TrustSignalProps {
  level: TrustLevel;
  label?: string;
  className?: string;
}

export function TrustSignal({ level, label, className }: TrustSignalProps) {
  const defaultLabels: Record<TrustLevel, string> = {
    verified: TRUST_LABELS.VERIFIED,
    official: TRUST_LABELS.OFFICIAL_RECORD,
    pending: TRUST_LABELS.PENDING_VERIFICATION,
    unverified: TRUST_LABELS.UNVERIFIED,
  };
  
  return (
    <span
      className={cn(
        "text-[11px] uppercase tracking-[0.04em] font-medium",
        level === "verified" && "text-[#166534]",
        level === "official" && "text-[#111]",
        level === "pending" && "text-[#B45309]",
        level === "unverified" && "text-[#6B6B6B]",
        className
      )}
    >
      {label || defaultLabels[level]}
    </span>
  );
}

/**
 * SYSTEM DISCLAIMER — PRECISION OVER LEGAL FLUFF
 * 
 * Rules:
 * - One sentence max
 * - Neutral tone
 * - No legal overexplanation
 */

interface DisclaimerProps {
  type: keyof typeof DISCLAIMERS;
  className?: string;
}

export function Disclaimer({ type, className }: DisclaimerProps) {
  return (
    <p className={cn("text-[11px] text-[#8A8A8A] italic", className)}>
      {DISCLAIMERS[type]}
    </p>
  );
}

/**
 * VERSION BADGE — STRUCTURAL INDICATOR
 * 
 * Shows version number with superseded state if applicable
 */

interface VersionBadgeProps {
  version: number;
  isCurrent?: boolean;
  className?: string;
}

export function VersionBadge({ version, isCurrent = true, className }: VersionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded",
        isCurrent
          ? "bg-[#F5F5F5] text-[#111]"
          : "bg-[#F5F5F5] text-[#8A8A8A] line-through",
        className
      )}
    >
      v{version}
      {!isCurrent && (
        <span className="ml-1.5 no-underline text-[#B45309]">
          {RECORD_LABELS.SUPERSEDED}
        </span>
      )}
    </span>
  );
}
