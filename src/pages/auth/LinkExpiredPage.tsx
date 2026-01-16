import { Link } from "react-router-dom";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { SupportEmailRow } from "@/components/auth/SupportEmailRow";
import { AuthLayout } from "@/layouts/AuthLayout";

export default function LinkExpiredPage() {
  return (
    <AuthLayout>
      {/* Header - matching SignInPage styling */}
      <div className="text-center mb-7">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] leading-[1.15] text-black/90">
          This sign-in link has expired
        </h1>
        <p className="mt-2.5 text-[15px] text-black/55">
          For security, each link expires quickly and can only be used once.
        </p>
        <p className="mt-1.5 text-[15px] text-black/55">
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
      <p className="mt-6 text-center text-[13px] text-black/45">
        Access is restricted to approved accounts.
      </p>

      {/* Back Link */}
      <p className="mt-2 text-center">
        <Link 
          to="/auth/sign-in"
          className="text-[13px] text-black/45 hover:text-black/70 hover:underline transition-colors duration-150"
        >
          Return to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
