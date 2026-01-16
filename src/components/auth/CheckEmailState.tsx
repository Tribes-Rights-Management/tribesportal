interface CheckEmailStateProps {
  email: string;
  onResend: () => void;
  onChangeEmail: () => void;
  isResending: boolean;
  resendMessage: string | null;
}

/**
 * CheckEmailState - Confirmation view for auth surface
 * Premium institutional styling, light mode only
 */
export function CheckEmailState({ 
  email, 
  onResend, 
  onChangeEmail, 
  isResending,
  resendMessage 
}: CheckEmailStateProps) {
  return (
    <div className="space-y-6">
      {/* Email Pill */}
      <div className="flex justify-center">
        <div className="inline-flex justify-center px-4 py-3 rounded-[12px] border border-black/10 bg-white">
          <span className="text-[15px] font-medium text-[#111] break-all">
            {email}
          </span>
        </div>
      </div>

      {/* Fine Print */}
      <p className="text-[14px] leading-[1.5] text-center text-[#6B7280]">
        This link expires shortly and can be used once.
      </p>

      {/* Inline Resend Message */}
      {resendMessage && (
        <p className="text-[14px] text-center text-[#111] font-medium">
          {resendMessage}
        </p>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {/* Primary: Resend */}
        <button
          onClick={onResend}
          disabled={isResending}
          className="w-full h-[44px] inline-flex items-center justify-center text-center px-4 rounded-[12px] bg-[#111111] text-white text-[15px] font-semibold leading-[20px] tracking-[-0.01em] transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7] disabled:bg-[#a3a3a3] disabled:cursor-not-allowed"
        >
          <span className="text-center">{isResending ? "Sending..." : "Resend sign-in link"}</span>
        </button>

        {/* Secondary: Use different email */}
        <button
          onClick={onChangeEmail}
          className="w-full h-[44px] inline-flex items-center justify-center text-center text-[15px] text-[#6B7280] hover:text-[#374151] transition-colors duration-150"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}
