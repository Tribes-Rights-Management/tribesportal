import { useAuth, TenantMembership } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LABELS } from "@/styles/tokens";

/**
 * WORKSPACE SELECTOR MODAL — SYSTEM CONSOLE → WORKSPACE ENTRY
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
        "w-full text-left px-4 py-3.5 border-b border-white/5 last:border-b-0",
        "hover:bg-white/[0.03] transition-colors duration-150",
        "focus:outline-none focus-visible:bg-white/[0.05]",
        "flex items-center justify-between gap-3"
      )}
    >
      <div className="min-w-0 flex-1">
        {/* Workspace name - single line with ellipsis */}
        <p 
          className="text-[14px] font-medium truncate"
          style={{ color: 'var(--tribes-text)' }}
        >
          {membership.tenant_name}
        </p>
        {/* Purpose descriptor - 2-line clamp for mobile readability */}
        <p 
          className="text-[12px] mt-0.5 line-clamp-2 break-words"
          style={{ 
            color: 'var(--tribes-text-muted)', 
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
        <ChevronRight className="h-4 w-4 text-white/30" />
      </div>
    </button>
  );
}

export function WorkspaceSelectorModal({ open, onOpenChange }: WorkspaceSelectorModalProps) {
  const { tenantMemberships, setActiveTenant } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          hideDefaultClose
          className={cn(
            "bg-[#141416] border-white/10 text-white",
            isMobile 
              ? "max-w-full w-full h-full max-h-full rounded-none top-0 left-0 translate-x-0 translate-y-0" 
              : "max-w-md"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-[18px] font-medium text-white/90">
              No Workspaces Available
            </DialogTitle>
            <DialogDescription className="text-[13px] text-white/40 mt-1">
              You do not have access to any operating workspaces.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-[13px] text-white/30">
              Contact an administrator to request workspace access.
            </p>
          </div>
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded text-white/40 hover:text-white/70 hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideDefaultClose
        className={cn(
          "bg-[#141416] border-white/10 text-white p-0 gap-0",
          isMobile 
            ? "max-w-full w-full h-full max-h-full rounded-none top-0 left-0 translate-x-0 translate-y-0 flex flex-col" 
            : "max-w-md"
        )}
      >
        <DialogHeader className="px-5 py-4 border-b border-white/5 relative">
          <DialogTitle className="text-[18px] font-medium text-white/90">
            Select a Workspace
          </DialogTitle>
          <DialogDescription className="text-[12px] text-white/40 mt-1">
            Workspaces are separate operating environments.
          </DialogDescription>
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded text-white/40 hover:text-white/70 hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </DialogHeader>
        
        {/* Workspace list */}
        <div className={cn(
          "overflow-y-auto",
          isMobile ? "flex-1" : "max-h-[400px]"
        )}>
          {tenantMemberships.map((membership) => (
            <WorkspaceRow
              key={membership.tenant_id}
              membership={membership}
              onSelect={() => handleSelectWorkspace(membership)}
            />
          ))}
        </div>
        
        {/* Footer note */}
        <div className="px-5 py-3 border-t border-white/5 bg-[#0F0F11]">
          <p className="text-[11px] text-white/25 text-center">
            Selecting a workspace changes your data scope globally.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
