import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL STATE COMPONENTS — ACQUISITION-GRADE
 * 
 * PHASE 5 DESIGN STANDARD (AUTHORITATIVE):
 * 
 * PERFORMANCE CUES — PREDICTABLE, NOT FAST:
 * - No spinners that imply urgency
 * - No playful loading indicators
 * - Restrained, text-based system feedback
 * - Avoid abrupt UI changes
 * - System feels reliable, not reactive
 * 
 * LATENCY HANDLING — CALM UNDER LOAD:
 * - No apologetic language
 * - No error dramatization
 * - No retries presented as suggestions
 * - Timeouts: explicit, clearly labeled, no surprise failures
 * 
 * EDGE CASES — NO SURPRISE STATES:
 * - Empty datasets, partial permissions, expired sessions, missing upstream data
 * - All are expected system states, handled calmly
 * - Language: neutral, informational
 * 
 * MICROCOPY — QUIET CONFIDENCE:
 * - Short, neutral, declarative
 * - Avoid encouragement, confirmation fluff, "You're all set"
 * - Prefer: "Complete", "Submitted", "Recorded"
 * - Language assumes competence
 */

interface StateContainerProps {
  children: React.ReactNode;
  className?: string;
}

function StateContainer({ children, className }: StateContainerProps) {
  return (
    <div className={cn("py-12 text-center", className)}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING STATES — PREDICTABLE, NOT FAST
// ═══════════════════════════════════════════════════════════════════════════

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Standard loading state — text-based, no spinner
 * Default: "Loading data" (not "Loading..." which implies urgency)
 */
export function LoadingState({ 
  message = "Loading data", 
  className 
}: LoadingStateProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</p>
    </StateContainer>
  );
}

/**
 * Inline loading text — for use within other components
 */
export function LoadingStateInline({ 
  message = "Loading data" 
}: { message?: string }) {
  return (
    <span className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</span>
  );
}

/**
 * Processing state — for operations in progress
 * Use: "Applying changes", "Operation in progress", "Processing request"
 */
export function ProcessingState({
  message = "Applying changes",
  className
}: LoadingStateProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</p>
    </StateContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATES — EXPECTED SYSTEM STATE (INSTITUTIONAL STANDARD)
//
// Structure:
// - Title (1 line) — declarative status
// - Description (1 sentence) — system explanation
// - Note (optional, muted) — availability/permission context
//
// NEVER include: illustrations, icons, CTAs, "Get started", "Coming soon"
// ═══════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  /** Primary title — declarative, not encouraging */
  title?: string;
  /** System explanation — calm, factual */
  description?: string;
  /** Optional note — permission/availability context */
  note?: string;
  /** Legacy single-line message (deprecated, use title+description) */
  message?: string;
  className?: string;
}

/**
 * Standard empty state — institutional, calm, expected
 * 
 * Canonical copy:
 * - Generic: "No records available." / "This area will populate once data is available."
 * - Tables: "No entries found." / "No records currently meet the selected criteria."
 * - Permissions: "No access changes recorded." / "Permission updates will appear here once applied."
 * - Reports: "No activity recorded." / "Reporting data will appear once transactions are processed."
 * - Admin: "System operational." / "No outstanding items require attention at this time."
 */
export function EmptyState({ 
  title = "No records available",
  description = "This area will populate once data is available.",
  note,
  message,
  className 
}: EmptyStateProps) {
  // Legacy support: if only message is provided, use it as title
  if (message && !title) {
    return (
      <StateContainer className={className}>
        <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</p>
      </StateContainer>
    );
  }

  return (
    <StateContainer className={className}>
      <p className="text-[14px] font-medium" style={{ color: 'var(--platform-text-secondary)' }}>
        {title}
      </p>
      <p className="text-[13px] mt-1" style={{ color: 'var(--platform-text-muted)' }}>
        {description}
      </p>
      {note && (
        <p className="text-[12px] mt-2" style={{ color: 'var(--platform-text-muted)', opacity: 0.7 }}>
          {note}
        </p>
      )}
    </StateContainer>
  );
}

/**
 * Table-specific empty state — maintains table structure
 */
export function TableEmptyState({ 
  title = "No entries found",
  description = "No records currently meet the selected criteria.",
  note,
  message,
  colSpan = 1 
}: { 
  title?: string;
  description?: string;
  note?: string;
  message?: string;
  colSpan?: number;
}) {
  // Legacy support
  if (message) {
    return (
      <tr>
        <td colSpan={colSpan} className="py-12 text-center">
          <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</p>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center">
        <p className="text-[14px] font-medium" style={{ color: 'var(--platform-text-secondary)' }}>
          {title}
        </p>
        <p className="text-[13px] mt-1" style={{ color: 'var(--platform-text-muted)' }}>
          {description}
        </p>
        {note && (
          <p className="text-[12px] mt-2" style={{ color: 'var(--platform-text-muted)', opacity: 0.7 }}>
            {note}
          </p>
        )}
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR STATES — CALM UNDER LOAD
// ═══════════════════════════════════════════════════════════════════════════

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Standard error state — no dramatization, no apology
 * Default: "Operation failed."
 * Retries are presented as actions, not suggestions
 */
export function ErrorState({ 
  message = "Operation failed.", 
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-[13px] font-medium transition-colors duration-75"
          style={{ color: 'var(--platform-text)' }}
        >
          Retry
        </button>
      )}
    </StateContainer>
  );
}

/**
 * Timeout error state — explicit, labeled
 */
export function TimeoutState({
  message = "Request timeout.",
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-[13px] font-medium transition-colors duration-75"
          style={{ color: 'var(--platform-text)' }}
        >
          Retry
        </button>
      )}
    </StateContainer>
  );
}

