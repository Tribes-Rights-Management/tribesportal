import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/layouts/AuthLayout";
import { SYSTEM_COPY } from "@/styles/tokens";

/**
 * NoAccessPage - System boundary for accounts with no access record
 * 
 * DESIGN: Same dark environment as auth, institutional language
 */
export default function NoAccessPage() {
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
        {SYSTEM_COPY.NO_ACCESS_TITLE}
      </h1>

      {/* Body */}
      <p className="mt-4 text-[14px] leading-[1.6] text-[#707070] text-center">
        {SYSTEM_COPY.NO_ACCESS_BODY}
      </p>

      {/* Account display */}
      {profile?.email && (
        <div className="mt-8 text-center">
          <span className="text-[13px] text-[#505050]">Account: </span>
          <span className="text-[13px] font-medium text-[#E5E5E3]">{profile.email}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-10 space-y-3">
        <a
          href="https://tribesassets.com/request-access"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-[48px] rounded-[6px] bg-[#E5E5E3] text-[#0A0A0B] text-[14px] font-medium text-center leading-[48px] hover:bg-[#D5D5D3] transition-colors duration-75"
        >
          Request access
        </a>

        <button
          onClick={signOut}
          className="w-full text-center text-[13px] text-[#505050] hover:text-[#707070] py-2 transition-colors duration-75"
        >
          Sign out
        </button>
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
