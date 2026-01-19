import { useState } from "react";
import { Search } from "lucide-react";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * GRANT HELP ACCESS MODAL
 * 
 * Allows platform admins to select a user and grant them
 * permission to manage Help content.
 */

interface UserOption {
  user_id: string;
  email: string;
  full_name: string | null;
  platform_role: string;
}

interface GrantHelpAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserOption[];
  onGrant: (userId: string) => Promise<boolean>;
}

export function GrantHelpAccessModal({
  open,
  onOpenChange,
  users,
  onGrant,
}: GrantHelpAccessModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setSearchQuery("");
    setSelectedUser(null);
    onOpenChange(false);
  };

  const handleGrant = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    const success = await onGrant(selectedUser.user_id);
    setSubmitting(false);
    if (success) {
      handleClose();
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q))
    );
  });

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Grant Help access"
      description="Select a user to allow them to manage Help content. This applies immediately."
    >
      <div className="space-y-4">
        {/* Search */}
        <div>
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" 
              style={{ color: 'var(--platform-text-muted)' }}
            />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              style={{ 
                backgroundColor: 'var(--platform-surface)',
                borderColor: 'var(--platform-border)',
                color: 'var(--platform-text)',
              }}
            />
          </div>
          <p 
            className="text-[12px] mt-1.5"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            Search by name or email.
          </p>
        </div>

        {/* User list */}
        <div 
          className="max-h-[280px] overflow-y-auto rounded border"
          style={{ 
            borderColor: 'var(--platform-border)',
            backgroundColor: 'var(--platform-canvas)',
          }}
        >
          {filteredUsers.length === 0 ? (
            <div 
              className="p-4 text-center text-[13px]"
              style={{ color: 'var(--platform-text-muted)' }}
            >
              No users found.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--platform-border)' }}>
              {filteredUsers.map((user) => {
                const isSelected = selectedUser?.user_id === user.user_id;
                const displayName = user.full_name || user.email;
                
                return (
                  <button
                    key={user.user_id}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className="w-full text-left p-3 transition-colors"
                    style={{
                      backgroundColor: isSelected 
                        ? 'rgba(255, 255, 255, 0.08)' 
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div 
                      className="text-[14px] font-medium truncate"
                      style={{ color: 'var(--platform-text)' }}
                    >
                      {displayName}
                    </div>
                    {user.full_name && (
                      <div 
                        className="text-[12px] truncate mt-0.5"
                        style={{ color: 'var(--platform-text-muted)' }}
                      >
                        {user.email}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGrant}
            disabled={!selectedUser || submitting}
            style={{
              backgroundColor: 'var(--platform-text)',
              color: 'var(--platform-canvas)',
            }}
          >
            {submitting ? "Granting..." : "Grant access"}
          </Button>
        </div>
      </div>
    </AppModal>
  );
}
