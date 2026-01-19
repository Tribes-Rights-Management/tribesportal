import React from "react";
import { Loader2 } from "lucide-react";

/**
 * PrimaryButton - Institutional command button (Dark Theme)
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Background: light surface on dark (#E8E8E6 enabled), muted (#3A3A3C disabled)
 * - Text: dark (#111 enabled), muted (#6B6B6B disabled)
 * - Height: 48px (default), 44px (md)
 * - Radius: 12px - institutional
 * - Padding: generous horizontal
 * - NO gradient, NO glow, NO animation except spinner
 * 
 * Tone: Executing an instruction, not requesting permission.
 */
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  /** Fixed minimum width to prevent layout shift between states */
  minWidth?: string;
};

export function PrimaryButton({ 
  className = "", 
  loading, 
  loadingText = "Processing",
  minWidth,
  children, 
  disabled,
  ...rest 
}: Props) {
  const isDisabled = disabled || loading;
  
  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        "h-11 rounded-xl",
        "inline-flex items-center justify-center gap-2",
        "px-5",
        "text-[14px] font-semibold tracking-[-0.01em]",
        isDisabled 
          ? "bg-[#3A3A3C] cursor-not-allowed" 
          : "bg-[#E8E8E6] hover:bg-[#DCDCDA] active:bg-[#D0D0CE]",
        "transition-colors duration-100",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E8E6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C1F]",
        className,
      ].join(" ")}
      style={{ 
        color: isDisabled ? '#6B6B6B' : '#111111',
        minWidth: minWidth,
      }}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'inherit' }} />
          <span className="whitespace-nowrap">{loadingText}</span>
        </>
      ) : (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          {children}
        </span>
      )}
    </button>
  );
}
