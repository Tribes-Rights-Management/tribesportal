import { Link } from "react-router-dom";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { SupportEmailRow } from "@/components/auth/SupportEmailRow";
import { AuthLayout } from "@/layouts/AuthLayout";

/**
 * LinkExpiredPage - Recovery state for expired magic links
 * Uses unified auth design tokens
 * 
 * LOCKED DESIGN TOKENS:
 * - H1: 24px, font-semibold, color #111, centered
 * - Body: 14px, color #6B6B6B, centered
 */
export default function LinkExpiredPage() {
  return (
    <AuthLayout>
      {/* Header - matching AuthSurface styling */}
      <div className="text-center mb-6">
        <h1 className="text-[24px] font-semibold text-[#111]">
          This link has expired
        </h1>
        <p className="mt-2 text-[14px] text-[#6B6B6B]">
          For security, each link expires quickly and can only be used once.
        </p>
        <p className="mt-1 text-[14px] text-[#6B6B6B]">
          Request a new link below.
        </p>
      </div>

      {/* Reuse the same form from sign-in */}
      <MagicLinkForm buttonLabel="Request new link" />

      {/* Support section */}
      <div className="mt-6">
        <SupportEmailRow />
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-[13px] text-[#9CA3AF]">
        Access is restricted to approved accounts.
      </p>

      {/* Back Link */}
      <p className="mt-2 text-center">
        <Link 
          to="/auth/sign-in"
          className="text-[13px] text-[#9CA3AF] hover:text-[#6B6B6B] hover:underline transition-colors duration-150"
        >
          Return to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
