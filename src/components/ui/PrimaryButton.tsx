import React from "react";

/**
 * PrimaryButton - Institutional command button
 * 
 * DESIGN STANDARD (AUTHORITATIVE):
 * - Background: solid black (enabled), muted (disabled)
 * - Text: white, perfectly centered
 * - Height: slightly taller than default (48px)
 * - Radius: moderate (8px), NOT pill
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
          ? "bg-[#D4D4D4] text-[#8A8A8A] cursor-not-allowed" 
          : "bg-[#111] text-white",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]",
        className,
      ].join(" ")}
    >
      <span className="min-w-0 text-center whitespace-nowrap">
        {loading ? "Please wait…" : children}
      </span>
    </button>
  );
}
