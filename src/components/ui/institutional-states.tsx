import { cn } from "@/lib/utils";
import { EMPTY_STATES, BUTTON_LABELS } from "@/constants/institutional-copy";

/**
 * INSTITUTIONAL STATE COMPONENTS — CANONICAL ERROR & EMPTY STATES
 * 
 * DESIGN PRINCIPLES:
 * 
 * EMPTY STATES — Expected, not apologetic:
 * - No illustrations, icons, or CTAs (unless explicitly needed)
 * - Text-only, subdued contrast
 * - Structure: Title + Description
 * - Feels permanent, calm, expected
 * 
 * ERROR STATES — Trust-forward, not alarming:
 * - No exclamation points, blame, or casual tone
 * - No red backgrounds or alert icons unless critical
 * - Text-only with subtle emphasis
 * - Feels procedural, not dramatic
 * 
 * All states use platform dark-theme tokens.
 * 
 * NON-NEGOTIABLES:
 * - Copy must be identical wherever reused
 * - Do not paraphrase
 * - Do not "improve tone"
 * - Do not add friendliness
 */

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATES — EXPECTED SYSTEM STATE
// ═══════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

/**
 * Standard empty state for pages and sections
 */
export function InstitutionalEmptyState({
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "py-16 px-6 text-center",
        className
      )}
      style={{ backgroundColor: "transparent" }}
    >
      <p
        className="text-[14px] font-medium"
        style={{ color: "var(--platform-text-secondary)" }}
      >
        {title}
      </p>
      {description && (
        <p
          className="text-[13px] mt-1"
          style={{ color: "var(--platform-text-muted)" }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Panel-contained empty state
 */
export function InstitutionalEmptyPanel({
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn("rounded overflow-hidden", className)}
      style={{
        backgroundColor: "var(--platform-surface)",
        border: "1px solid var(--platform-border)",
      }}
    >
      <InstitutionalEmptyState title={title} description={description} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESET EMPTY STATES — USE THESE FOR CONSISTENCY
// ═══════════════════════════════════════════════════════════════════════════

export function LicensingRequestsEmptyState({ className }: { className?: string }) {
  return (
    <InstitutionalEmptyPanel
      title={EMPTY_STATES.LICENSING_REQUESTS.title}
      description={EMPTY_STATES.LICENSING_REQUESTS.description}
      className={className}
    />
  );
}

export function LicensingAgreementsEmptyState({ className }: { className?: string }) {
  return (
    <InstitutionalEmptyPanel
      title={EMPTY_STATES.LICENSING_AGREEMENTS.title}
      description={EMPTY_STATES.LICENSING_AGREEMENTS.description}
      className={className}
    />
  );
}

export function PortalAgreementsEmptyState({ className }: { className?: string }) {
  return (
    <InstitutionalEmptyPanel
      title={EMPTY_STATES.PORTAL_AGREEMENTS.title}
      description={EMPTY_STATES.PORTAL_AGREEMENTS.description}
      className={className}
    />
  );
}

export function PortalSubmissionsEmptyState({ className }: { className?: string }) {
  return (
    <InstitutionalEmptyPanel
      title={EMPTY_STATES.PORTAL_SUBMISSIONS.title}
      description={EMPTY_STATES.PORTAL_SUBMISSIONS.description}
      className={className}
    />
  );
}

export function PortalDocumentsEmptyState({ className }: { className?: string }) {
  return (
    <InstitutionalEmptyPanel
      title={EMPTY_STATES.PORTAL_DOCUMENTS.title}
      description={EMPTY_STATES.PORTAL_DOCUMENTS.description}
      className={className}
    />
  );
}

export function PortalStatementsEmptyState({ className }: { className?: string }) {
  return (
    <InstitutionalEmptyPanel
      title={EMPTY_STATES.PORTAL_STATEMENTS.title}
      description={EMPTY_STATES.PORTAL_STATEMENTS.description}
      className={className}
    />
  );
}

export function PendingApprovalsEmptyState({ className }: { className?: string }) {
  return (
    <InstitutionalEmptyState
      title={EMPTY_STATES.PENDING_APPROVALS.title}
      description={EMPTY_STATES.PENDING_APPROVALS.description}
      className={className}
    />
  );
}

export function SystemAlertsEmptyState({ className }: { className?: string }) {
  return (
    <InstitutionalEmptyState
      title={EMPTY_STATES.SYSTEM_ALERTS.title}
      description={EMPTY_STATES.SYSTEM_ALERTS.description}
      className={className}
    />
  );
}

export function MessagesEmptyState({ className }: { className?: string }) {
  return (
    <InstitutionalEmptyPanel
      title={EMPTY_STATES.MESSAGES.title}
      description={EMPTY_STATES.MESSAGES.description}
      className={className}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR STATES — TRUST-FORWARD, NOT ALARMING
// ═══════════════════════════════════════════════════════════════════════════

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Access-related error
 * Use for permission denials, unauthorized access
 */
export function AccessRestrictedState({
  title = "Access restricted",
  description = "You do not have permission to view this resource.",
  className,
}: Partial<ErrorStateProps>) {
  return (
    <div
      className={cn("py-16 px-6 text-center", className)}
      style={{ backgroundColor: "transparent" }}
    >
      <p
        className="text-[14px] font-medium"
        style={{ color: "var(--platform-text-secondary)" }}
      >
        {title}
      </p>
      <p
        className="text-[13px] mt-1"
        style={{ color: "var(--platform-text-muted)" }}
      >
        {description}
      </p>
    </div>
  );
}

/**
 * System-related error
 * Use for data loading failures, API errors
 */
export function SystemErrorState({
  title = "Unable to load data",
  description = "Please try again or contact support if the issue persists.",
  onRetry,
  className,
}: Partial<ErrorStateProps>) {
  return (
    <div
      className={cn("py-16 px-6 text-center", className)}
      style={{ backgroundColor: "transparent" }}
    >
      <p
        className="text-[14px] font-medium"
        style={{ color: "var(--platform-text-secondary)" }}
      >
        {title}
      </p>
      <p
        className="text-[13px] mt-1"
        style={{ color: "var(--platform-text-muted)" }}
      >
        {description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-[13px] font-medium transition-colors duration-75 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
          style={{ color: "var(--platform-text)" }}
        >
          {BUTTON_LABELS.RETRY}
        </button>
      )}
    </div>
  );
}

/**
 * Session-related error
 * Use for expired sessions, auth required
 */
export function SessionExpiredState({
  title = "Session expired",
  description = "Please sign in again to continue.",
  onRetry,
  className,
}: Partial<ErrorStateProps>) {
  return (
    <div
      className={cn("py-16 px-6 text-center", className)}
      style={{ backgroundColor: "transparent" }}
    >
      <p
        className="text-[14px] font-medium"
        style={{ color: "var(--platform-text-secondary)" }}
      >
        {title}
      </p>
      <p
        className="text-[13px] mt-1"
        style={{ color: "var(--platform-text-muted)" }}
      >
        {description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-[13px] font-medium transition-colors duration-75 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
          style={{ color: "var(--platform-text)" }}
        >
          Sign in
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING STATES — PREDICTABLE, NOT URGENT
// ═══════════════════════════════════════════════════════════════════════════

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Standard loading state
 * Text-based, no spinner, no urgency
 */
export function InstitutionalLoadingState({
  message = "Loading data",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn("py-16 px-6 text-center", className)}
      style={{ backgroundColor: "transparent" }}
    >
      <p
        className="text-[14px]"
        style={{ color: "var(--platform-text-secondary)" }}
      >
        {message}
      </p>
    </div>
  );
}

/**
 * Processing state for operations in progress
 */
export function InstitutionalProcessingState({
  message = "Applying changes",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn("py-16 px-6 text-center", className)}
      style={{ backgroundColor: "transparent" }}
    >
      <p
        className="text-[14px]"
        style={{ color: "var(--platform-text-secondary)" }}
      >
        {message}
      </p>
    </div>
  );
}
