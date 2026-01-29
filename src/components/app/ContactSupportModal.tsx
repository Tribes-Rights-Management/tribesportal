import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/**
 * CONTACT SUPPORT MODAL — MERCURY-STYLE FORM
 * 
 * Opens from the Help Assistant. Collects:
 * - Category (select)
 * - Description (textarea)
 * 
 * Submits via mailto: link to support@mail.tribesassets.com
 */

interface ContactSupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { value: "account", label: "Account" },
  { value: "access", label: "Access" },
  { value: "royalties", label: "Royalties" },
  { value: "licensing", label: "Licensing" },
  { value: "bug", label: "Bug" },
  { value: "other", label: "Other" },
];

const SUPPORT_EMAIL = "support@mail.tribesassets.com";

export function ContactSupportModal({ open, onOpenChange }: ContactSupportModalProps) {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = category && description.trim().length > 0;

  const getCurrentModuleName = (): string => {
    const pathname = window.location.pathname;
    if (pathname.startsWith("/workspaces")) return "Workspaces";
    if (pathname.startsWith("/console")) return "System Console";
    if (pathname.startsWith("/help")) return "Help";
    if (pathname.startsWith("/licensing")) return "Licensing";
    if (pathname.startsWith("/admin")) return "Admin";
    return "App";
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    const categoryLabel = CATEGORIES.find(c => c.value === category)?.label || category;
    const moduleName = getCurrentModuleName();
    const pageUrl = window.location.href;
    const userEmail = user?.email || "Not logged in";

    // Build mailto link
    const subject = encodeURIComponent(`Tribes Support — ${categoryLabel}`);
    const body = encodeURIComponent(
      `Page URL: ${pageUrl}\n` +
      `Module: ${moduleName}\n` +
      `User Email: ${userEmail}\n` +
      `Category: ${categoryLabel}\n\n` +
      `Description:\n${description}`
    );

    const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    // Open mail client
    window.location.href = mailtoLink;

    toast({
      title: "Opening your email client…",
      description: "Complete the email to send your support request.",
    });

    // Reset form and close
    setTimeout(() => {
      setCategory("");
      setDescription("");
      setIsSubmitting(false);
      onOpenChange(false);
    }, 500);
  };

  const handleClose = () => {
    setCategory("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "sm:max-w-[440px] p-0 gap-0 rounded-xl",
          "border border-[var(--border-subtle)]"
        )}
        style={{ backgroundColor: 'var(--background)' }}
      >
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[15px] font-semibold text-foreground">
              Contact support
            </DialogTitle>
            <button
              onClick={handleClose}
              className={cn(
                "h-7 w-7 flex items-center justify-center rounded-md",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                "transition-colors"
              )}
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </DialogHeader>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger 
                className={cn(
                  "h-10 text-[13px]",
                  "border-[var(--border-subtle)] bg-transparent",
                  "focus:ring-2 focus:ring-muted-foreground/20 focus:ring-offset-0"
                )}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-[13px]">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">
              Describe the issue
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., My payout is missing…"
              className={cn(
                "min-h-[120px] text-[13px] resize-none",
                "border-[var(--border-subtle)] bg-transparent",
                "placeholder:text-muted-foreground/60",
                "focus-visible:ring-2 focus-visible:ring-muted-foreground/20 focus-visible:ring-offset-0"
              )}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {SUPPORT_EMAIL}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={cn(
              "h-9 px-4 text-[13px] font-medium rounded-lg",
              "bg-foreground text-background hover:opacity-90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Send message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
