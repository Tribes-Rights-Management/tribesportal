interface CheckEmailStateProps {
  email: string;
  onResend: () => void;
  onChangeEmail: () => void;
  isResending: boolean;
  resendMessage: string | null;
}

/**
 * CheckEmailState - Confirmation view for auth surface
 * 
 * LOCKED DESIGN TOKENS:
 * - Email pill: 14px font-medium, color #111, border #D1D1D6, radius 10px
 * - Body text: 14px, color #6B6B6B
 * - Primary button: height 48px, radius 10px, bg #111111, text white, font-medium, 15px, px-6, centered
 * - Secondary button: 14px, color #6B6B6B, hover darken
 */
export function CheckEmailState({ 
  email, 
  onResend, 
  onChangeEmail, 
  isResending,
  resendMessage 
}: CheckEmailStateProps) {
  return (
    <div className="space-y-5">
      {/* Email Pill */}
      <div className="flex justify-center">
        <div className="inline-flex justify-center px-4 py-3 rounded-[10px] border border-[#D1D1D6] bg-white">
          <span className="text-[14px] font-medium text-[#111] break-all">
            {email}
          </span>
        </div>
      </div>

      {/* Fine Print */}
      <p className="text-[14px] leading-[1.5] text-center text-[#6B6B6B]">
        This link expires shortly and can be used once.
      </p>

      {/* Inline Resend Message */}
      {resendMessage && (
        <p className="text-[14px] text-center text-[#111] font-medium">
          {resendMessage}
        </p>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-1">
        {/* Primary: Resend */}
        <button
          onClick={onResend}
          disabled={isResending}
          className="w-full h-[48px] flex items-center justify-center px-6 rounded-[10px] bg-[#111111] text-white text-[15px] font-medium transition-colors duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F7] disabled:bg-[#a3a3a3] disabled:cursor-not-allowed"
        >
          {isResending ? "Sending..." : "Resend sign-in link"}
        </button>

        {/* Secondary: Use different email */}
        <button
          onClick={onChangeEmail}
          className="w-full h-[48px] flex items-center justify-center text-[14px] text-[#6B6B6B] hover:text-[#374151] transition-colors duration-150"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}
