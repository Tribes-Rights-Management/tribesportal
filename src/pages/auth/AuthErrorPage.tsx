import { Link } from "react-router-dom";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0A0A0A] tracking-[-0.02em] leading-tight">
            Access Restricted
          </h1>
          <p className="mt-3 text-[15px] text-[#6B6B6B] leading-relaxed">
            This account is not approved for portal access.
          </p>
        </div>

        {/* Notice */}
        <div className="text-center space-y-3">
          <p className="text-[15px] text-[#52525B] leading-relaxed">
            If you believe this is an error, contact administration.
          </p>
          <a 
            href="mailto:admin@tribesassets.com" 
            className="inline-block text-[15px] font-medium text-[#0A0A0A] hover:underline"
          >
            admin@tribesassets.com
          </a>
        </div>

        {/* Back Link */}
        <p className="mt-10 text-center">
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
