import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function PendingApprovalPage() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px] text-center">
        {/* Status Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#F4F4F5] flex items-center justify-center">
            <Clock className="h-8 w-8 text-[#71717A]" />
          </div>
        </div>

        {/* Header */}
        <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0A0A0A] tracking-[-0.02em] leading-tight">
          Access Pending
        </h1>
        
        <p className="mt-4 text-[15px] text-[#6B6B6B] leading-relaxed">
          Your account is registered but access has not yet been approved.
        </p>

        {/* Details */}
        <div className="mt-8 p-6 bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg">
          <p className="text-[13px] text-[#71717A] leading-relaxed">
            An administrator will review your access request. You will receive notification when your account is activated.
          </p>
          {profile?.email && (
            <p className="mt-4 text-[13px] text-[#3F3F46]">
              Registered as: <span className="font-medium">{profile.email}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <p className="text-[13px] text-[#A1A1AA]">
            Contact your organization administrator for status updates.
          </p>
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
