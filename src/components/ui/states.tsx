import { cn } from "@/lib/utils";

/**
 * INSTITUTIONAL STATE COMPONENTS
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - No empathy, no personality, no reassurance
 * - Neutral, informational, infrastructure voice
 * - Dense, functional presentation
 * 
 * Loading: "Loading data", "Retrieving records"
 * Empty: "No records available."
 * Error: "Operation failed.", "Verification required."
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
// LOADING STATES
// ═══════════════════════════════════════════════════════════════════════════

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ 
  message = "Loading data", 
  className 
}: LoadingStateProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px] text-[#6B6B6B]">{message}</p>
    </StateContainer>
  );
}

export function LoadingStateInline({ 
  message = "Loading…" 
}: { message?: string }) {
  return (
    <span className="text-[14px] text-[#6B6B6B]">{message}</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATES
// ═══════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  message?: string;
  className?: string;
}

export function EmptyState({ 
  message = "No records available.", 
  className 
}: EmptyStateProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px] text-[#6B6B6B]">{message}</p>
    </StateContainer>
  );
}

// For tables specifically
export function TableEmptyState({ 
  message = "No records available.",
  colSpan = 1 
}: { message?: string; colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center">
        <p className="text-[14px] text-[#6B6B6B]">{message}</p>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR STATES
// ═══════════════════════════════════════════════════════════════════════════

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  message = "Operation failed.", 
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px] text-[#6B6B6B]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-[13px] font-medium text-[#111] hover:text-[#333] transition-colors duration-75"
        >
          Retry
        </button>
      )}
    </StateContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION STATES
// ═══════════════════════════════════════════════════════════════════════════

interface PermissionDeniedProps {
  className?: string;
}

export function PermissionDenied({ className }: PermissionDeniedProps) {
  return (
    <StateContainer className={className}>
      <p className="text-[14px] text-[#6B6B6B]">Access not authorized.</p>
    </StateContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE-LEVEL LOADING
// ═══════════════════════════════════════════════════════════════════════════

export function PageLoading({ message = "Loading data" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <p className="text-[14px] text-[#6B6B6B]">{message}</p>
    </div>
  );
}
