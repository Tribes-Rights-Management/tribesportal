import { Link } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { SYSTEM_COPY } from "@/styles/tokens";

/**
 * AuthErrorPage - System boundary for access restriction
 * 
 * DESIGN: Same dark environment as auth, institutional language
 * NO friendly messaging, NO card UI
 */
export default function AuthErrorPage() {
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
        {SYSTEM_COPY.ACCESS_RESTRICTED_TITLE}
      </h1>

      {/* Body - procedural, neutral */}
      <p className="mt-4 text-[14px] leading-[1.6] text-[#707070] text-center">
        {SYSTEM_COPY.ACCESS_RESTRICTED_BODY}
      </p>

      {/* Contact */}
      <p className="mt-8 text-[13px] text-[#505050] text-center">
        {SYSTEM_COPY.CONTACT_ADMIN}
      </p>

      {/* Support email */}
      <p className="mt-2 text-center">
        <a 
          href={`mailto:${SYSTEM_COPY.SUPPORT_EMAIL}`}
          className="text-[14px] font-medium text-[#E5E5E3] hover:text-[#FFFFFF] transition-colors duration-75"
        >
          {SYSTEM_COPY.SUPPORT_EMAIL}
        </a>
      </p>

      {/* Back link */}
      <p className="mt-12 text-center">
        <Link 
          to="/auth/sign-in"
          className="text-[13px] text-[#505050] hover:text-[#707070] transition-colors duration-75"
        >
          Return to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
