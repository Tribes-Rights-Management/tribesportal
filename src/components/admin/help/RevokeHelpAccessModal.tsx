import { useState } from "react";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";

/**
 * REVOKE HELP ACCESS MODAL
 * 
 * Confirmation dialog before revoking Help management access.
 */

interface UserInfo {
  user_id: string;
  email: string;
  full_name: string | null;
}

interface RevokeHelpAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserInfo | null;
  onConfirm: () => Promise<boolean>;
}

export function RevokeHelpAccessModal({
  open,
  onOpenChange,
  user,
  onConfirm,
}: RevokeHelpAccessModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleRevoke = async () => {
    setSubmitting(true);
    await onConfirm();
    setSubmitting(false);
  };

  const displayName = user?.full_name || user?.email || "this user";

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Revoke Help access"
      description=""
    >
      <div className="space-y-4">
        <p 
          className="text-[14px]"
          style={{ color: 'var(--platform-text-secondary)' }}
        >
          <strong style={{ color: 'var(--platform-text)' }}>{displayName}</strong> will immediately lose access to Help management.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={submitting}
          >
            {submitting ? "Revoking..." : "Revoke access"}
          </Button>
        </div>
      </div>
    </AppModal>
  );
}
