import { Link } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { SYSTEM_COPY } from "@/styles/tokens";

/**
 * LinkExpiredPage - System boundary for expired verification links
 * 
 * DESIGN: Same dark environment as auth, institutional language
 * NO friendly messaging, NO card UI
 */
export default function LinkExpiredPage() {
  return (
    <AuthLayout>
      {/* System identifier */}
      <div className="mb-10 text-center">
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#4A4A4A]">
          Tribes Rights Management System
        </span>
      </div>

      {/* Heading - declarative, not apologetic */}
      <h1 className="text-[22px] font-medium leading-[1.25] text-[#E5E5E3] text-center tracking-[-0.02em]">
        {SYSTEM_COPY.LINK_EXPIRED_TITLE}
      </h1>

      {/* Body - procedural, neutral */}
      <p className="mt-4 text-[14px] leading-[1.6] text-[#707070] text-center">
        {SYSTEM_COPY.LINK_EXPIRED_BODY}
      </p>

      {/* Action */}
      <div className="mt-10">
        <Link
          to="/auth/sign-in"
          className="block w-full h-[52px] rounded-[6px] bg-[#E5E5E3] text-[#0A0A0B] text-[15px] font-medium text-center leading-[52px] hover:bg-[#D5D5D3] transition-colors duration-75"
        >
          Request new access link
        </Link>
      </div>

      {/* Policy notice */}
      <p className="mt-12 text-center text-[12px] leading-[1.5] text-[#4A4A4A]">
        {SYSTEM_COPY.CONTACT_ADMIN}
      </p>

      {/* Support */}
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
