import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function PendingApprovalPage() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0A0A0A] tracking-[-0.02em] leading-tight">
          Access pending approval
        </h1>
        
        {/* Primary text */}
        <p className="mt-6 text-[15px] text-[#6B6B6B] leading-relaxed">
          Your sign-in was successful, but this account has not yet been approved for portal access.
        </p>

        {/* Secondary text */}
        <p className="mt-4 text-[14px] text-[#71717A] leading-relaxed">
          If you believe this is an error, please contact your Tribes representative or email support.
        </p>

        {/* Support line */}
        <p className="mt-6 text-[14px] text-[#52525B]">
          <a 
            href="mailto:admin@tribesassets.com" 
            className="text-[#0A0A0A] hover:underline font-medium"
          >
            admin@tribesassets.com
          </a>
        </p>

        {/* Metadata */}
        {profile?.email && (
          <p className="mt-8 text-[12px] text-[#A1A1AA]">
            Signed in as: {profile.email}
          </p>
        )}

        {/* Action */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={signOut}
            className="text-[13px] text-[#71717A] border-[#E4E4E7] hover:bg-[#FAFAFA] hover:text-[#3F3F46]"
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
