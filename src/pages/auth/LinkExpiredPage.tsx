import { Link } from "react-router-dom";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { SupportEmailRow } from "@/components/auth/SupportEmailRow";

export default function LinkExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0A0A0A] tracking-[-0.02em] leading-tight">
            This sign-in link has expired
          </h1>
          <p className="mt-3 text-[15px] text-[#6B6B6B] leading-relaxed">
            Tribes uses secure email sign-in links.
            <br />
            For security, each link expires quickly and can only be used once.
          </p>
          <p className="mt-3 text-[15px] text-[#6B6B6B] leading-relaxed">
            Request a new link below.
          </p>
        </div>

        {/* Reuse the same form from sign-in */}
        <MagicLinkForm buttonLabel="Request a new sign-in link" />

        {/* Support section - reveal on click */}
        <div className="mt-8">
          <SupportEmailRow />
        </div>

        {/* Institutional Notice */}
        <p className="mt-6 text-center text-[13px] text-[#A1A1AA] leading-relaxed">
          Access is restricted to approved accounts.
        </p>

        {/* Back Link */}
        <p className="mt-4 text-center">
          <Link 
            to="/auth/sign-in"
            className="text-[13px] text-[#71717A] hover:text-[#0A0A0A] transition-colors"
          >
            Return to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}