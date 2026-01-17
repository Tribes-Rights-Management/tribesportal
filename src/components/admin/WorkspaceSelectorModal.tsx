import { useAuth, TenantMembership } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AppModal,
  AppModalBody,
} from "@/components/ui/app-modal";

/**
 * WORKSPACE SELECTOR MODAL — SYSTEM CONSOLE → WORKSPACE ENTRY
 * 
 * Uses the unified AppModal system for consistent backdrop and mobile behavior.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL ARCHITECTURE ENFORCEMENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This modal is the ONLY mechanism for transitioning from System Console
 * to a Workspace. This separation is architectural and non-negotiable.
 * 
 * RULES (LOCKED):
 * - System Console does NOT have a workspace switcher
 * - User must EXPLICITLY choose a workspace
 * - No auto-selection, no implicit switching
 * - Transition must feel intentional (no continuity animations)
 * - Each workspace row shows: name, purpose, role badge
 * - Workspaces are listed only if user has active membership
 * 
 * POST-SELECTION BEHAVIOR:
 * - Navigate to /app/{context}
 * - Activate workspace switcher in GlobalHeader
 * - Change data scope globally
 * - System Console becomes accessible only via user menu
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface WorkspaceSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Map role to display badge
function getRoleBadge(role: string): { label: string; variant: "admin" | "member" | "readonly" } {
  switch (role) {
    case "tenant_admin":
      return { label: "Admin", variant: "admin" };
    case "viewer":
      return { label: "Read-only", variant: "readonly" };
    default:
      return { label: "Member", variant: "member" };
  }
}

// Get workspace purpose descriptor
function getWorkspacePurpose(contexts: string[]): string {
  if (contexts.includes("licensing") && contexts.includes("publishing")) {
    return "Full platform access";
  }
  if (contexts.includes("licensing")) {
    return "Licensing requests and agreements";
  }
  if (contexts.includes("publishing")) {
    return "Publishing administration";
  }
  return "Operating environment";
}

// Workspace row component
function WorkspaceRow({ 
  membership, 
  onSelect 
}: { 
  membership: TenantMembership; 
  onSelect: () => void;
}) {
  const { label, variant } = getRoleBadge(membership.role);
  const purpose = getWorkspacePurpose(membership.allowed_contexts);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left px-4 py-3.5",
        "hover:bg-white/[0.03] transition-colors duration-150",
        "focus:outline-none focus-visible:bg-white/[0.05]",
        "flex items-center justify-between gap-3"
      )}
      style={{ borderBottom: '1px solid var(--platform-border)' }}
    >
      <div className="min-w-0 flex-1">
        {/* Workspace name - single line with ellipsis */}
        <p 
          className="text-[14px] font-medium truncate"
          style={{ color: 'var(--platform-text)' }}
        >
          {membership.tenant_name}
        </p>
        {/* Purpose descriptor - 2-line clamp for mobile readability */}
        <p 
          className="text-[12px] mt-0.5 line-clamp-2 break-words"
          style={{ 
            color: 'var(--platform-text-muted)', 
            lineHeight: '1.45',
          }}
        >
          {purpose}
        </p>
      </div>
      
      {/* Role badge + chevron */}
      <div className="flex items-center gap-2 shrink-0">
        <span 
          className={cn(
            "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded",
            variant === "admin" && "bg-white/10 text-white/70",
            variant === "member" && "bg-white/5 text-white/50",
            variant === "readonly" && "bg-white/5 text-white/40"
          )}
        >
          {label}
        </span>
        <ChevronRight 
          className="h-4 w-4" 
          style={{ color: 'var(--platform-text-muted)', opacity: 0.5 }} 
        />
      </div>
    </button>
  );
}

export function WorkspaceSelectorModal({ open, onOpenChange }: WorkspaceSelectorModalProps) {
  const { tenantMemberships, setActiveTenant } = useAuth();
  const navigate = useNavigate();

  const handleSelectWorkspace = (membership: TenantMembership) => {
    // Set the active tenant
    setActiveTenant(membership.tenant_id);
    
    // Determine initial context
    const initialContext = membership.allowed_contexts.includes("publishing")
      ? "publishing"
      : membership.allowed_contexts[0] || "publishing";
    
    // Close modal
    onOpenChange(false);
    
    // Navigate to workspace - intentional, explicit transition
    navigate(`/app/${initialContext}`);
  };

  // No workspaces available
  if (tenantMemberships.length === 0) {
    return (
      <AppModal
        open={open}
        onOpenChange={onOpenChange}
        title="No Workspaces Available"
        description="You do not have access to any operating workspaces."
        maxWidth="sm"
      >
        <AppModalBody>
          <div className="py-4 text-center">
            <p 
              className="text-[13px]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              Contact an administrator to request workspace access.
            </p>
          </div>
        </AppModalBody>
      </AppModal>
    );
  }

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Select a Workspace"
      description="Workspaces are separate operating environments."
      maxWidth="sm"
    >
      {/* Workspace list - no padding wrapper, rows have their own padding */}
      <div className="overflow-y-auto max-h-[400px] flex-1">
        {tenantMemberships.map((membership) => (
          <WorkspaceRow
            key={membership.tenant_id}
            membership={membership}
            onSelect={() => handleSelectWorkspace(membership)}
          />
        ))}
      </div>
      
      {/* Footer note */}
      <div 
        className="px-5 py-3 shrink-0"
        style={{ 
          borderTop: '1px solid var(--platform-border)',
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}
      >
        <p 
          className="text-[11px] text-center"
          style={{ color: 'var(--platform-text-muted)', opacity: 0.6 }}
        >
          Selecting a workspace changes your data scope globally.
        </p>
      </div>
    </AppModal>
  );
}
