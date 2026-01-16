import React from "react";

/**
 * PrimaryButton - Institutional authority button
 * 
 * LOCKED SPECS (NON-NEGOTIABLE):
 * - Height: 44-48px
 * - Radius: 10-12px (NOT pill-like)
 * - Disabled: muted gray, clearly inactive
 * - Enabled: solid black, white text
 * - NO gradient, NO glow, NO animation
 * - Text: perfectly centered, generous padding
 * - Focus: subtle, not decorative
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
        "w-full h-[46px] rounded-[10px]",
        "inline-flex items-center justify-center",
        "px-6",
        "text-[15px] font-medium",
        // Institutional states: muted gray disabled, solid black enabled
        isDisabled 
          ? "bg-[#E5E5E5] text-[#9CA3AF] cursor-not-allowed" 
          : "bg-[#111] text-white",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        className,
      ].join(" ")}
    >
      <span className="min-w-0 text-center whitespace-nowrap">
        {loading ? "Please wait…" : children}
      </span>
    </button>
  );
}
