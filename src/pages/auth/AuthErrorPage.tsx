import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout, AuthHeader, AuthFooter } from "@/components/auth/AuthLayout";
import { Copy, Check } from "lucide-react";

export default function AuthErrorPage() {
  const [copied, setCopied] = useState(false);
  const supportEmail = "admin@tribesassets.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback - do nothing, email is visible
    }
  };

  return (
    <AuthLayout
      footer={<AuthFooter>Access is restricted to approved accounts.</AuthFooter>}
    >
      <AuthHeader 
        title="Access Unavailable"
        subtitle="This account is not approved for portal access."
      />

      {/* Notice */}
      <div className="text-center space-y-4">
        <p className="text-sm text-black/60 leading-relaxed">
          If you believe this is an error, contact administration.
        </p>
        
        {/* Support email with copy */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {supportEmail}
          </span>
          <button
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-black/50 hover:text-black rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
            aria-label="Copy email address"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied</span>
              </>
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Primary action */}
      <div className="mt-10">
        <Link 
          to="/auth/sign-in"
          className="block w-full h-12 bg-[#101010] hover:bg-black/90 hover:shadow-md text-white text-[15px] font-medium rounded-xl transition-all text-center leading-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
        >
          Request a new sign-in link
        </Link>
      </div>

      {/* Secondary link */}
      <p className="mt-6 text-center">
        <Link 
          to="/auth/sign-in"
          className="text-[13px] text-black/60 hover:text-black transition-colors"
        >
          Return to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