/**
 * Connection error state — managed, not accidental
 */
export function ConnectionErrorState({
  message = "Connection unavailable.",
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-[13px] font-medium transition-colors duration-75"
          style={{ color: 'var(--platform-text)' }}
        >
          Retry
        </button>
      )}
    </StateContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION STATES — STRUCTURAL, NOT EXPLAINED
// ═══════════════════════════════════════════════════════════════════════════

interface PermissionDeniedProps {
  className?: string;
}

/**
 * Permission denied state — structural, not negotiable
 */
export function PermissionDenied({ className }: PermissionDeniedProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>Access not authorized.</p>
    </StateContainer>
  );
}

/**
 * Partial permission state — for edge case partial access
 */
export function PartialAccess({ 
  title = "Partial access",
  className 
}: { title?: string; className?: string }) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{title}</p>
    </StateContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION STATES — EXPECTED EDGE CASES
// ═══════════════════════════════════════════════════════════════════════════

interface SessionStateProps {
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

/**
 * Session expired state — expected, not surprising
 */
export function SessionExpiredState({
  message = "Session expired.",
  onAction,
  actionLabel = "Sign in",
  className
}: SessionStateProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 text-[13px] font-medium transition-colors duration-75"
          style={{ color: 'var(--platform-text)' }}
        >
          {actionLabel}
        </button>
      )}
    </StateContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE-LEVEL STATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Full-page loading state — text-based, calm
 */
export function PageLoading({ message = "Loading data" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</p>
    </div>
  );
}

/**
 * Full-page error state — managed, not dramatic
 */
export function PageError({ 
  message = "Operation failed.",
  onRetry
}: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <p className="text-[14px]" style={{ color: 'var(--platform-text-secondary)' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-[13px] font-medium transition-colors duration-75"
          style={{ color: 'var(--platform-text)' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Full-page empty state — expected, calm
 */
export function PageEmpty({ 
  title = "No records available",
  description = "This area will populate once data is available."
}: { 
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-[14px] font-medium" style={{ color: 'var(--platform-text-secondary)' }}>
        {title}
      </p>
      <p className="text-[13px] mt-1" style={{ color: 'var(--platform-text-muted)' }}>
        {description}
      </p>
    </div>
  );
}
