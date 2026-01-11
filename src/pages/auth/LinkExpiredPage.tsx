import { Link } from "react-router-dom";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { SupportEmailRow } from "@/components/auth/SupportEmailRow";
import { AuthLayout } from "@/layouts/AuthLayout";

export default function LinkExpiredPage() {
  return (
    <AuthLayout>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-[22px] font-medium text-[#0A0A0A] tracking-[-0.01em] leading-tight">
          This sign-in link has expired
        </h1>
        <p className="mt-2 text-[13px] text-[#71717A] leading-relaxed">
          For security, each link expires quickly and can only be used once.
        </p>
        <p className="mt-1.5 text-[13px] text-[#71717A]">
          Request a new link below.
        </p>
      </div>

      {/* Reuse the same form from sign-in */}
      <MagicLinkForm buttonLabel="Request a new sign-in link" />

      {/* Support section */}
      <div className="mt-6">
        <SupportEmailRow />
      </div>

      {/* Institutional Notice */}
      <p className="mt-5 text-center text-[12px] text-[#A1A1AA]">
        Access is restricted to approved accounts.
      </p>

      {/* Back Link */}
      <p className="mt-3 text-center">
        <Link 
          to="/auth/sign-in"
          className="text-[12px] text-[#71717A] hover:text-[#0A0A0A] transition-colors"
        >
          Return to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}