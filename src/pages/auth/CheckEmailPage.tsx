import { useLocation, Navigate, Link } from "react-router-dom";

export default function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email;

  // If no email in state, redirect to sign-in
  if (!email) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0A0A0A] tracking-[-0.02em] leading-tight">
            Verify your identity
          </h1>
          <p className="mt-3 text-[15px] text-[#6B6B6B] leading-relaxed">
            A secure access link has been sent to
          </p>
        </div>

        {/* Email Display */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[6px] py-4 px-5 mb-8">
          <p className="text-[15px] font-medium text-[#0A0A0A] text-center break-all">
            {email}
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 text-center">
          <p className="text-[15px] text-[#52525B] leading-relaxed">
            Open the link in your email to complete authentication.
          </p>
          <p className="text-[13px] text-[#A1A1AA]">
            This link expires in 1 hour for security purposes.
          </p>
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
