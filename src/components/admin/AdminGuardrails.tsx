import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface AdminGuardrailsProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export function AdminGuardrails({ children, requireSuperAdmin = false }: AdminGuardrailsProps) {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading, isAdmin } = useUserRole();
  const navigate = useNavigate();

  const loading = authLoading || rolesLoading;
  const isSuperAdmin = roles.includes("admin");
  const hasAccess = requireSuperAdmin ? isSuperAdmin : isAdmin;

  useEffect(() => {
    if (!loading && !hasAccess) {
      navigate("/portal", { replace: true });
    }
  }, [loading, hasAccess, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

// Access Approve Modal
interface AccessApproveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  userName: string;
}

export function AccessApproveModal({ open, onClose, onConfirm, isProcessing, userName }: AccessApproveModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Access Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve access for {userName}? They will receive an email notification and be able to sign in.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Access Reject Modal
interface AccessRejectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isProcessing: boolean;
}

export function AccessRejectModal({ open, onClose, onConfirm, isProcessing }: AccessRejectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Access Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this access request? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onConfirm()} disabled={isProcessing}>
            {isProcessing ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Audit Log Header
export function AuditLogHeader() {
  return (
    <p className="text-[11px] text-muted-foreground">
      Actions are logged for compliance purposes.
    </p>
  );
}

// Status Change Note
export function StatusChangeNote() {
  return (
    <p className="text-[11px] text-muted-foreground">
      Status changes are recorded in the audit log.
    </p>
  );
}

// View Only Message
export function ViewOnlyMessage() {
  return (
    <div className="py-3 px-4 bg-muted/30 rounded text-[12px] text-muted-foreground">
      <p>You have view-only access. Contact an admin to make changes.</p>
    </div>
  );
}

// Approval Confirm Modal
interface ApprovalConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  licenseId: string;
  isProcessing?: boolean;
}

export function ApprovalConfirmModal({ open, onClose, onConfirm, licenseId, isProcessing }: ApprovalConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve License</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve license {licenseId}? This will move the license to the next workflow stage.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Supersede Confirm Modal
interface SupersedeConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  licenseId: string;
  isProcessing: boolean;
}

export function SupersedeConfirmModal({ open, onClose, onConfirm, licenseId, isProcessing }: SupersedeConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supersede License</DialogTitle>
          <DialogDescription>
            Creating a new version of license {licenseId}. The original will be marked as superseded.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? "Creating..." : "Create New Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Export Warning
interface ExportWarningProps {
  canExport?: boolean;
}

export function ExportWarning({ canExport }: ExportWarningProps) {
  if (canExport) return null;
  
  return (
    <div className="flex items-start gap-2 py-3 px-4 bg-amber-50 dark:bg-amber-950/30 rounded text-amber-700 dark:text-amber-300">
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p className="text-[12px]">
        Exports are only available when all licenses in this package are complete.
      </p>
    </div>
  );
}

// Edit Block Modal
interface EditBlockModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditBlockModal({ open, onClose }: EditBlockModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editing Not Available</DialogTitle>
          <DialogDescription>
            This request cannot be edited because it has progressed past the editable stage.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
