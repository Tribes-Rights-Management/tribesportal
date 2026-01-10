import { useLocation, Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email;

  // If no email in state, redirect to sign-in
  if (!email) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Auth Surface */}
      <div 
        className="w-full max-w-[440px] bg-white border border-[#E4E4E7] px-10 py-12 sm:px-12 sm:py-14"
        style={{ 
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#09090B] tracking-[-0.01em] leading-tight">
            Verify your identity
          </h1>
          <p className="mt-3 text-[14px] text-[#71717A] leading-relaxed">
            A secure access link has been sent to
          </p>
        </div>

        {/* Email Display */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[6px] py-4 px-5 mb-8">
          <p className="text-[15px] font-medium text-[#09090B] text-center break-all">
            {email}
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 text-center mb-8">
          <p className="text-[14px] text-[#52525B] leading-relaxed">
            Open the link in your email to complete authentication.
          </p>
          <p className="text-[13px] text-[#A1A1AA]">
            This link expires in 1 hour for security purposes.
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2 border-t border-[#F4F4F5]">
          <Button 
            variant="ghost" 
            asChild
            className="text-[13px] text-[#71717A] hover:text-[#09090B] hover:bg-transparent h-auto py-4 font-normal"
          >
            <Link to="/auth/sign-in">
              ← Return to sign in
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
