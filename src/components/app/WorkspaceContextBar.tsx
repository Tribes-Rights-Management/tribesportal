import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * WORKSPACE CONTEXT BAR — OPERATIONAL CONFIRMATION
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL ARCHITECTURE ENFORCEMENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This component renders a subtle confirmation line when user is operating
 * inside a workspace. It communicates:
 * - Active workspace context
 * - Current operational surface
 * 
 * RULES:
 * - Only renders inside workspaces (not System Console)
 * - Subtle, non-intrusive - part of the page header area
 * - Reinforces that user has transitioned to operational mode
 * ═══════════════════════════════════════════════════════════════════════════
 */

type ContextLabel = "Licensing" | "Tribes Admin" | "Publishing";

function getContextLabel(pathname: string): ContextLabel {
  if (pathname.startsWith("/licensing")) return "Licensing";
  if (pathname.startsWith("/portal")) return "Tribes Admin";
  return "Publishing";
}

export function WorkspaceContextBar() {
  const { activeTenant } = useAuth();
  const location = useLocation();
  
  // Don't render without active workspace or in system console
  if (!activeTenant || location.pathname.startsWith("/admin") || location.pathname.startsWith("/auditor")) {
    return null;
  }
  
  const contextLabel = getContextLabel(location.pathname);

  return (
    <div 
      className={cn(
        "px-4 md:px-6 py-2 border-b",
        "flex items-center justify-between gap-4"
      )}
      style={{
        backgroundColor: 'var(--tribes-surface-card)',
        borderColor: 'var(--tribes-border-subtle)',
      }}
    >
      {/* Context confirmation */}
      <p 
        className="text-[12px]"
        style={{ color: 'var(--tribes-text-secondary)' }}
      >
        <span className="hidden sm:inline">You are operating inside the </span>
        <span 
          className="font-medium"
          style={{ color: 'var(--tribes-text-primary)' }}
        >
          {contextLabel}
        </span>
        <span className="hidden sm:inline"> workspace.</span>
        <span className="sm:hidden"> workspace</span>
      </p>
      
      {/* Workspace name - subtle, desktop only */}
      <span 
        className="text-[11px] font-medium uppercase tracking-wider truncate max-w-[150px] hidden md:block"
        style={{ color: 'var(--tribes-text-muted)' }}
      >
        {activeTenant.tenant_name}
      </span>
    </div>
  );
}
