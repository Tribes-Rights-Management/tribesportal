import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface SupportEmailRowProps {
  showLabel?: boolean;
}

export function SupportEmailRow({ showLabel = true }: SupportEmailRowProps) {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  const supportEmail = "contact@tribesassets.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback - do nothing
    }
  };

  if (!showEmail) {
    return (
      <p className="text-center">
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Need help? Contact support.
        </button>
      </p>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {showLabel && <span className="text-[12px] text-black/40">Support</span>}
      <span className="text-[13px] text-black/55">{supportEmail}</span>
      <button
        onClick={handleCopyEmail}
        className="flex items-center justify-center p-0.5 transition-colors hover:opacity-70 focus:outline-none cursor-pointer"
        aria-label="Copy email address"
        type="button"
      >
        {copied ? (
          <Check className="h-[14px] w-[14px] text-emerald-600" strokeWidth={1.5} />
        ) : (
          <Copy className="h-[14px] w-[14px] text-muted-foreground hover:text-muted-foreground" strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}