import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function NoAccessPage() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <h1 className="text-[28px] sm:text-[32px] font-medium text-[#0A0A0A] tracking-[-0.02em] leading-tight">
          Access not found
        </h1>
        
        {/* Primary text */}
        <p className="mt-6 text-[15px] text-[#6B6B6B] leading-relaxed">
          This email address does not have a portal access request on file.
        </p>

        {/* Secondary text */}
        <p className="mt-4 text-[14px] text-[#71717A] leading-relaxed">
          To request access, submit an access request or contact support.
        </p>

        {/* Support line */}
        <p className="mt-6 text-[14px] text-[#52525B]">
          <a 
            href="mailto:contact@tribesassets.com" 
            className="text-[#0A0A0A] hover:underline font-medium"
          >
            contact@tribesassets.com
          </a>
        </p>

        {/* Metadata */}
        {profile?.email && (
          <p className="mt-8 text-[12px] text-[#A1A1AA]">
            Signed in as: {profile.email}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="default"
            asChild
            className="text-[13px] bg-[#0A0A0A] hover:bg-[#262626]"
          >
            <a href="https://tribesassets.com/request-access" target="_blank" rel="noopener noreferrer">
              Request access
            </a>
          </Button>
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