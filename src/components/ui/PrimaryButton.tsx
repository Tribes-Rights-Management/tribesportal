import React from "react";

/**
 * PrimaryButton - Institutional command button (Dark Theme)
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Background: light surface on dark (#E8E8E6 enabled), muted (#3A3A3C disabled)
 * - Text: dark (#111 enabled), muted (#6B6B6B disabled)
 * - Height: 48px
 * - Radius: 8px - institutional, NOT pill
 * - Padding: generous horizontal
 * - NO gradient, NO glow, NO animation
 * 
 * Tone: Executing an instruction, not requesting permission.
 */
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function PrimaryButton({ 
  className = "", 
  loading, 
  children, 
  disabled,
  ...rest 
}: Props) {
  const isDisabled = disabled || loading;
  
  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={[
        "w-full h-12 rounded-lg",
        "inline-flex items-center justify-center",
        "px-8",
        "text-[15px] font-medium tracking-[-0.01em]",
        isDisabled 
          ? "bg-[#3A3A3C] text-[#6B6B6B] cursor-not-allowed" 
          : "bg-[#E8E8E6] text-[#111] hover:bg-[#DCDCDA] active:bg-[#D0D0CE]",
        "transition-colors duration-100",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E8E6]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C1F]",
        className,
      ].join(" ")}
    >
      <span className="min-w-0 text-center whitespace-nowrap">
        {loading ? "Processing" : children}
      </span>
    </button>
  );
}
