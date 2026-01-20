import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/layouts/AuthLayout";
import { SYSTEM_COPY } from "@/styles/tokens";
import { Button } from "@/components/ui/button";

/**
 * PendingApprovalPage - System boundary for pending approval
 * 
 * DESIGN: Same dark environment as auth, institutional language
 */
export default function PendingApprovalPage() {
  const { profile, signOut } = useAuth();

  return (
    <AuthLayout>
      {/* System identifier */}
      <div className="mb-10 text-center">
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#4A4A4A]">
          Tribes Rights Management System
        </span>
      </div>

      {/* Heading */}
      <h1 className="text-[22px] font-medium leading-[1.25] text-[#E5E5E3] text-center tracking-[-0.02em]">
        {SYSTEM_COPY.ACCESS_PENDING_TITLE}
      </h1>

      {/* Body */}
      <p className="mt-4 text-[14px] leading-[1.6] text-[#707070] text-center">
        {SYSTEM_COPY.ACCESS_PENDING_BODY}
      </p>

      {/* Account display */}
      {profile?.email && (
        <div className="mt-8 text-center">
          <span className="text-[13px] text-[#505050]">Account: </span>
          <span className="text-[13px] font-medium text-[#E5E5E3]">{profile.email}</span>
        </div>
      )}

      {/* Status */}
      <div className="mt-4 text-center">
        <span className="text-[12px] text-[#505050]">Status: </span>
        <span className="text-[12px] font-medium text-[#707070]">Pending authorization</span>
      </div>

      {/* Action - using Button component */}
      <div className="mt-10">
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full h-[48px]"
        >
          Sign out
        </Button>
      </div>

      {/* Contact */}
      <p className="mt-12 text-center text-[12px] leading-[1.5] text-[#4A4A4A]">
        {SYSTEM_COPY.CONTACT_ADMIN}
      </p>

      <p className="mt-2 text-center">
        <a 
          href={`mailto:${SYSTEM_COPY.SUPPORT_EMAIL}`}
          className="text-[12px] text-[#4A4A4A] hover:text-[#606060] transition-colors duration-75"
        >
          {SYSTEM_COPY.SUPPORT_EMAIL}
        </a>
      </p>
    </AuthLayout>
  );
}