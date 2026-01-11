import { Link } from "react-router-dom";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { SupportEmailRow } from "@/components/auth/SupportEmailRow";
import { AuthLayout } from "@/layouts/AuthLayout";

export default function LinkExpiredPage() {
  return (
    <AuthLayout>
      {/* Header - Marketing site alignment */}
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-bold text-foreground tracking-[-0.02em] leading-[1.125]">
          This sign-in link has expired
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          For security, each link expires quickly and can only be used once.
        </p>
        <p className="mt-2 text-base text-muted-foreground">
          Request a new link below.
        </p>
      </div>

      {/* Reuse the same form from sign-in */}
      <MagicLinkForm buttonLabel="Request a new sign-in link" />

      {/* Support section */}
      <div className="mt-8">
        <SupportEmailRow />
      </div>

      {/* Institutional Notice */}
      <p className="mt-6 text-center text-[14px] text-muted-foreground">
        Access is restricted to approved accounts.
      </p>

      {/* Back Link */}
      <p className="mt-4 text-center">
        <Link 
          to="/auth/sign-in"
          className="text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        >
          Return to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
