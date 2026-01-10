import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SupportEmailRow } from "@/components/auth/SupportEmailRow";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { profile, signOut, refreshProfile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const handleCheckAgain = async () => {
    setIsChecking(true);
    setHasChecked(false);

    try {
      // Re-fetch profile and membership status
      await refreshProfile();
      
      // Navigate to root - RootRedirect will handle routing based on new state
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error checking access:", error);
      setHasChecked(true);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px]">
        {/* Title */}
        <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0A0A0A] tracking-[-0.02em] leading-tight">
          Access pending approval
        </h1>

        {/* Body copy */}
        <p className="mt-6 text-[15px] text-[#6B6B6B] leading-relaxed">
          Your sign-in was successful, but your account does not yet have access to Tribes.
        </p>
        <p className="mt-3 text-[15px] text-[#6B6B6B] leading-relaxed">
          If you believe this is an error, contact support.
        </p>

        {/* Status line */}
        <div className="mt-8 flex items-center gap-2">
          <span className="text-[13px] text-[#A1A1AA]">Status:</span>
          <span className="text-[13px] text-[#52525B] font-medium">Pending approval</span>
        </div>

        {/* Primary action */}
        <div className="mt-6">
          <Button
            onClick={handleCheckAgain}
            disabled={isChecking}
            className="w-full h-11 bg-[#0A0A0A] text-white text-[14px] font-medium hover:bg-[#1a1a1a] transition-colors"
          >
            {isChecking ? "Checking..." : "Check again"}
          </Button>
        </div>

        {/* Subtle confirmation after check */}
        {hasChecked && (
          <p className="mt-3 text-[13px] text-[#A1A1AA] text-center">
            Access still pending. Please try again later.
          </p>
        )}

        {/* Support row */}
        <div className="mt-8">
          <SupportEmailRow />
        </div>

        {/* Signed in as */}
        {profile?.email && (
          <p className="mt-8 text-[12px] text-[#A1A1AA]">
            Signed in as: {profile.email}
          </p>
        )}

        {/* Sign out link */}
        <div className="mt-4">
          <button
            onClick={signOut}
            className="text-[13px] text-[#71717A] hover:text-[#3F3F46] transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-[12px] text-[#A1A1AA]">
          Access is restricted to approved accounts.
        </p>
      </div>
    </div>
  );
}
