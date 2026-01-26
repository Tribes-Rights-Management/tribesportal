import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  AppModal,
  AppModalBody,
  AppModalFooter,
  AppModalAction,
  AppModalCancel,
  AppModalField,
  AppModalFields,
} from "@/components/ui/app-modal";

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
  onSuccess: () => void;
}

const ORG_ROLES = [
  { value: "org_admin", label: "Organization Admin" },
  { value: "org_staff", label: "Staff" },
  { value: "org_client", label: "Client" },
] as const;

const ACCESS_LEVELS = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "manager", label: "Manager" },
  { value: "approver", label: "Approver" },
] as const;

export function InviteUserModal({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  onSuccess,
}: InviteUserModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [orgRole, setOrgRole] = useState<string>("org_client");
  const [grantAdmin, setGrantAdmin] = useState(false);
  const [grantLicensing, setGrantLicensing] = useState(false);
  const [adminAccessLevel, setAdminAccessLevel] = useState<string>("viewer");
  const [licensingAccessLevel, setLicensingAccessLevel] = useState<string>("viewer");
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setOrgRole("org_client");
      setGrantAdmin(false);
      setGrantLicensing(false);
      setAdminAccessLevel("viewer");
      setLicensingAccessLevel("viewer");
      setEmailError(null);
    }
  }, [open]);

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) validateEmail(value);
    else setEmailError(null);
  };

  const generateToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const handleSubmit = async () => {
    if (!validateEmail(email) || saving || !user) return;

    setSaving(true);
    try {
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase.from("invitations").insert({
        organization_id: organizationId,
        invited_email: email.toLowerCase().trim(),
        invited_by_user_id: user.id,
        org_role: orgRole as any,
        grant_admin_module: grantAdmin,
        grant_licensing_module: grantLicensing,
        admin_access_level: grantAdmin ? (adminAccessLevel as any) : null,
        licensing_access_level: grantLicensing ? (licensingAccessLevel as any) : null,
        token,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      });

      if (error) throw error;

      // TODO: Send invitation email
      // For now, log the invite link
      const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`;
      console.log("Invitation URL:", inviteUrl);

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${email}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to create invitation:", err);
      toast({
        title: "Failed to send invitation",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isValid = email.trim() && !emailError && (grantAdmin || grantLicensing);

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Invite user"
      description={`Invite a user to ${organizationName}`}
      preventClose={saving}
      maxWidth="sm"
    >
      <AppModalBody>
        <AppModalFields>
          {/* Email Field */}
          <AppModalField label="Email address" htmlFor="invite-email" error={emailError}>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="user@example.com"
              autoComplete="email"
              className={cn(
                "h-12 md:h-11 text-[16px] md:text-[14px] bg-muted/50 border rounded-[10px]",
                emailError ? "border-destructive" : "border-border"
              )}
            />
          </AppModalField>

          {/* Organization Role */}
          <AppModalField label="Role in organization" htmlFor="org-role">
            <Select value={orgRole} onValueChange={setOrgRole}>
              <SelectTrigger 
                id="org-role"
                className="h-12 md:h-11 text-[16px] md:text-[14px] bg-muted/50 border rounded-[10px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AppModalField>

          {/* Module Access Section */}
          <div className="pt-4 border-t border-border">
            <p 
              className="text-[14px] font-medium mb-4"
              style={{ color: 'var(--platform-text)' }}
            >
              Module access
            </p>

            {/* Admin Module Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="grant-admin" className="text-[14px]">
                  Tribes Admin
                </Label>
                <Switch
                  id="grant-admin"
                  checked={grantAdmin}
                  onCheckedChange={setGrantAdmin}
                />
              </div>
              
              {grantAdmin && (
                <div className="ml-0 pl-4 border-l-2 border-border">
                  <Select value={adminAccessLevel} onValueChange={setAdminAccessLevel}>
                    <SelectTrigger className="h-10 text-[14px] bg-muted/50 border rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCESS_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Licensing Module Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="grant-licensing" className="text-[14px]">
                  Licensing
                </Label>
                <Switch
                  id="grant-licensing"
                  checked={grantLicensing}
                  onCheckedChange={setGrantLicensing}
                />
              </div>
              
              {grantLicensing && (
                <div className="ml-0 pl-4 border-l-2 border-border">
                  <Select value={licensingAccessLevel} onValueChange={setLicensingAccessLevel}>
                    <SelectTrigger className="h-10 text-[14px] bg-muted/50 border rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCESS_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {!grantAdmin && !grantLicensing && (
              <p className="text-[13px] text-amber-600 mt-3">
                At least one module must be granted
              </p>
            )}
          </div>
        </AppModalFields>
      </AppModalBody>

      <AppModalFooter>
        <AppModalAction
          onClick={handleSubmit}
          disabled={!isValid}
          loading={saving}
          loadingText="Sending…"
        >
          Send invitation
        </AppModalAction>
        <AppModalCancel onClick={() => onOpenChange(false)} disabled={saving}>
          Cancel
        </AppModalCancel>
      </AppModalFooter>
    </AppModal>
  );
}
